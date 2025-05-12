import { Context, CreateUserInput, LoginInput, CreateProductInput, UpdateProductInput, CreateCategoryInput, UpdateCategoryInput, CreateOrderInput, UpdateOrderStatusInput } from './types';
import { hashPassword, verifyPassword, generateToken, isAdmin } from './utils/auth';
import { UserRole, OrderStatus } from '@prisma/client';

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) throw new Error('Not authenticated');
      return user;
    },

    users: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user || !isAdmin(user)) throw new Error('Not authorized');
      return prisma.user.findMany();
    },

    products: async (_: any, { filter }: { filter?: { categoryId?: string; minPrice?: number; maxPrice?: number } }, { prisma }: Context) => {
      const where: any = {};
      if (filter?.categoryId) where.categoryId = filter.categoryId;
      if (filter?.minPrice || filter?.maxPrice) {
        where.price = {};
        if (filter.minPrice) where.price.gte = filter.minPrice;
        if (filter.maxPrice) where.price.lte = filter.maxPrice;
      }
      return prisma.product.findMany({ where, include: { category: true } });
    },

    product: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return prisma.product.findUnique({ where: { id }, include: { category: true } });
    },

    categories: async (_: any, __: any, { prisma }: Context) => {
      return prisma.category.findMany();
    },

    category: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return prisma.category.findUnique({ where: { id } });
    },

    orders: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) throw new Error('Not authenticated');
      if (isAdmin(user)) {
        return prisma.order.findMany({ include: { items: { include: { product: true } } } });
      }
      return prisma.order.findMany({
        where: { userId: user.id },
        include: { items: { include: { product: true } } }
      });
    },

    order: async (_: any, { id }: { id: string }, { prisma, user }: Context) => {
      if (!user) throw new Error('Not authenticated');
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } }
      });
      if (!order) throw new Error('Order not found');
      if (!isAdmin(user) && order.userId !== user.id) {
        throw new Error('Not authorized');
      }
      return order;
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: CreateUserInput }, { prisma }: Context) => {
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (existingUser) throw new Error('Email already registered');

      const hashedPassword = await hashPassword(input.password);
      const user = await prisma.user.create({
        data: {
          ...input,
          password: hashedPassword,
          role: input.role || UserRole.CUSTOMER,
        },
      });

      const token = generateToken(user);
      return { token, user };
    },

    login: async (_: any, { input }: { input: LoginInput }, { prisma }: Context) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user) throw new Error('Invalid credentials');

      const validPassword = await verifyPassword(input.password, user.password);
      if (!validPassword) throw new Error('Invalid credentials');

      const token = generateToken(user);
      return { token, user };
    },

    createProduct: async (_: any, { input }: { input: CreateProductInput }, { prisma, user }: Context) => {
      if (!user || !isAdmin(user)) throw new Error('Not authorized');
      return prisma.product.create({
        data: input,
        include: { category: true }
      });
    },

    updateProduct: async (_: any, { input }: { input: UpdateProductInput }, { prisma, user }: Context) => {
      if (!user || !isAdmin(user)) throw new Error('Not authorized');
      const { id, ...data } = input;
      return prisma.product.update({
        where: { id },
        data,
        include: { category: true }
      });
    },

    deleteProduct: async (_: any, { id }: { id: string }, { prisma, user }: Context) => {
      if (!user || !isAdmin(user)) throw new Error('Not authorized');
      await prisma.product.delete({ where: { id } });
      return true;
    },

    createCategory: async (_: any, { input }: { input: CreateCategoryInput }, { prisma, user }: Context) => {
      if (!user || !isAdmin(user)) throw new Error('Not authorized');
      return prisma.category.create({ data: input });
    },

    updateCategory: async (_: any, { input }: { input: UpdateCategoryInput }, { prisma, user }: Context) => {
      if (!user || !isAdmin(user)) throw new Error('Not authorized');
      const { id, ...data } = input;
      return prisma.category.update({
        where: { id },
        data
      });
    },

    createOrder: async (_: any, { input }: { input: CreateOrderInput }, { prisma, user }: Context) => {
      if (!user) throw new Error('Not authenticated');

      const products = await Promise.all(
        input.items.map(async (item) => {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error(`Product ${item.productId} not found`);
          if (product.inventory < item.quantity) {
            throw new Error(`Insufficient inventory for product ${product.name}`);
          }
          return { ...product, quantity: item.quantity };
        })
      );

      const totalAmount = products.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      );

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.PENDING,
          totalAmount,
          items: {
            create: products.map(product => ({
              productId: product.id,
              quantity: product.quantity,
              unitPrice: product.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Update product inventory
      await Promise.all(
        products.map(product =>
          prisma.product.update({
            where: { id: product.id },
            data: {
              inventory: {
                decrement: product.quantity
              }
            }
          })
        )
      );

      return order;
    },

    updateOrderStatus: async (_: any, { input }: { input: UpdateOrderStatusInput }, { prisma, user }: Context) => {
      if (!user || !isAdmin(user)) throw new Error('Not authorized');
      const { id, status } = input;
      return prisma.order.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    },
  },
}; 
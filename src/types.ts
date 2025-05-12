import { PrismaClient, User, UserRole } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
  user: User | null;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  inventory: number;
  categoryId: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  inventory?: number;
  categoryId?: string;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  description?: string;
}

export interface CreateOrderInput {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusInput {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
} 
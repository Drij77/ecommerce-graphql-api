export const typeDefs = `#graphql
  enum UserRole {
    ADMIN
    CUSTOMER
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String!
    orders: [Order!]
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    inventory: Int!
    category: Category!
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String!
    createdAt: String!
    updatedAt: String!
    products: [Product!]
  }

  type OrderItem {
    id: ID!
    order: Order!
    product: Product!
    quantity: Int!
    unitPrice: Float!
    createdAt: String!
    updatedAt: String!
  }

  type Order {
    id: ID!
    user: User!
    status: OrderStatus!
    totalAmount: Float!
    createdAt: String!
    updatedAt: String!
    items: [OrderItem!]
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateProductInput {
    name: String!
    description: String!
    price: Float!
    inventory: Int!
    categoryId: ID!
  }

  input UpdateProductInput {
    id: ID!
    name: String
    description: String
    price: Float
    inventory: Int
    categoryId: ID
  }

  input CreateCategoryInput {
    name: String!
    description: String!
  }

  input UpdateCategoryInput {
    id: ID!
    name: String
    description: String
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input UpdateOrderStatusInput {
    id: ID!
    status: OrderStatus!
  }

  type Query {
    me: User
    users: [User!]!
    products(filter: ProductFilterInput): [Product!]!
    product(id: ID!): Product
    categories: [Category!]!
    category(id: ID!): Category
    orders: [Order!]!
    order(id: ID!): Order
  }

  input ProductFilterInput {
    categoryId: ID
    minPrice: Float
    maxPrice: Float
  }

  type Mutation {
    register(input: CreateUserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createProduct(input: CreateProductInput!): Product!
    updateProduct(input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(input: UpdateCategoryInput!): Category!
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(input: UpdateOrderStatusInput!): Order!
  }
`; 
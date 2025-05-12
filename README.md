# E-Commerce Platform GraphQL API

A full-featured GraphQL API for an e-commerce platform, built with Apollo Server, PostgreSQL, and Prisma ORM.

---

## Features

- User registration, login, and JWT authentication
- Role-based access control (Admin/Customer)
- Product and category management (CRUD, filtering)
- Order management (create, update status, view details)
- Secure, efficient, and maintainable codebase

---

## Prerequisites

- Node.js v16+
- PostgreSQL 13+
- npm

---

## Setup Instructions

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd ecommerce-graphql-api
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**

   - Copy the provided `.env.example` template to `.env`:
     ```sh
     cp .env.example .env
     ```
   - Edit `.env` and fill in your real credentials/secrets as needed.

   **.env.example template:**
   ```env
   # PostgreSQL connection string
   DATABASE_URL="postgresql://postgres:admin@localhost:5432/ecommerce_db?schema=public"

   # JWT secret for signing tokens (change this in production!)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Port for the server to run on
   PORT=4000

   # Node environment (optional)
   NODE_ENV=development
   ```

4. **Create the database**

   Make sure PostgreSQL is running, then create the database:
   ```sh
   createdb -U postgres ecommerce_db
   ```
   *(Enter your password if prompted; default user/password in this example is `postgres`/`admin`.)*

5. **Run Prisma migrations**
   ```sh
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```sh
   npm run dev
   ```

   The API will be available at [http://localhost:4000/graphql](http://localhost:4000/graphql).

---

## API Documentation

### Authentication

#### Register
```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "password123"
    firstName: "John"
    lastName: "Doe"
    role: CUSTOMER
  }) {
    token
    user { id email role }
  }
}
```

#### Login
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    user { id email role }
  }
}
```
*Use the returned `token` as a Bearer token in the `Authorization` header for all protected operations.*

---

### Product & Category Management

#### Create Category (Admin)
```graphql
mutation {
  createCategory(input: { name: "Electronics", description: "Gadgets" }) {
    id name description
  }
}
```

#### Create Product (Admin)
```graphql
mutation {
  createProduct(input: {
    name: "Smartphone"
    description: "Latest model"
    price: 699.99
    inventory: 50
    categoryId: "<categoryId>"
  }) {
    id name price inventory category { id name }
  }
}
```

#### Query Products (with filters)
```graphql
query {
  products(filter: { categoryId: "<categoryId>", minPrice: 100, maxPrice: 1000 }) {
    id name price category { name }
  }
}
```

#### Update Product (Admin)
```graphql
mutation {
  updateProduct(input: {
    id: "<productId>"
    name: "Updated Name"
    price: 799.99
  }) {
    id name price
  }
}
```

#### Delete Product (Admin)
```graphql
mutation {
  deleteProduct(id: "<productId>")
}
```

---

### Orders

#### Create Order (Customer)
```graphql
mutation {
  createOrder(input: {
    items: [
      { productId: "<productId>", quantity: 2 }
    ]
  }) {
    id status totalAmount items { product { name } quantity unitPrice }
  }
}
```

#### Query Orders (Customer/Admin)
```graphql
query {
  orders {
    id status totalAmount items { product { name } quantity unitPrice }
  }
}
```

#### Update Order Status (Admin)
```graphql
mutation {
  updateOrderStatus(input: { id: "<orderId>", status: SHIPPED }) {
    id status
  }
}
```

---

### User Management

#### Get Current User
```graphql
query {
  me {
    id email firstName lastName role
  }
}
```

#### List All Users (Admin)
```graphql
query {
  users {
    id email role
  }
}
```

---

## Error Handling

- All errors are returned in standard GraphQL error format.
- Common errors: "Not authenticated", "Not authorized", "Invalid credentials", "Email already registered", "Insufficient inventory".

---

## Development

- `npm run dev` — Start development server with hot reload
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint
- `npm test` — Run tests

---

## License

MIT

---

**For any questions or issues, please open an issue or contact the maintainer.**

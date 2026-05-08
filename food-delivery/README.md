# 🍔 Food Delivery App

A full-stack food delivery platform built with **NestJS + PostgreSQL** (backend) and **React Native / Expo** (mobile). Designed following SOLID principles, clean architecture, repository pattern, and DTO separation.

---

## 📁 Project Structure

```
food-delivery/
├── backend/          # NestJS REST API + WebSockets
│   └── src/
│       ├── auth/             # JWT auth, guards, strategies
│       ├── users/            # Users + addresses
│       ├── restaurants/      # Restaurant management
│       ├── menu/             # Categories + menu items
│       ├── orders/           # Orders + real-time gateway
│       ├── drivers/          # Driver profiles + location
│       ├── common/           # Shared filters, interceptors, DTOs
│       ├── config/           # App / DB / JWT config
│       └── database/
│           └── migrations/   # TypeORM migrations
└── mobile/           # React Native (Expo) app
    └── src/
        ├── navigation/       # Stack + tab navigators
        ├── screens/          # All screens
        ├── components/       # Reusable UI components
        ├── stores/           # Zustand state management
        ├── services/         # API service layer
        ├── types/            # Shared TypeScript types
        └── theme/            # Colors, spacing, typography
```

---

## 🗄️ Database Schema

| Table             | Description                          |
|-------------------|--------------------------------------|
| `users`           | All user accounts (customer/owner/driver/admin) |
| `addresses`       | Delivery addresses per user          |
| `restaurants`     | Restaurant listings                  |
| `menu_categories` | Menu sections per restaurant         |
| `menu_items`      | Individual menu items                |
| `orders`          | Customer orders                      |
| `order_items`     | Line items within an order           |
| `drivers`         | Driver profiles + live location      |
| `reviews`         | Post-delivery ratings                |

---

## 🚀 Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secrets
```

### 3. Run migrations
```bash
npm run migration:run
```

### 4. Start the server
```bash
# Development
npm run start:dev

# Production
npm run build && npm run start:prod
```

### API docs (Swagger)
Visit: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 📱 Mobile Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator / physical device

### 1. Install dependencies
```bash
cd mobile
npm install
```

### 2. Configure API URL
Create a `.env` file:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 3. Start the app
```bash
npm start          # Expo Go
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

---

## 🔑 API Endpoints

### Auth
| Method | Path                | Description             |
|--------|---------------------|-------------------------|
| POST   | `/auth/register`    | Register new user       |
| POST   | `/auth/login`       | Login                   |
| POST   | `/auth/refresh`     | Refresh access token    |
| POST   | `/auth/logout`      | Logout                  |

### Users
| Method | Path                     | Description            |
|--------|--------------------------|------------------------|
| GET    | `/users/me`              | Get profile            |
| PATCH  | `/users/me`              | Update profile         |
| POST   | `/users/me/addresses`    | Add address            |
| GET    | `/users/me/addresses`    | List addresses         |
| DELETE | `/users/me/addresses/:id`| Delete address         |

### Restaurants
| Method | Path                   | Auth         |
|--------|------------------------|--------------|
| GET    | `/restaurants`         | Public       |
| GET    | `/restaurants/:id`     | Public       |
| POST   | `/restaurants`         | Owner/Admin  |
| PATCH  | `/restaurants/:id`     | Owner/Admin  |
| DELETE | `/restaurants/:id`     | Owner/Admin  |

### Menu
| Method | Path                                          | Auth         |
|--------|-----------------------------------------------|--------------|
| GET    | `/restaurants/:id/categories`                 | Public       |
| POST   | `/restaurants/:id/categories`                 | Owner/Admin  |
| GET    | `/restaurants/:id/items`                      | Public       |
| GET    | `/restaurants/:id/items/featured`             | Public       |
| POST   | `/restaurants/:id/items`                      | Owner/Admin  |
| PATCH  | `/restaurants/:id/items/:itemId`              | Owner/Admin  |
| DELETE | `/restaurants/:id/items/:itemId`              | Owner/Admin  |

### Orders
| Method | Path                                      | Auth         |
|--------|-------------------------------------------|--------------|
| POST   | `/orders`                                 | Customer     |
| GET    | `/orders/my`                              | Customer     |
| GET    | `/orders/:id`                             | Auth         |
| PATCH  | `/orders/:id/status`                      | Auth         |
| PATCH  | `/orders/:id/assign-driver/:driverId`     | Owner/Admin  |

### Drivers
| Method | Path                    | Auth    |
|--------|-------------------------|---------|
| POST   | `/drivers/profile`      | Driver  |
| GET    | `/drivers/profile`      | Driver  |
| PATCH  | `/drivers/status`       | Driver  |
| PATCH  | `/drivers/location`     | Driver  |
| GET    | `/drivers/available`    | Admin   |
| PATCH  | `/drivers/:id/verify`   | Admin   |

---

## ⚡ WebSocket Events (namespace: `/orders`)

| Event (client → server) | Payload     | Description             |
|--------------------------|-------------|-------------------------|
| `join-room`              | `roomId`    | Subscribe to a room     |
| `leave-room`             | `roomId`    | Unsubscribe             |

| Event (server → client) | Payload       | Description              |
|--------------------------|---------------|--------------------------|
| `new-order`              | `Order`       | New order for restaurant |
| `order-updated`          | `Order`       | Status change for customer |
| `driver-location`        | `{lat, lng}`  | Live driver position     |

---

## 🏗️ Design Principles

- **SOLID** — Single responsibility per module/service; interfaces separate from implementations
- **DDD-lite** — Entities, repositories, services, and controllers are cleanly separated
- **Repository Pattern** — TypeORM repositories injected via NestJS DI
- **DTO Pattern** — Request/response shapes (CreateDto, UpdateDto, ResponseDto) isolated from entities
- **Clean Architecture** — No business logic in controllers; controllers delegate to services
- **Guard layering** — JwtAuthGuard for authentication; RolesGuard for authorization
- **Global concerns** — Exception filter, transform interceptor, and validation pipe applied globally
- **Migrations** — Database schema versioned with TypeORM migrations (never `synchronize: true` in production)

---

## 🔧 Linting

```bash
# Backend
cd backend && npm run lint

# Mobile
cd mobile && npm run lint
cd mobile && npm run lint:fix
```

---

## 📦 Key Dependencies

### Backend
- `@nestjs/core` — Framework
- `@nestjs/jwt` + `passport-jwt` — JWT authentication
- `@nestjs/typeorm` + `typeorm` + `pg` — PostgreSQL ORM
- `@nestjs/swagger` — Auto-generated API docs
- `@nestjs/websockets` + `socket.io` — Real-time order updates
- `class-validator` + `class-transformer` — Request validation
- `bcrypt` — Password hashing
- `helmet` — HTTP security headers

### Mobile
- `expo` — React Native toolchain
- `@tanstack/react-query` — Server state management
- `zustand` — Client state (auth, cart)
- `axios` — HTTP client with interceptors
- `@react-navigation` — Navigation
- `expo-secure-store` — Secure token storage
- `socket.io-client` — Real-time updates
- `zod` — Runtime validation

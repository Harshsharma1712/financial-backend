# Financial Dashboard Backend

This is the backend for a role-based financial dashboard. It is built using **Node.js**, **Express**, **Drizzle ORM**, and **Neon Postgres Serverless**.

It features role-based access control (RBAC) with three distinct roles: `viewer`, `analyst`, and `admin`.

## 🚀 Setup & Installation

### 1. Install Dependencies
Make sure you have Node.js installed. Navigate to the `backend` directory and run:

```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory (if not already present) with the following variables:

```env
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require"
JWT_SECRET="your_super_secret_jwt_key"
PORT=3000
```

### 3. Database Schema setup (Optional)
The database schema is already defined under `src/db/schema`. If you need to generate or push migrations via Drizzle Kit:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`. On startup, it will automatically seed the default roles (`viewer`, `analyst`, `admin`) into the database if they don't already exist.

---

## 🔑 Authentication Workflow

All protected endpoints require a JWT token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

### Test Flow:
1. Register a new user via `POST /api/auth/signup`. By default, new users get the `viewer` role, but you can explicitly pass `"role": "admin"` or `"role": "analyst"` in the body during signup to automatically receive that role (for testing/convenience purposes).
2. Login via `POST /api/auth/login` to receive your JWT token.
3. Use this token in the `Authorization` header for subsequent requests.
4. *(Setup)* To test `admin` endpoints, ensure your user was signed up with `"role": "admin"`. Use your generated token when hitting admin-protected endpoints.

---

## 📝 API Endpoints

### 1. Auth (Public)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new user | `{ name, email, password, role? }` |
| POST | `/api/auth/login` | Login and get JWT | `{ email, password }` |

### 2. User Management (Admin Only)
| Method | Endpoint | Description | Payload/Query |
|---|---|---|---|
| GET | `/api/users` | List all users with roles | |
| GET | `/api/users/:id` | Get user by ID | |
| PUT | `/api/users/:id` | Update user | `{ name?, email?, status? }` |
| DELETE | `/api/users/:id` | Delete user | |
| POST | `/api/users/:id/roles` | Assign role to user | `{ roleId }` |
| DELETE | `/api/users/:id/roles/:roleId`| Revoke role | |

### 3. Categories
| Method | Endpoint | Access | Description | Payload |
|---|---|---|---|---|
| GET | `/api/categories` | Authenticated | List categories | |
| POST | `/api/categories` | Admin | Create category | `{ name }` |
| DELETE | `/api/categories/:id`| Admin | Delete category | |

### 4. Financial Records
| Method | Endpoint | Access | Description | Payload/Query |
|---|---|---|---|---|
| GET | `/api/records` | All Roles | List records (paginated) | `?type=income&page=1&limit=20` |
| GET | `/api/records/:id` | All Roles | Get single record | |
| POST | `/api/records` | Admin | Create record | `{ amount, type, categoryId, date, notes?, userId? }` |
| PUT | `/api/records/:id` | Admin | Update record | `{ amount, type, categoryId, date, notes? }` |
| DELETE | `/api/records/:id` | Admin | Delete record | |

*(Filters for GET `/api/records`: `type`, `categoryId`, `startDate`, `endDate`, `page`, `limit`)*

### 5. Dashboard & Analytics
All dashboard endpoints accept optional date filters: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | All Roles | Total income, expense, and balance |
| GET | `/api/dashboard/category-summary`| All Roles | Totals grouped by category |
| GET | `/api/dashboard/recent` | All Roles | Recent transactions (`?limit=5`) |
| GET | `/api/dashboard/trends` | Analyst, Admin | Monthly income/expense trends |

---

## 🧪 How to Test API Endpoints

We recommend using **Postman**, **Insomnia**, or the **VS Code Thunder Client** extension.

1. Create a `POST` request to `http://localhost:3000/api/auth/signup` with JSON body:
   ```json
   {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "role": "admin"
   }
   ```
2. Copy the `token` from the response.
3. For subsequent requests (e.g., `GET http://localhost:3000/api/dashboard/summary`), navigate to the **Headers** tab in your API client.
4. Add a new header:
   - Key: `Authorization`
   - Value: `Bearer <your_copied_token_here>`
5. Send the request to view the authorized response.

### Admin Testing Note
Because the signup endpoint specifically allows you to test different roles by passing `"role": "admin"` in the payload, you do not need to manually configure the Neon DB to start testing your administrative endpoints!

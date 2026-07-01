# AlphaFox – Crypto Portfolio Tracker

Full-stack app: users register/login, create portfolios, add crypto holdings (BTC, ETH, etc.), and view live-calculated investment, current value, profit/loss, top asset, and distribution.

## Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt, Joi validation, Swagger docs
- **Frontend:** React (Vite), React Router, Axios

## Folder Structure
```
portfolio-tracker/
├── backend/
│   └── src/
│       ├── config/       # env, db connection
│       ├── controllers/  # request handlers
│       ├── services/     # business logic
│       ├── repositories/ # DB access layer
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routers (v1)
│       ├── middlewares/  # auth, error handling, validation
│       ├── validations/  # Joi schemas
│       ├── utils/        # jwt, response helpers, seed script
│       ├── docs/         # Swagger spec
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── pages/         # Login, Register, Dashboard, PortfolioDetails, AdminDashboard
        ├── components/    # Navbar, Alert, ProtectedRoute
        ├── context/       # AuthContext
        └── api/           # axios client with auto token refresh
```

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env    # edit MONGO_URI / JWT secrets as needed
npm install

npm run dev               # starts on http://localhost:5000
```
Swagger docs: `http://localhost:8000/api-docs`  //for backup but mainly check on postman
Health check: `http://localhost:8000/health`

Seeded accounts (after `npm run seed`):
- Admin: `admin@example.com` / `admin123`
- User: `pranav@example.com` / `password123`

### 2. Frontend
```bash
cd frontend
cp .env     # points to backend API URL
npm install
npm run dev               # starts on http://localhost:5173
```
### for mongod- custom mongodb data directory
 ex. mongod --dbpath "E:\cryptoport\mongodb-data" 


## Authentication
- Access token (JWT, short-lived) returned in response body, stored in `localStorage`, sent as `Authorization: Bearer <token>`.
- Refresh token (JWT, long-lived) stored in an httpOnly cookie; `POST /api/v1/auth/refresh` issues a new access token. The frontend axios client auto-refreshes on 401.
- Passwords hashed with bcrypt (10 salt rounds).
- Role-based access: `user` vs `admin`, enforced via middleware (`authorize('admin')`).

## API Overview (`/api/v1`)

**Auth**
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
```

**Portfolios**
```
POST   /portfolios
GET    /portfolios?page=&limit=
GET    /portfolios/:id
PUT    /portfolios/:id
DELETE /portfolios/:id
GET    /portfolios/:id/summary        -> totalInvestment, currentValue, profit, profitPercentage
GET    /portfolios/:id/top-asset
GET    /portfolios/:id/distribution
```

**Assets** (supports pagination, search, sort, filter)
```
POST   /assets
GET    /assets?page=&limit=&search=&sort=-profit&symbol=BTC&portfolioId=...
GET    /assets/:id
PUT    /assets/:id
DELETE /assets/:id
```

**Admin** (role=admin only)
```
GET    /admin/users?page=&limit=
DELETE /admin/users/:id
GET    /admin/stats
```


## Calculated Fields (never stored, always derived)
```
investment       = quantity * buyPrice
currentValue     = quantity * currentPrice
profit           = currentValue - investment
profitPercentage = (profit / investment) * 100
```

## Security
- Password hashing with bcrypt
- JWT access + refresh token rotation, httpOnly refresh cookie
- Input validation with Joi on every write endpoint
- `helmet`, `cors` (restricted to client origin), `express-mongo-sanitize`, `xss-clean` for input sanitization
- Rate limiting (`express-rate-limit`) on all `/api` routes
- Centralized error handler that never leaks stack traces in production

## Scalability Notes (i think for now there is no need to implement this but when i want to set this project to production level then i implement all this..)
- **Layered architecture** (controller → service → repository) keeps business logic independent of Express and the DB driver, making it easy to swap MongoDB for another store or add a caching layer without touching controllers.
- **Horizontal scaling:** the API is stateless (JWT-based auth, no server-side sessions), so it can be run as multiple instances behind a load balancer (e.g. Nginx/ALB) with no sticky sessions required.
- **Caching:** hot-path reads like `/portfolios/:id/summary` and `/distribution` are good candidates for a Redis cache (short TTL, invalidated on asset write) to reduce DB load under high read traffic.
- **Database:** indexes are already added on `owner`, `portfolioId`, and a text index on `coinName`/`symbol` for search; for heavier scale, this could move to a sharded MongoDB cluster keyed on `owner`.
- **Microservices path:** Auth, Portfolio, and Asset domains are already separated into their own services/routes, so they could be split into independent deployable services behind an API gateway if traffic patterns demand it.
- **Deployment:** the backend is easily containerized (add a `Dockerfile` + `docker-compose.yml` with a Mongo service) and deployed to any container platform; the frontend builds to static assets (`npm run build`) servable via CDN.



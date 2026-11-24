# Cosmetics Invoice Management

A focused invoice-generation application for a cosmetics distribution business. It includes shopkeeper and product CRUD, invoice creation with server-calculated snapshots, searchable invoice history, dashboard totals, and downloadable/printable invoices.

## Requirements

- Node.js 20+
- MongoDB (local or hosted)

## Setup

1. Install dependencies from the project root:

   ```sh
   npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `JWT_SECRET`, and the initial admin credentials.
3. Start the frontend and API:

   ```sh
   npm run dev
   ```

   Vite runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.
4. Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`.

The first admin account is created using `npm run seed` from the project root. This command also inserts a small set of development-only sample shopkeepers and products when their collections are empty. It does not create permanent production sample records.

## Production

Set `CLIENT_URL` to the deployed frontend origin, provide a strong `JWT_SECRET`, and set the MongoDB connection string. Build the client with `npm run build`; run the API with `npm start` from the project root.

## API overview

- `POST /api/auth/login`
- `GET|POST /api/shopkeepers`, `GET|PUT|DELETE /api/shopkeepers/:id`
- `GET|POST /api/products`, `GET|PUT|DELETE /api/products/:id`
- `GET|POST /api/invoices`, `GET /api/invoices/:id`
- `GET /api/dashboard/summary`

All business endpoints require a bearer token. Invoice creation accepts shopkeeper and product codes; the API validates those codes, quantities, and current rates/discounts, then stores immutable detail snapshots.
"# A.L.M-co." 

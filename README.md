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

## Frontend structure

The React client is organized by responsibility:

- `frontend/src/App.jsx` handles authentication, page selection, notifications, and refresh state.
- `frontend/src/layout/AppShell.jsx` contains the shared navigation and responsive application shell.
- `frontend/src/pages/` contains the login, dashboard, invoice creation, invoice history, shopkeeper, and product pages.
- `frontend/src/components/` contains reusable invoice tables, preview/document UI, invoice editing, directory forms, and modals.
- `frontend/src/config/brand.js` keeps company and distributor names in one place.

## Production

Set `CLIENT_URL` to the deployed frontend origin, provide a strong `JWT_SECRET`, and set the MongoDB connection string. Build the client with `npm run build`; run the API with `npm start` from the project root.

## API overview

- `POST /api/auth/login`
- `GET|POST /api/shopkeepers`, `GET|PUT|DELETE /api/shopkeepers/:id`
- `GET|POST /api/products`, `GET|PUT|DELETE /api/products/:id`
- `GET|POST /api/invoices`, `GET /api/invoices/:id`
- `PUT /api/invoices/:id` (edit an existing invoice)
- `GET /api/dashboard/summary`

All business endpoints require a bearer token. Invoice creation accepts a shopkeeper code, the required name of the seller who brought the order, and product codes. The API validates the shopkeeper, seller name, product codes, quantities, and current rates/discounts, then stores immutable detail snapshots. Seller names are included in invoice history and printed/PDF invoices, and can be searched in invoice history.

Existing invoices can be opened from Invoice History and edited by shopkeeper/product code. Unchanged product rates and shopkeeper discounts retain their original invoice snapshots; replacing a product or changing the shopkeeper code uses the current catalogue rate or discount. The invoice number stays the same, and a seller name is required when saving edits.
"# A.L.M-co." 

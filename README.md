# LUXE — Fashion E-Commerce Platform

A production-ready full-stack clothing brand e-commerce platform built with React, Node.js, MongoDB, and integrated with Razorpay and Cloudinary.

---

## Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Frontend         | React 18 + Vite + Tailwind CSS |
| State Management | Redux Toolkit                  |
| Routing          | React Router v6                |
| HTTP Client      | Axios                          |
| Backend          | Node.js + Express.js           |
| Database         | MongoDB + Mongoose             |
| Auth             | JWT + bcrypt                   |
| Image Storage    | Cloudinary                     |
| Payments         | Razorpay                       |
| Email            | Nodemailer                     |

---

## Project Structure

```
fashion-store/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Reusable UI components
│   │   │   ├── layout/        # Header, Footer, Navbar
│   │   │   ├── home/          # Homepage sections
│   │   │   ├── shop/          # Shop, filters, product cards
│   │   │   ├── product/       # Product detail, gallery, reviews
│   │   │   ├── cart/          # Cart, wishlist
│   │   │   ├── checkout/      # Checkout, payment
│   │   │   ├── auth/          # Login, Register, Forgot Password
│   │   │   ├── account/       # Profile, orders, addresses
│   │   │   └── admin/         # Admin panel components
│   │   ├── pages/
│   │   │   ├── customer/      # All customer-facing pages
│   │   │   └── admin/         # Admin panel pages
│   │   ├── store/             # Redux store + slices
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helpers, formatters
│   │   ├── services/          # API service layer (Axios)
│   │   └── styles/            # Global CSS, Tailwind config
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                   # Node.js + Express API
│   └── src/
│       ├── controllers/       # Route handlers
│       ├── models/            # Mongoose schemas
│       ├── routes/            # Express routers
│       ├── middleware/        # Auth, validation, error handling
│       ├── utils/             # JWT, email, cloudinary helpers
│       ├── config/            # DB, env config
│       └── services/         # Business logic
│   ├── server.js
│   └── package.json
│
└── docs/                      # API docs, schema diagrams
```

---

## Installation

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

**backend/.env**

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=
```

**frontend/.env**

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## Deployment

### Backend (Railway / Render / EC2)

```bash
cd backend
npm start
```

Set all `.env` variables in your hosting dashboard.

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
# Deploy the /dist folder
```

Set `VITE_API_URL` to your production backend URL.

### MongoDB Atlas

Replace `MONGO_URI` with your Atlas connection string.

---

## API Documentation

See `docs/API.md` for full endpoint reference.

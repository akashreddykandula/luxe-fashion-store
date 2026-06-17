# LUXE Fashion — API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <token>` header.

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/auth/forgot-password` | No | Send reset email |
| PUT | `/auth/reset-password/:token` | No | Reset password |
| PUT | `/auth/update-password` | Yes | Change password |

---

## Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List products (with filters) |
| GET | `/products/:slug` | No | Get single product + related |
| GET | `/products/filter-options` | No | Get available filter values |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/products/:id/images` | Admin | Upload product images |
| DELETE | `/products/:id/images/:imageId` | Admin | Delete product image |

### Query Params for GET /products

| Param | Type | Example |
|-------|------|---------|
| `page` | number | `1` |
| `limit` | number | `12` |
| `sort` | string | `newest`, `popular`, `price-asc`, `price-desc`, `rating` |
| `category` | string | Category ID or slug |
| `gender` | string | `men`, `women`, `unisex`, `kids` |
| `minPrice` | number | `500` |
| `maxPrice` | number | `5000` |
| `sizes` | string | `S,M,L` (comma-separated) |
| `colors` | string | `White,Black` (comma-separated) |
| `brand` | string | `LUXE` |
| `rating` | number | `4` (minimum rating) |
| `inStock` | boolean | `true` |
| `isFeatured` | boolean | `true` |
| `isNewArrival` | boolean | `true` |
| `isBestSeller` | boolean | `true` |
| `isTrending` | boolean | `true` |
| `isOnSale` | boolean | `true` |
| `search` | string | Full-text search |

---

## Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List categories |
| GET | `/categories/:slug` | No | Get single category |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

---

## Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | Yes | Get user's cart |
| POST | `/cart` | Yes | Add item to cart |
| PUT | `/cart/:itemId` | Yes | Update item quantity |
| DELETE | `/cart/:itemId` | Yes | Remove item from cart |
| POST | `/cart/:itemId/save-later` | Yes | Toggle save for later |
| POST | `/cart/coupon` | Yes | Apply coupon code |
| DELETE | `/cart/coupon/remove` | Yes | Remove coupon |

---

## Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | Yes | Get wishlist |
| POST | `/wishlist/:productId` | Yes | Toggle product in wishlist |

---

## Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | Optional | Create order (guest or user) |
| GET | `/orders/my` | Yes | Get user's orders |
| GET | `/orders/:id` | Yes | Get single order |
| PUT | `/orders/:id/cancel` | Yes | Cancel order |
| POST | `/orders/:id/return` | Yes | Request return |

---

## Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/razorpay/create-order` | Yes | Create Razorpay order |
| POST | `/payments/razorpay/verify` | Yes | Verify payment signature |
| POST | `/payments/razorpay/refund` | Admin | Initiate refund |
| POST | `/payments/razorpay/webhook` | No | Razorpay webhook handler |

---

## Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews` | No | Get reviews (filter by product) |
| POST | `/reviews` | Yes | Create review |
| PUT | `/reviews/:id` | Yes | Update own review |
| DELETE | `/reviews/:id` | Yes | Delete own review |
| POST | `/reviews/:id/helpful` | Yes | Vote helpful |

---

## Coupons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/coupons/validate` | Yes | Validate coupon code |
| GET | `/coupons` | Admin | List all coupons |
| POST | `/coupons` | Admin | Create coupon |
| PUT | `/coupons/:id` | Admin | Update coupon |
| DELETE | `/coupons/:id` | Admin | Delete coupon |

---

## User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | Yes | Get profile |
| PUT | `/users/profile` | Yes | Update profile |
| POST | `/users/avatar` | Yes | Upload avatar |
| POST | `/users/address` | Yes | Add address |
| PUT | `/users/address/:id` | Yes | Update address |
| DELETE | `/users/address/:id` | Yes | Delete address |
| GET | `/users` | Admin | List all customers |
| PUT | `/users/:id/status` | Admin | Activate/deactivate user |

---

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard analytics |
| GET | `/admin/orders` | Admin | All orders (paginated) |
| PUT | `/admin/orders/:id/status` | Admin | Update order status |

---

## Banners

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/upload/banners` | No | Get banners |
| POST | `/upload/banners` | Admin | Upload banner |
| PUT | `/upload/banners/:id` | Admin | Update banner |
| DELETE | `/upload/banners/:id` | Admin | Delete banner |

---

## Newsletter & Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/newsletter/subscribe` | No | Subscribe to newsletter |
| POST | `/newsletter/unsubscribe` | No | Unsubscribe |
| POST | `/contact` | No | Submit contact form |

---

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Pagination

Paginated responses include:

```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "pages": 9,
  "products": []
}
```

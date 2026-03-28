# Technical PRD: Shoe E-commerce Platform

## Scope and Implementation Decisions

This PRD defines a production-oriented architecture for a shoe e-commerce platform with a separate Next.js frontend and Flask REST backend.

Key decisions for v1:

- Product catalog source of truth is the existing JSON dataset at `/home/dhir4j/Documents/RajWorks/SOLESTREET-SHOES/scraper/superkicks_data.json`.
- Product images are external URLs from that dataset. The backend does not store image binaries and does not provide image upload endpoints.
- Inventory is managed in PostgreSQL because the JSON dataset contains product/variant metadata but not reliable stock counts.
- Payment is UPI-based, with order creation first and payment verification later by admin.
- Frontend and backend are deployed separately.
- No Docker/containerization is included.

---

# 1. System Architecture

## High-Level Components

### Frontend
- Framework: Next.js with App Router
- Language: TypeScript
- Styling: TailwindCSS
- Data layer: Axios-based API client
- Responsibilities:
  - Render catalog, cart, checkout, account, and admin UI
  - Store session token and client-side cart state
  - Call Flask REST APIs
  - Render product images directly from external image URLs

### Backend
- Framework: Flask
- Architecture: REST API with Blueprints
- ORM: SQLAlchemy
- Auth: JWT
- Responsibilities:
  - User authentication and authorization
  - Catalog read APIs
  - Cart and order workflows
  - UPI payment submission and admin verification
  - JSON dataset import into PostgreSQL
  - Logging and validation

### Database
- Engine: PostgreSQL
- Responsibilities:
  - Store users, carts, orders, inventory, reviews, admin audit data
  - Store imported product metadata, variants, and image URLs
  - Store payment status and UPI reference data

### Image Storage
- Product images are not uploaded through Flask.
- Product image URLs are imported from the JSON dataset and stored in DB as external URLs.
- Frontend fetches those image URLs directly in the browser.
- Next.js `images.remotePatterns` must allow the dataset image host domains.

## Request Flow

### Catalog Browse Flow
`User -> Next.js Frontend -> Flask API -> PostgreSQL -> Flask API response -> Frontend render -> Browser loads product images from external URLs`

### Authentication Flow
1. User submits login/register form in Next.js.
2. Frontend calls Flask `/auth/register` or `/auth/login`.
3. Flask validates input, hashes password on register, verifies password on login.
4. Flask returns JWT and user profile.
5. Frontend stores token and attaches it to Axios requests.
6. Protected APIs validate JWT and load current user.

### Order Creation Flow
1. User reviews cart and submits checkout details.
2. Frontend sends authenticated `POST /orders`.
3. Backend validates cart items, prices, and stock availability.
4. Backend creates:
   - `orders` row with `payment_status = pending`
   - `order_items` snapshot rows
5. Backend returns order ID, total amount, UPI ID, and payment instructions.
6. Frontend displays payment screen.

### Payment Verification Flow
1. User pays using a UPI app outside the platform.
2. User submits UPI reference ID and optional screenshot URL/reference.
3. Backend updates order to `payment_status = submitted`.
4. Admin reviews submitted payments in admin panel.
5. Admin verifies payment and updates:
   - `payment_status = paid`
   - `order_status = processing`
6. Inventory is decremented only after payment verification in v1.

## Architectural Notes

- Frontend and backend run on different domains; backend must support CORS for the frontend origin.
- JWT auth is stateless at API level.
- Product images bypass backend to reduce bandwidth and PythonAnywhere file complexity.
- Payment screenshots should not be stored on server filesystem for catalog assets; if screenshot support is enabled, store a URL or external reference, not a product image upload.

---

# 2. Frontend Architecture (Next.js)

## Folder Structure

```text
frontend/
  app/
    (shop)/
      page.tsx
      products/
        page.tsx
        [productId]/
          page.tsx
      cart/
        page.tsx
      checkout/
        page.tsx
      orders/
        page.tsx
        [orderId]/
          page.tsx
      dashboard/
        page.tsx
      profile/
        page.tsx
      wishlist/
        page.tsx
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
    (admin)/
      admin/
        login/
          page.tsx
        dashboard/
          page.tsx
        products/
          page.tsx
          new/
            page.tsx
          [productId]/
            page.tsx
        inventory/
          page.tsx
        orders/
          page.tsx
        payments/
          page.tsx
        customers/
          page.tsx
  components/
    ui/
    layout/
    product/
    cart/
    checkout/
    order/
    admin/
    forms/
  lib/
    api/
      client.ts
      auth.ts
      products.ts
      cart.ts
      orders.ts
      reviews.ts
      admin.ts
    constants.ts
    storage.ts
    auth.ts
  hooks/
    useAuth.ts
    useCart.ts
    useProducts.ts
    useOrders.ts
    useAdminGuard.ts
  context/
    AuthProvider.tsx
  store/
    cart-store.ts
    wishlist-store.ts
    ui-store.ts
  types/
    api.ts
    auth.ts
    product.ts
    cart.ts
    order.ts
    review.ts
    admin.ts
  utils/
    currency.ts
    validators.ts
    image.ts
    pagination.ts
  styles/
    globals.css
  middleware.ts
```

## User Panel Pages

### Homepage
- Hero/banner sections
- Featured products
- Brand filters
- New arrivals
- Search entry point

### Product Listing Page
- Search, brand filter, price filter, size filter, sort
- Paginated grid
- Quick add to cart where variant is selected

### Product Detail Page
- Product info
- Variant selectors: size, color if applicable
- Image gallery
- Reviews
- Similar products
- Availability status by variant

### Cart Page
- Items, selected variants, quantity controls
- Price summary
- Remove item action
- Login prompt if guest user proceeds to checkout

### Checkout Page
- Shipping form
- Order summary
- UPI payment instructions after order creation
- Payment submission form for UPI reference

### Login Page
- Email/password login
- Redirect back to checkout/cart if applicable

### Register Page
- Name, email, password, phone optional
- Auto-login after success optional

### User Dashboard
- Account summary
- Recent orders
- Profile shortcuts

### Orders Page
- List of user orders
- Status badges
- Payment status badges

### Order Details Page
- Order items
- Shipping info
- Payment submission state
- Admin verification result

### Profile Settings Page
- Name, email, phone, address defaults
- Password change

### Wishlist Page (Optional)
- Local or authenticated wishlist
- Add to cart action

## Admin Panel Pages

### Admin Login
- Uses same auth API as user login
- UI blocks entry unless `role = admin`

### Admin Dashboard
- Order counts by status
- Pending payment verifications
- Low stock alerts
- Recent users/orders

### Product Management Page
- Imported product catalog list
- Search/filter by brand/status
- Re-sync/import action
- Activate/deactivate product
- Edit non-source fields only in v1:
  - active flag
  - featured flag
  - sort order
  - inventory linkage

### Add/Edit Product Page
Because catalog comes from JSON, this page should be interpreted as:
- Create DB-only manual product if business later requires it, or
- Edit metadata/overrides for imported products in v1

Do not implement product image upload here.

### Order Management Page
- All orders
- Filter by `payment_status` and `order_status`
- Update shipping/progress status

### Payment Verification Page
- Queue of `submitted` payment orders
- View UPI reference
- Approve/reject payment
- Record verifier and timestamp

### Inventory Management Page
- Variant-level stock editing
- Bulk stock import/update
- Low-stock filtering

### Customer Management Page
- User list
- Role view
- Order history lookup
- Account disable optional

## API Client Layer Using Axios

### Requirements
- Single Axios instance with:
  - `baseURL` from env
  - default JSON headers
  - request timeout
- Request interceptor:
  - attach JWT from auth store/local storage
- Response interceptor:
  - handle `401`
  - clear auth state
  - redirect to login
- Standardized error mapping:
  - validation errors
  - auth errors
  - network errors
  - server errors

## State Management

Recommended split:

- `React Context` for auth/session bootstrap
- `Zustand` for cart, wishlist, and lightweight UI state
- Do not use Redux in v1 unless state complexity grows significantly

Reason:
- Auth state is global but simple
- Cart interactions need easy mutation and local persistence
- Redux adds boilerplate without clear v1 benefit

## Form Handling

Use `react-hook-form` with schema validation.

Recommended:
- `react-hook-form` + `zod` on frontend
- Mirror backend validation rules for:
  - auth forms
  - shipping address
  - UPI reference submission
  - review submission
  - admin product/inventory updates

## Cart Persistence

### Guest User
- Persist cart in `localStorage`
- Store:
  - product ID
  - variant ID
  - quantity
  - unit price snapshot for UI only

### Authenticated User
- Backend cart becomes source of truth
- On login:
  - read local cart
  - replay each item through `/cart/add`
  - fetch server cart
  - clear local guest cart

### Sync Rules
- Variant ID is the stable merge key
- Backend price overrides frontend snapshot
- Backend stock validation determines final accepted quantity

## Route Protection

### User Routes
Protect:
- `/checkout`
- `/dashboard`
- `/orders`
- `/profile`
- `/wishlist` if server-backed

### Admin Routes
Protect:
- `/admin/*`

### Enforcement Layers
- `middleware.ts` for route-level redirects
- Client auth guard for hydration-safe checks
- Backend remains final source of authorization truth

---

# 3. Backend Architecture (Flask)

## Backend Project Structure

```text
backend/
  app/
    __init__.py
    extensions.py
    config.py
    models/
      user.py
      product.py
      product_variant.py
      product_image.py
      cart.py
      cart_item.py
      order.py
      order_item.py
      review.py
      audit_log.py
    routes/
      auth.py
      products.py
      cart.py
      orders.py
      reviews.py
      admin.py
    schemas/
      auth.py
      product.py
      cart.py
      order.py
      review.py
      admin.py
    services/
      auth_service.py
      product_service.py
      cart_service.py
      order_service.py
      payment_service.py
      inventory_service.py
      import_service.py
      review_service.py
      admin_service.py
    auth/
      decorators.py
      jwt_utils.py
      permissions.py
    utils/
      validators.py
      responses.py
      pagination.py
      logging.py
      errors.py
      url_normalizer.py
  migrations/
  scripts/
    import_products.py
  tests/
  run.py
```

## Flask Blueprints Organization

### `auth_bp`
- Registration
- Login
- Current user profile
- Password update optional

### `products_bp`
- Product listing
- Product detail
- Search/filter
- Product reviews read endpoint

### `cart_bp`
- Get cart
- Add/update/remove items
- Cart total calculation

### `orders_bp`
- Create order
- List user orders
- Get order details
- Submit UPI payment reference

### `reviews_bp`
- Create review
- Moderate/delete optional
- Product review listing if not grouped under products

### `admin_bp`
- Product admin
- Inventory admin
- User admin
- Order status admin
- Payment verification admin
- Import/sync operations

## Blueprint Registration

Use app factory pattern:

- `create_app(config_class)`
- initialize extensions:
  - SQLAlchemy
  - Flask-Migrate
  - Flask-Bcrypt
  - JWT helper
  - Flask-Limiter
  - CORS
- register blueprints with prefixes:
  - `/auth`
  - `/products`
  - `/cart`
  - `/orders`
  - `/reviews`
  - `/admin`

## Route Responsibilities

### Authentication
- register user
- login user
- return current user info from token

### Product Management
- read catalog
- read variants/images/reviews
- search/filter/sort
- admin upsert metadata and inventory overlays
- import from JSON dataset

### Cart Operations
- create implicit user cart
- add/update/remove items
- calculate totals from current product prices

### Order Processing
- validate cart
- create order snapshot
- submit payment details
- update order state after admin verification

### Reviews
- create review only for authenticated users
- optional rule: allow review only if user purchased delivered product
- product review listing with pagination

### Admin Management
- catalog sync
- order status transitions
- payment approval/rejection
- customer listing
- stock management
- audit logging

---

# 4. Database Schema

## Required Core Tables

### `users`
- `id BIGSERIAL PRIMARY KEY`
- `name VARCHAR(120) NOT NULL`
- `email VARCHAR(255) UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `role VARCHAR(20) NOT NULL DEFAULT 'user'`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Recommended additions:
- `phone VARCHAR(20)`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `updated_at TIMESTAMPTZ`

### `products`
- `id BIGSERIAL PRIMARY KEY`
- `name VARCHAR(255) NOT NULL`
- `description TEXT`
- `brand VARCHAR(120) NOT NULL`
- `price NUMERIC(10,2) NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Recommended additions:
- `slug VARCHAR(255) UNIQUE`
- `source_url TEXT UNIQUE`
- `primary_image_url TEXT`
- `color VARCHAR(100)`
- `about_title TEXT`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `updated_at TIMESTAMPTZ`

### `product_variants`
- `id BIGSERIAL PRIMARY KEY`
- `product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE`
- `size VARCHAR(50) NOT NULL`
- `color VARCHAR(100)`
- `stock_quantity INTEGER NOT NULL DEFAULT 0`

Recommended additions:
- `sku VARCHAR(100)`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`

Constraint:
- `UNIQUE(product_id, size, color)`

### `product_images`
Recommended normalized table for multiple image URLs:
- `id BIGSERIAL PRIMARY KEY`
- `product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE`
- `image_url TEXT NOT NULL`
- `sort_order INTEGER NOT NULL DEFAULT 0`

### `carts`
- `id BIGSERIAL PRIMARY KEY`
- `user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE`

Recommended additions:
- `updated_at TIMESTAMPTZ`

### `cart_items`
- `id BIGSERIAL PRIMARY KEY`
- `cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE`
- `product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE`
- `quantity INTEGER NOT NULL CHECK (quantity > 0)`

Constraint:
- `UNIQUE(cart_id, product_variant_id)`

### `orders`
- `id BIGSERIAL PRIMARY KEY`
- `user_id BIGINT NOT NULL REFERENCES users(id)`
- `total_price NUMERIC(10,2) NOT NULL`
- `payment_status VARCHAR(30) NOT NULL`
- `order_status VARCHAR(30) NOT NULL`
- `upi_reference VARCHAR(100)`
- `payment_screenshot TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Mandatory additions for shipping:
- `shipping_name VARCHAR(120) NOT NULL`
- `shipping_phone VARCHAR(20) NOT NULL`
- `shipping_address_line1 TEXT NOT NULL`
- `shipping_address_line2 TEXT`
- `shipping_city VARCHAR(120) NOT NULL`
- `shipping_state VARCHAR(120) NOT NULL`
- `shipping_postal_code VARCHAR(20) NOT NULL`
- `shipping_country VARCHAR(80) NOT NULL DEFAULT 'India'`

Mandatory additions for payment/admin workflow:
- `payment_submitted_at TIMESTAMPTZ`
- `payment_verified_at TIMESTAMPTZ`
- `payment_verified_by BIGINT REFERENCES users(id)`
- `payment_notes TEXT`

Recommended status values:
- `payment_status`: `pending`, `submitted`, `paid`, `rejected`, `refunded`
- `order_status`: `awaiting_payment`, `processing`, `shipped`, `delivered`, `cancelled`

### `order_items`
- `id BIGSERIAL PRIMARY KEY`
- `order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE`
- `product_variant_id BIGINT NOT NULL REFERENCES product_variants(id)`
- `quantity INTEGER NOT NULL CHECK (quantity > 0)`
- `price NUMERIC(10,2) NOT NULL`

Recommended additions:
- `product_name_snapshot VARCHAR(255) NOT NULL`
- `size_snapshot VARCHAR(50)`
- `color_snapshot VARCHAR(100)`

### `reviews`
- `id BIGSERIAL PRIMARY KEY`
- `product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE`
- `user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5)`
- `comment TEXT`

Recommended additions:
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Constraint:
- `UNIQUE(product_id, user_id)`

### `audit_logs`
Recommended for admin traceability:
- `id BIGSERIAL PRIMARY KEY`
- `admin_user_id BIGINT REFERENCES users(id)`
- `action VARCHAR(100) NOT NULL`
- `entity_type VARCHAR(50) NOT NULL`
- `entity_id BIGINT`
- `metadata JSONB`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

## Relationships

- `products -> product_variants` = 1:N
- `products -> product_images` = 1:N
- `users -> carts` = 1:1
- `carts -> cart_items` = 1:N
- `users -> orders` = 1:N
- `orders -> order_items` = 1:N
- `products -> reviews` = 1:N
- `users -> reviews` = 1:N

## Indexes

Create indexes for:
- `users(email)`
- `products(brand)`
- `products(name)`
- `products(slug)`
- `product_variants(product_id, size, color)`
- `orders(user_id, created_at DESC)`
- `orders(payment_status, order_status)`
- `orders(upi_reference)`
- `reviews(product_id)`

---

# 5. REST API Specification

## API Conventions

- Base path: `/api` optional but recommended
- JSON request/response only
- Auth via `Authorization: Bearer <jwt>`
- Pagination format:
  - `page`
  - `limit`
- Standard success format:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

- Standard error format:

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload",
    "fields": {
      "email": ["Invalid email"]
    }
  }
}
```

## Authentication

### `POST /auth/register`

Request:
```json
{
  "name": "Raj Sharma",
  "email": "raj@example.com",
  "password": "StrongPassword123",
  "phone": "9876543210"
}
```

Response:
```json
{
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "name": "Raj Sharma",
      "email": "raj@example.com",
      "role": "user"
    }
  },
  "error": null
}
```

### `POST /auth/login`

Request:
```json
{
  "email": "raj@example.com",
  "password": "StrongPassword123"
}
```

Response:
```json
{
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "name": "Raj Sharma",
      "email": "raj@example.com",
      "role": "user"
    }
  },
  "error": null
}
```

### `GET /auth/me`

Response:
```json
{
  "data": {
    "id": 1,
    "name": "Raj Sharma",
    "email": "raj@example.com",
    "role": "user"
  },
  "error": null
}
```

## Products

### `GET /products`
Query params:
- `page`
- `limit`
- `search`
- `brand`
- `size`
- `color`
- `min_price`
- `max_price`
- `sort`

Response:
```json
{
  "data": [
    {
      "id": 101,
      "name": "PREDATOR SALA",
      "brand": "adidas",
      "price": 11999.00,
      "primary_image_url": "https://www.superkicks.in/cdn/shop/files/1.png",
      "color": "BLUE/MULTI",
      "variants": [
        { "id": 1001, "size": "7", "color": "BLUE/MULTI", "stock_quantity": 4 }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 200
  },
  "error": null
}
```

### `GET /products/{id}`

Response:
```json
{
  "data": {
    "id": 101,
    "name": "PREDATOR SALA",
    "description": "Product description",
    "brand": "adidas",
    "price": 11999.00,
    "images": [
      "https://www.superkicks.in/cdn/shop/files/1.png",
      "https://www.superkicks.in/cdn/shop/files/2.png"
    ],
    "variants": [
      { "id": 1001, "size": "7", "color": "BLUE/MULTI", "stock_quantity": 4 }
    ],
    "details": {
      "article_code": "IH7091",
      "country_of_origin": "Indonesia"
    },
    "reviews": {
      "average_rating": 4.5,
      "count": 12
    }
  },
  "error": null
}
```

### `GET /products/search`
May be implemented as alias of `GET /products?search=...`

## Cart

### `GET /cart`

Response:
```json
{
  "data": {
    "id": 15,
    "items": [
      {
        "id": 1,
        "product_variant_id": 1001,
        "product_id": 101,
        "product_name": "PREDATOR SALA",
        "size": "7",
        "color": "BLUE/MULTI",
        "quantity": 2,
        "unit_price": 11999.00,
        "line_total": 23998.00,
        "image_url": "https://www.superkicks.in/cdn/shop/files/1.png"
      }
    ],
    "subtotal": 23998.00
  },
  "error": null
}
```

### `POST /cart/add`

Request:
```json
{
  "product_variant_id": 1001,
  "quantity": 1
}
```

Response:
```json
{
  "data": {
    "message": "Item added to cart"
  },
  "error": null
}
```

### `PUT /cart/update`

Request:
```json
{
  "product_variant_id": 1001,
  "quantity": 3
}
```

### `DELETE /cart/remove`

Request:
```json
{
  "product_variant_id": 1001
}
```

## Orders

### `POST /orders`

Request:
```json
{
  "shipping_name": "Raj Sharma",
  "shipping_phone": "9876543210",
  "shipping_address_line1": "Street 1",
  "shipping_address_line2": "Apartment 4B",
  "shipping_city": "Jaipur",
  "shipping_state": "Rajasthan",
  "shipping_postal_code": "302019",
  "shipping_country": "India"
}
```

Response:
```json
{
  "data": {
    "order_id": 501,
    "total_price": 23998.00,
    "payment_status": "pending",
    "order_status": "awaiting_payment",
    "upi": {
      "upi_id": "store@upi",
      "amount": 23998.00,
      "note": "Use order ID 501 as payment note where possible"
    }
  },
  "error": null
}
```

### `GET /orders`

Response:
```json
{
  "data": [
    {
      "id": 501,
      "total_price": 23998.00,
      "payment_status": "submitted",
      "order_status": "awaiting_payment",
      "created_at": "2026-03-11T10:00:00Z"
    }
  ],
  "error": null
}
```

### `GET /orders/{id}`

Response:
```json
{
  "data": {
    "id": 501,
    "items": [
      {
        "product_name_snapshot": "PREDATOR SALA",
        "size_snapshot": "7",
        "quantity": 2,
        "price": 11999.00
      }
    ],
    "total_price": 23998.00,
    "payment_status": "submitted",
    "order_status": "awaiting_payment",
    "upi_reference": "431245987654"
  },
  "error": null
}
```

### Recommended additional endpoint: `PUT /orders/{id}/payment`
This is required for the described UPI flow.

Request:
```json
{
  "upi_reference": "431245987654",
  "payment_screenshot": "https://external-storage.example/payment-proof.jpg"
}
```

Response:
```json
{
  "data": {
    "id": 501,
    "payment_status": "submitted",
    "order_status": "awaiting_payment"
  },
  "error": null
}
```

## Reviews

### `POST /reviews`

Request:
```json
{
  "product_id": 101,
  "rating": 5,
  "comment": "Comfortable fit and good grip."
}
```

Response:
```json
{
  "data": {
    "id": 77,
    "product_id": 101,
    "user_id": 1,
    "rating": 5,
    "comment": "Comfortable fit and good grip."
  },
  "error": null
}
```

### `GET /products/{id}/reviews`

Response:
```json
{
  "data": [
    {
      "id": 77,
      "user_name": "Raj Sharma",
      "rating": 5,
      "comment": "Comfortable fit and good grip."
    }
  ],
  "meta": {
    "average_rating": 4.6,
    "count": 12
  },
  "error": null
}
```

## Admin

Admin uses the same JWT mechanism but all routes require `role = admin`.

### `POST /admin/products`
For v1, use this for DB-backed manual products or metadata overrides.

### `PUT /admin/products/{id}`
- update active flag
- update featured flag
- update display metadata
- do not upload product images

### `DELETE /admin/products/{id}`
Soft delete recommended:
- set `is_active = false`

### `GET /admin/orders`
Query params:
- `payment_status`
- `order_status`
- `page`
- `limit`

### `PUT /admin/orders/{id}/status`

Request:
```json
{
  "order_status": "shipped"
}
```

### `PUT /admin/orders/{id}/verify-payment`

Request:
```json
{
  "approved": true,
  "notes": "Reference matched bank statement"
}
```

Response:
```json
{
  "data": {
    "id": 501,
    "payment_status": "paid",
    "order_status": "processing",
    "payment_verified_at": "2026-03-11T12:15:00Z"
  },
  "error": null
}
```

### `GET /admin/users`

Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Raj Sharma",
      "email": "raj@example.com",
      "role": "user",
      "created_at": "2026-03-10T08:00:00Z"
    }
  ],
  "error": null
}
```

---

# 6. Authentication & Security

## JWT Authentication
- Use JWT signed with `JWT_SECRET`
- Include:
  - `sub` = user ID
  - `role`
  - `exp`
- Send token in `Authorization` header
- Recommended expiry:
  - access token: 15 minutes to 24 hours depending on UX/security tradeoff
- Backend validates token on every protected route

## Password Hashing
- Use bcrypt via `Flask-Bcrypt`
- Never store plaintext passwords
- Enforce minimum password strength:
  - minimum length
  - mixed characters recommended

## Role-Based Access Control
- Roles:
  - `user`
  - `admin`
- Implement decorators:
  - `@jwt_required`
  - `@admin_required`
- All `/admin/*` routes require admin role

## Input Validation
- Validate all request payloads with schema layer
- Reject unexpected fields where possible
- Required validation examples:
  - email format
  - password length
  - quantity > 0
  - rating 1..5
  - UPI reference pattern length
  - order status enum values

## API Rate Limiting
Apply rate limits with `Flask-Limiter`:
- `/auth/login`: strict
- `/auth/register`: medium
- review creation: medium
- cart/order actions: moderate
- admin actions: moderate
- global IP-based fallback limit

## Admin Route Protection
- Backend role checks are mandatory even if frontend hides admin pages
- Log all admin write actions to `audit_logs`
- Restrict admin creation to seed/migration or secure manual DB action

## Additional Security Controls
- CORS whitelist for frontend domain only
- SQL injection prevention via ORM only
- HTML sanitize review/comment output on render
- Standard security headers at reverse proxy/app level
- Request ID generation for traceability
- Idempotency key support recommended for `POST /orders`

---

# 7. UPI Payment Flow

## Target Flow
1. User places order.
2. Backend creates order with `payment_status = pending`, `order_status = awaiting_payment`.
3. Frontend shows:
   - store UPI ID
   - amount
   - order ID
   - payment instructions
4. User pays in UPI app.
5. User submits:
   - UPI reference ID
   - optional screenshot URL/reference
6. Backend updates order to `payment_status = submitted`.
7. Admin verifies payment manually.
8. Admin marks payment as paid.
9. Backend changes order to `order_status = processing`.

## Required DB Fields
In `orders`:
- `payment_status`
- `order_status`
- `upi_reference`
- `payment_screenshot`
- `payment_submitted_at`
- `payment_verified_at`
- `payment_verified_by`
- `payment_notes`

## API Requirements
- `POST /orders` creates unpaid order
- `PUT /orders/{id}/payment` submits UPI reference
- `PUT /admin/orders/{id}/verify-payment` approves/rejects

## Verification Rules
- User can submit payment only for own order
- Cannot resubmit if already `paid` unless admin resets
- Admin can mark:
  - approved -> `paid` + `processing`
  - rejected -> `rejected` + keep `awaiting_payment` or `cancelled`

## Inventory Rule for v1
- Do not decrement stock at initial order creation
- Re-check stock at payment verification time
- If stock became unavailable before payment verification:
  - admin cannot approve without manual override
  - order moves to exception flow

This is simpler than reservation-based inventory and fits manual UPI flow.

---

# 8. Product Data Source (Pre-Existing JSON Dataset)

## Dataset Source
Use:
`/home/dhir4j/Documents/RajWorks/SOLESTREET-SHOES/scraper/superkicks_data.json`

Observed structure:
- top-level `brands[]`
- each brand contains:
  - `name`
  - `brand_info`
  - `products[]`
- each product contains:
  - `url`
  - `brand`
  - `product_name`
  - `color`
  - `price`
  - `images[]`
  - `sizes[]`
  - `about`
  - `details`

## Import Requirements

### Import Strategy
Create a backend import command:
```text
python scripts/import_products.py --source ../scraper/superkicks_data.json
```

### Mapping
- `product_name -> products.name`
- `about.description -> products.description`
- `brand -> products.brand`
- `price -> products.price`
- `url -> products.source_url`
- first image -> `products.primary_image_url`
- all images -> `product_images.image_url`
- each size -> one `product_variants` row
- `color -> product_variants.color`
- `details['Article Code'] -> product_variants.sku` or product metadata if added

### Transformations
Importer must:
- strip currency symbol and commas from `price` like `₹11,999`
- normalize to numeric `11999.00`
- normalize image URLs to absolute HTTPS URLs because dataset entries may omit the scheme
- trim whitespace
- de-duplicate products by `source_url`
- upsert variants by `(product_id, size, color)`

### Stock Handling
The dataset does not provide reliable stock counts.
Therefore:
- import variants with `stock_quantity = 0` by default, or
- import with configurable initial stock policy

Recommended:
- initialize to `0`
- admin inventory page updates stock after import

### Re-Import Behavior
Re-import must:
- update product metadata
- update image URLs
- add/remove variant sizes based on dataset
- preserve admin-managed stock unless explicitly overridden by a force flag

## Important Constraint
Do not use server filesystem as persistent catalog storage.
Use:
- JSON dataset as source input
- PostgreSQL as queryable application datastore
- external URLs for images

The backend should not handle product image uploads.

---

# 9. PythonAnywhere Deployment

## Deployment Architecture
`Internet -> PythonAnywhere WSGI -> Flask App -> PostgreSQL`

Frontend is deployed separately on Vercel or another Node host.

## Flask WSGI Configuration
PythonAnywhere WSGI file should:
- set project path
- activate virtualenv
- import app factory
- instantiate Flask app

Expected pattern:
```python
from app import create_app
application = create_app()
```

## Environment Variables
Set via PythonAnywhere web app configuration or startup environment.

Required:
- `DATABASE_URL`
- `JWT_SECRET`
- `UPI_ID`
- `ADMIN_EMAIL`
- `UPLOAD_FOLDER`

Recommended extras:
- `FLASK_ENV`
- `CORS_ORIGINS`
- `LOG_LEVEL`
- `PRODUCT_DATASET_PATH`

## Database Connection Configuration
- Use PostgreSQL connection string from env
- Initialize SQLAlchemy from `DATABASE_URL`
- Run migrations during deployment
- Ensure SSL mode if external DB requires it

## Static File Handling
- Backend serves API only
- Product images are external URLs and not served by Flask
- If optional payment screenshot upload is enabled later, do not use PythonAnywhere local disk as durable storage for long-term assets

## Domain Routing
- Frontend domain calls backend domain over HTTPS
- Backend must allow frontend origin in CORS config
- Axios base URL must point to PythonAnywhere API domain

---

# 10. Environment Variables

## Required

### `DATABASE_URL`
PostgreSQL connection string.

Example:
```text
postgresql://user:password@host:5432/dbname
```

### `JWT_SECRET`
Secret used to sign JWT tokens.

### `UPI_ID`
Merchant/store UPI ID displayed to users during checkout.

### `ADMIN_EMAIL`
Default bootstrap admin email or admin notifications target.

### `UPLOAD_FOLDER`
Reserved only for optional temporary uploads such as payment proof handling.
Not used for product image storage.
If screenshot upload is disabled, keep defined but unused.

## Recommended Additional Variables
- `CORS_ORIGINS`
- `LOG_LEVEL`
- `PRODUCT_DATASET_PATH`
- `NEXT_PUBLIC_API_BASE_URL` on frontend

---

# 11. Logging

## Requirements
Use structured JSON logging for backend events.

## Log Categories

### API Requests
Fields:
- `timestamp`
- `request_id`
- `method`
- `path`
- `status_code`
- `duration_ms`
- `user_id`
- `ip`

### Errors
Fields:
- `request_id`
- `exception_type`
- `message`
- `stack_trace`
- `user_id`
- `path`

### Order Creation
Fields:
- `order_id`
- `user_id`
- `total_price`
- `item_count`
- `payment_status`

### Payment Verification
Fields:
- `order_id`
- `upi_reference`
- `admin_user_id`
- `approved`
- `notes`

### Admin Actions
Fields:
- `admin_user_id`
- `action`
- `entity_type`
- `entity_id`
- `changes`

## Implementation
- Use Python `logging` with JSON formatter
- Attach `request_id` per request
- Avoid logging plaintext passwords, tokens, or full payment screenshots

---

# 12. Testing Strategy

## Backend

### Unit Tests
Use `pytest` for:
- auth service
- password hashing
- JWT utilities
- price parsing from JSON dataset
- image URL normalization
- cart calculations
- order status transitions
- payment verification rules

### API Integration Tests
Use Flask test client against a test PostgreSQL database for:
- register/login/me
- products list/detail
- cart add/update/remove
- order creation
- payment submission
- admin payment verification
- admin inventory update

## Frontend

### Component Tests
Use React Testing Library with Vitest or Jest for:
- product card
- variant selector
- cart summary
- checkout form
- payment submission form
- admin order status controls

### Page Tests
Test App Router pages for:
- products page rendering from API
- product detail variant selection
- cart page totals
- checkout authentication redirect
- admin route protection

### End-to-End Critical Flows
Use Playwright for:
- login
- add to cart
- checkout
- order creation
- payment submission
- admin payment approval

## Critical Flows to Cover
- user registration and login
- guest cart to authenticated cart merge
- add/remove/update cart items
- checkout with shipping form
- order creation with pending payment
- UPI reference submission
- admin payment verification
- stock update and low-stock validation

---

# 13. Development Workflow

## Repository Structure

```text
SOLESTREET-SHOES/
  frontend/
  backend/
  scraper/
```

- `frontend/` contains Next.js app
- `backend/` contains Flask API
- `scraper/` contains external dataset and scraping utilities

## Branching Strategy
- `main` -> production
- `dev` -> integration branch
- `feature/*` -> feature branches
- `hotfix/*` -> urgent production fixes

## Workflow
1. Create feature branch from `dev`
2. Implement feature with tests
3. Open pull request
4. Run code review
5. Merge to `dev`
6. Perform staging verification
7. Merge/release to `main`

## Engineering Standards
- TypeScript strict mode enabled
- Python linting and formatting enforced
- Alembic migrations required for schema changes
- API contracts documented and versioned
- No Docker required for local or deployment workflow

## Suggested Delivery Order
1. DB schema + Flask app factory + auth
2. JSON import pipeline + catalog APIs
3. cart APIs + frontend catalog/cart UI
4. order creation + UPI payment submission
5. admin payment verification + inventory admin
6. reviews + dashboard polish + testing hardening

This PRD is sufficient to begin implementation immediately. The only unresolved business-side decisions that may need confirmation are:
- whether payment screenshot upload is enabled at all in v1
- whether admin can create fully manual products, or only manage imported catalog metadata/inventory

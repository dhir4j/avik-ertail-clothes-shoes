-- ============================================================
-- SOLESTREET SHOES - Complete Database Schema
-- Engine: PostgreSQL
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   TEXT            NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20)     NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin')),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

ALTER TABLE users
    ADD CONSTRAINT uq_users_email UNIQUE (email);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    description         TEXT,
    brand               VARCHAR(120)    NOT NULL,
    price               NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    slug                VARCHAR(255),
    source_url          TEXT,
    primary_image_url   TEXT,
    color               VARCHAR(100),
    about_title         TEXT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    is_featured         BOOLEAN         NOT NULL DEFAULT FALSE,
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

ALTER TABLE products
    ADD CONSTRAINT uq_products_slug       UNIQUE (slug),
    ADD CONSTRAINT uq_products_source_url UNIQUE (source_url);

-- ------------------------------------------------------------
-- product_variants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size            VARCHAR(50)     NOT NULL,
    color           VARCHAR(100),
    sku             VARCHAR(100),
    stock_quantity  INTEGER         NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE
);

ALTER TABLE product_variants
    ADD CONSTRAINT uq_variant_product_size_color UNIQUE (product_id, size, color);

-- ------------------------------------------------------------
-- product_images
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   TEXT    NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- carts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    updated_at  TIMESTAMPTZ
);

ALTER TABLE carts
    ADD CONSTRAINT uq_carts_user_id UNIQUE (user_id);

-- ------------------------------------------------------------
-- cart_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id                  BIGSERIAL   PRIMARY KEY,
    cart_id             BIGINT      NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_variant_id  BIGINT      NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity            INTEGER     NOT NULL CHECK (quantity > 0)
);

ALTER TABLE cart_items
    ADD CONSTRAINT uq_cart_items_cart_variant UNIQUE (cart_id, product_variant_id);

-- ------------------------------------------------------------
-- orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                      BIGSERIAL       PRIMARY KEY,
    user_id                 BIGINT          NOT NULL REFERENCES users(id),
    total_price             NUMERIC(10, 2)  NOT NULL CHECK (total_price >= 0),

    -- Status fields
    payment_status          VARCHAR(30)     NOT NULL DEFAULT 'pending'
                                CHECK (payment_status IN (
                                    'pending', 'submitted', 'paid', 'rejected', 'refunded'
                                )),
    order_status            VARCHAR(30)     NOT NULL DEFAULT 'awaiting_payment'
                                CHECK (order_status IN (
                                    'awaiting_payment', 'processing', 'shipped', 'delivered', 'cancelled'
                                )),

    -- UPI payment fields
    upi_reference           VARCHAR(100),
    payment_screenshot      TEXT,
    payment_submitted_at    TIMESTAMPTZ,
    payment_verified_at     TIMESTAMPTZ,
    payment_verified_by     BIGINT          REFERENCES users(id),
    payment_notes           TEXT,

    -- Shipping fields
    shipping_name           VARCHAR(120)    NOT NULL,
    shipping_phone          VARCHAR(20)     NOT NULL,
    shipping_address_line1  TEXT            NOT NULL,
    shipping_address_line2  TEXT,
    shipping_city           VARCHAR(120)    NOT NULL,
    shipping_state          VARCHAR(120)    NOT NULL,
    shipping_postal_code    VARCHAR(20)     NOT NULL,
    shipping_country        VARCHAR(80)     NOT NULL DEFAULT 'India',

    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- order_items  (snapshot at order creation time)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id                      BIGSERIAL       PRIMARY KEY,
    order_id                BIGINT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id      BIGINT          NOT NULL REFERENCES product_variants(id),
    quantity                INTEGER         NOT NULL CHECK (quantity > 0),
    price                   NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    -- Immutable snapshots so order history survives catalog edits
    product_name_snapshot   VARCHAR(255)    NOT NULL,
    size_snapshot           VARCHAR(50),
    color_snapshot          VARCHAR(100)
);

-- ------------------------------------------------------------
-- reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGSERIAL   PRIMARY KEY,
    product_id  BIGINT      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ
);

ALTER TABLE reviews
    ADD CONSTRAINT uq_reviews_product_user UNIQUE (product_id, user_id);

-- ------------------------------------------------------------
-- audit_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL   PRIMARY KEY,
    admin_user_id   BIGINT      REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50)  NOT NULL,
    entity_id       BIGINT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users (email);

-- products
CREATE INDEX IF NOT EXISTS idx_products_brand
    ON products (brand);

CREATE INDEX IF NOT EXISTS idx_products_name
    ON products (name);

CREATE INDEX IF NOT EXISTS idx_products_slug
    ON products (slug);

CREATE INDEX IF NOT EXISTS idx_products_is_active_featured
    ON products (is_active, is_featured);

CREATE INDEX IF NOT EXISTS idx_products_price
    ON products (price);

-- product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
    ON product_variants (product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_size_color
    ON product_variants (product_id, size, color);

-- product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
    ON product_images (product_id, sort_order);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created
    ON orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_payment_order_status
    ON orders (payment_status, order_status);

CREATE INDEX IF NOT EXISTS idx_orders_upi_reference
    ON orders (upi_reference);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id
    ON reviews (product_id);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id
    ON audit_logs (admin_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON audit_logs (entity_type, entity_id);

-- ============================================================
-- TRIGGERS  –  auto-update updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- VIEWS
-- ============================================================

-- Product listing view (used by catalog API)
CREATE OR REPLACE VIEW v_product_listing AS
SELECT
    p.id,
    p.name,
    p.brand,
    p.price,
    p.slug,
    p.primary_image_url,
    p.color,
    p.is_active,
    p.is_featured,
    p.sort_order,
    COALESCE(AVG(r.rating), 0)::NUMERIC(3, 2)  AS avg_rating,
    COUNT(DISTINCT r.id)                         AS review_count,
    SUM(pv.stock_quantity)                       AS total_stock
FROM products p
LEFT JOIN reviews r         ON r.product_id = p.id
LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = TRUE
WHERE p.is_active = TRUE
GROUP BY p.id;

-- Admin order queue: submitted-payment orders pending verification
CREATE OR REPLACE VIEW v_pending_payment_orders AS
SELECT
    o.id           AS order_id,
    o.user_id,
    u.name         AS customer_name,
    u.email        AS customer_email,
    o.total_price,
    o.upi_reference,
    o.payment_screenshot,
    o.payment_submitted_at,
    o.shipping_name,
    o.shipping_phone,
    o.created_at
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.payment_status = 'submitted'
ORDER BY o.payment_submitted_at ASC;

-- Low stock variant alert view (stock <= 5)
CREATE OR REPLACE VIEW v_low_stock_variants AS
SELECT
    pv.id           AS variant_id,
    pv.product_id,
    p.name          AS product_name,
    p.brand,
    pv.size,
    pv.color,
    pv.sku,
    pv.stock_quantity
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity <= 5
  AND pv.is_active = TRUE
  AND p.is_active  = TRUE
ORDER BY pv.stock_quantity ASC, p.name ASC;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert bootstrap admin user (password must be updated via bcrypt)
-- The placeholder hash below is NOT a valid bcrypt hash;
-- replace it by running: python -c "from flask_bcrypt import Bcrypt; print(Bcrypt().generate_password_hash('CHANGE_ME').decode())"
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Admin',
    'admin@solestreet.in',
    '$2b$12$placeholder_replace_this_with_real_bcrypt_hash_xxxxxx',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

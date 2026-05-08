import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ENUM types
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM (
        'customer', 'restaurant_owner', 'driver', 'admin'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE order_status_enum AS ENUM (
        'pending', 'confirmed', 'preparing',
        'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE driver_status_enum AS ENUM (
        'offline', 'available', 'on_delivery'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE restaurant_status_enum AS ENUM (
        'pending_approval', 'active', 'suspended', 'closed'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE payment_status_enum AS ENUM (
        'pending', 'paid', 'failed', 'refunded'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE payment_method_enum AS ENUM (
        'cash', 'card', 'wallet'
      )
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE users (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email       VARCHAR(255) NOT NULL UNIQUE,
        phone       VARCHAR(20),
        password    VARCHAR(255) NOT NULL,
        first_name  VARCHAR(100) NOT NULL,
        last_name   VARCHAR(100) NOT NULL,
        role        user_role_enum NOT NULL DEFAULT 'customer',
        avatar_url  VARCHAR(500),
        is_active   BOOLEAN NOT NULL DEFAULT true,
        refresh_token_hash VARCHAR(255),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Addresses table
    await queryRunner.query(`
      CREATE TABLE addresses (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        label         VARCHAR(50) NOT NULL DEFAULT 'Home',
        street        VARCHAR(255) NOT NULL,
        city          VARCHAR(100) NOT NULL,
        state         VARCHAR(100) NOT NULL,
        zip_code      VARCHAR(20) NOT NULL,
        country       VARCHAR(100) NOT NULL DEFAULT 'US',
        latitude      DECIMAL(10,8),
        longitude     DECIMAL(11,8),
        is_default    BOOLEAN NOT NULL DEFAULT false,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Restaurants table
    await queryRunner.query(`
      CREATE TABLE restaurants (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name            VARCHAR(255) NOT NULL,
        description     TEXT,
        cuisine_type    VARCHAR(100),
        logo_url        VARCHAR(500),
        banner_url      VARCHAR(500),
        phone           VARCHAR(20),
        email           VARCHAR(255),
        street          VARCHAR(255) NOT NULL,
        city            VARCHAR(100) NOT NULL,
        state           VARCHAR(100) NOT NULL,
        zip_code        VARCHAR(20) NOT NULL,
        latitude        DECIMAL(10,8),
        longitude       DECIMAL(11,8),
        status          restaurant_status_enum NOT NULL DEFAULT 'pending_approval',
        rating          DECIMAL(3,2) DEFAULT 0.00,
        total_ratings   INTEGER DEFAULT 0,
        min_order_amount DECIMAL(10,2) DEFAULT 0.00,
        delivery_fee    DECIMAL(10,2) DEFAULT 0.00,
        estimated_delivery_time INTEGER DEFAULT 30,
        is_open         BOOLEAN NOT NULL DEFAULT true,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Menu categories table
    await queryRunner.query(`
      CREATE TABLE menu_categories (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name          VARCHAR(100) NOT NULL,
        description   TEXT,
        sort_order    INTEGER DEFAULT 0,
        is_active     BOOLEAN NOT NULL DEFAULT true,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Menu items table
    await queryRunner.query(`
      CREATE TABLE menu_items (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        category_id   UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
        name          VARCHAR(255) NOT NULL,
        description   TEXT,
        price         DECIMAL(10,2) NOT NULL,
        image_url     VARCHAR(500),
        is_available  BOOLEAN NOT NULL DEFAULT true,
        is_featured   BOOLEAN NOT NULL DEFAULT false,
        preparation_time INTEGER DEFAULT 15,
        calories      INTEGER,
        sort_order    INTEGER DEFAULT 0,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Drivers table
    await queryRunner.query(`
      CREATE TABLE drivers (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        license_number  VARCHAR(50),
        vehicle_type    VARCHAR(50),
        vehicle_plate   VARCHAR(20),
        status          driver_status_enum NOT NULL DEFAULT 'offline',
        current_lat     DECIMAL(10,8),
        current_lng     DECIMAL(11,8),
        rating          DECIMAL(3,2) DEFAULT 0.00,
        total_deliveries INTEGER DEFAULT 0,
        is_verified     BOOLEAN NOT NULL DEFAULT false,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Orders table
    await queryRunner.query(`
      CREATE TABLE orders (
        id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id         UUID NOT NULL REFERENCES users(id),
        restaurant_id       UUID NOT NULL REFERENCES restaurants(id),
        driver_id           UUID REFERENCES drivers(id),
        status              order_status_enum NOT NULL DEFAULT 'pending',
        delivery_street     VARCHAR(255) NOT NULL,
        delivery_city       VARCHAR(100) NOT NULL,
        delivery_state      VARCHAR(100) NOT NULL,
        delivery_zip        VARCHAR(20) NOT NULL,
        delivery_lat        DECIMAL(10,8),
        delivery_lng        DECIMAL(11,8),
        subtotal            DECIMAL(10,2) NOT NULL,
        delivery_fee        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        tax                 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total               DECIMAL(10,2) NOT NULL,
        payment_method      payment_method_enum NOT NULL DEFAULT 'cash',
        payment_status      payment_status_enum NOT NULL DEFAULT 'pending',
        special_instructions TEXT,
        estimated_delivery_time TIMESTAMPTZ,
        delivered_at        TIMESTAMPTZ,
        cancelled_at        TIMESTAMPTZ,
        cancellation_reason TEXT,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Order items table
    await queryRunner.query(`
      CREATE TABLE order_items (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id  UUID NOT NULL REFERENCES menu_items(id),
        name          VARCHAR(255) NOT NULL,
        price         DECIMAL(10,2) NOT NULL,
        quantity      INTEGER NOT NULL DEFAULT 1,
        subtotal      DECIMAL(10,2) NOT NULL,
        notes         TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Reviews table
    await queryRunner.query(`
      CREATE TABLE reviews (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id      UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
        customer_id   UUID NOT NULL REFERENCES users(id),
        restaurant_id UUID NOT NULL REFERENCES restaurants(id),
        driver_id     UUID REFERENCES drivers(id),
        restaurant_rating INTEGER CHECK (restaurant_rating BETWEEN 1 AND 5),
        driver_rating     INTEGER CHECK (driver_rating BETWEEN 1 AND 5),
        comment       TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Indexes for performance
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX idx_addresses_user ON addresses(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_restaurants_owner ON restaurants(owner_id)`);
    await queryRunner.query(`CREATE INDEX idx_restaurants_status ON restaurants(status)`);
    await queryRunner.query(`CREATE INDEX idx_restaurants_city ON restaurants(city)`);
    await queryRunner.query(`CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id)`);
    await queryRunner.query(`CREATE INDEX idx_menu_items_category ON menu_items(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_orders_customer ON orders(customer_id)`);
    await queryRunner.query(`CREATE INDEX idx_orders_restaurant ON orders(restaurant_id)`);
    await queryRunner.query(`CREATE INDEX idx_orders_driver ON orders(driver_id)`);
    await queryRunner.query(`CREATE INDEX idx_orders_status ON orders(status)`);
    await queryRunner.query(`CREATE INDEX idx_drivers_user ON drivers(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_drivers_status ON drivers(status)`);
    await queryRunner.query(`CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reviews`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS drivers`);
    await queryRunner.query(`DROP TABLE IF EXISTS menu_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS menu_categories`);
    await queryRunner.query(`DROP TABLE IF EXISTS restaurants`);
    await queryRunner.query(`DROP TABLE IF EXISTS addresses`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS restaurant_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS driver_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS order_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}

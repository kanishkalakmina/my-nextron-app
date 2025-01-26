import Database from "better-sqlite3";
import path from "path";
import {
    fileURLToPath
} from "url";
import fs from "fs";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";
const getDbPath = () => {
    if (isProd) {
        // For Windows, use APPDATA
        if (process.env.APPDATA) {
            return path.join(process.env.APPDATA, "my-nextron-app/db.sqlite");
        }
        // Fallback for other OS or if APPDATA is not available
        const userHome = process.env.HOME || process.env.USERPROFILE;
        return path.join(userHome, ".my-nextron-app/db.sqlite");
    }
    // Development path
    return path.join(__dirname, "../../db.sqlite");
};

const dbPath = getDbPath();

// Ensure the database directory exists
if (isProd) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, {
            recursive: true,
        });
        console.log("Created database directory:", dbDir);
    }
}

let db;
try {
    db = new Database(dbPath);

    // Initialize tables only if they don't exist
    db.exec(`
    -- Create categories table if not exists
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create products table if not exists
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Create orders table if not exists
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create order_items table if not exists
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Create hold_orders table if not exists
    CREATE TABLE IF NOT EXISTS hold_orders (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL,
      items TEXT NOT NULL,
      total_items INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

     CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      subtotal REAL NOT NULL,
      discount REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      amount_received REAL,
      change_amount REAL,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create invoiced_item table if not exists
    CREATE TABLE IF NOT EXISTS invoiced_item (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_id) REFERENCES payments(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

    // Enable foreign key support
    db.exec("PRAGMA foreign_keys = ON;");

    console.log("Database initialized successfully at:", dbPath);
} catch (error) {
    console.error("Database initialization error:", error);
    throw error;
}

// Categories CRUD
const categoryQueries = {
    create: db.prepare(
        "INSERT INTO categories (id, name, description) VALUES (?, ?, ?)"
    ),
    getAll: db.prepare("SELECT * FROM categories ORDER BY created_at DESC"),
    getById: db.prepare("SELECT * FROM categories WHERE id = ?"),
    update: db.prepare(
        "UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ),
    delete: db.prepare("DELETE FROM categories WHERE id = ?"),
    search: db.prepare(
        "SELECT * FROM categories WHERE name LIKE ? ORDER BY created_at DESC"
    ),
};

// Products CRUD
const productQueries = {
    create: db.prepare(`
    INSERT INTO products (id, name, description, price, category_id, image_path) 
    VALUES (?, ?, ?, ?, ?, ?)
  `),
    getAll: db.prepare(`
    SELECT 
      p.*,
      c.name as category_name,
      c.id as category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id 
    ORDER BY p.created_at DESC
  `),
    getById: db.prepare(`
    SELECT 
      p.*,
      c.name as category_name,
      c.id as category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?
  `),
    update: db.prepare(`
    UPDATE products 
    SET name = ?, 
        description = ?, 
        price = ?, 
        category_id = ?,
        image_path = ?,
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
    delete: db.prepare("DELETE FROM products WHERE id = ?"),
    search: db.prepare(`
    SELECT 
      p.*,
      c.name as category_name,
      c.id as category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.name LIKE ? OR p.description LIKE ?
    ORDER BY p.created_at DESC
  `),
};

// Orders CRUD
const orderQueries = {
    create: db.prepare(
        "INSERT INTO orders (id, total_amount, status) VALUES (?, ?, ?)"
    ),
    createOrderItem: db.prepare(
        "INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)"
    ),
    getAll: db.prepare(`
    SELECT 
      orders.*,
      COUNT(order_items.id) as total_items,
      GROUP_CONCAT(products.name) as product_names
    FROM orders 
    LEFT JOIN order_items ON orders.id = order_items.order_id
    LEFT JOIN products ON order_items.product_id = products.id
    GROUP BY orders.id
    ORDER BY orders.created_at DESC
  `),
    getById: db.prepare("SELECT * FROM orders WHERE id = ?"),
    getOrderItems: db.prepare(`
    SELECT 
      order_items.*,
      products.name as product_name,
      products.description as product_description
    FROM order_items 
    LEFT JOIN products ON order_items.product_id = products.id 
    WHERE order_items.order_id = ?
  `),
    updateStatus: db.prepare(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ),
    search: db.prepare(`
    SELECT 
      orders.*,
      COUNT(order_items.id) as total_items,
      GROUP_CONCAT(products.name) as product_names
    FROM orders 
    LEFT JOIN order_items ON orders.id = order_items.order_id
    LEFT JOIN products ON order_items.product_id = products.id
    WHERE orders.id LIKE ? 
    GROUP BY orders.id
    ORDER BY orders.created_at DESC
  `),
};

// Hold Orders CRUD
const holdOrderQueries = {
    create: db.prepare(`
    INSERT INTO hold_orders (id, reference, items, total_items, total_amount)
    VALUES (?, ?, ?, ?, ?)
  `),
    update: db.prepare(`
    UPDATE hold_orders 
    SET reference = ?, items = ?, total_items = ?, total_amount = ?
    WHERE id = ?
  `),
    getAll: db.prepare("SELECT * FROM hold_orders ORDER BY created_at DESC"),
    getById: db.prepare("SELECT * FROM hold_orders WHERE id = ?"),
    delete: db.prepare("DELETE FROM hold_orders WHERE id = ?"),
    checkReference: db.prepare(
        "SELECT COUNT(*) as count FROM hold_orders WHERE reference = ?"
    ),
};

// Payment CRUD
const paymentQueries = {
    create: db.prepare(`
    INSERT INTO payments (id, order_id, amount, payment_method, payment_date, subtotal, discount, tax, total, amount_received, change_amount, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
    getAll: db.prepare("SELECT * FROM payments ORDER BY created_at DESC"),
    getById: db.prepare("SELECT * FROM payments WHERE id = ?"),
    getByOrderId: db.prepare("SELECT * FROM payments WHERE order_id = ?"),
    searchPayments: db.prepare(`
    SELECT * FROM payments 
    WHERE order_id LIKE ? OR payment_method LIKE ? OR status LIKE ?
    ORDER BY created_at DESC
  `),
};

// Invoiced Item CRUD
const invoicedItemQueries = {
    create: db.prepare(`
    INSERT INTO invoiced_item (id, payment_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `),
    getAll: db.prepare(`
    SELECT 
      invoiced_item.*,
      payments.order_id as order_id,
      products.name as product_name
    FROM invoiced_item 
    LEFT JOIN payments ON invoiced_item.payment_id = payments.id
    LEFT JOIN products ON invoiced_item.product_id = products.id
    ORDER BY invoiced_item.created_at DESC
  `),
    getById: db.prepare("SELECT * FROM invoiced_item WHERE id = ?"),
    getByPaymentId: db.prepare(`
    SELECT 
      invoiced_item.*,
      products.name as product_name
    FROM invoiced_item 
    LEFT JOIN products ON invoiced_item.product_id = products.id
    WHERE invoiced_item.payment_id = ?
  `),
};

export {
    categoryQueries,
    productQueries,
    orderQueries,
    holdOrderQueries,
    paymentQueries,
    invoicedItemQueries,
};
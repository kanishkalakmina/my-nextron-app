import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In development, store the database in the project directory
// In production, store it in the user's app data directory
const isProd = process.env.NODE_ENV === "production";
const dbPath = isProd
  ? path.join(process.env.APPDATA, "my-nextron-app/db.sqlite")
  : path.join(__dirname, "../../db.sqlite");

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  -- Drop existing tables to recreate schema
  DROP TABLE IF EXISTS order_items;
  DROP TABLE IF EXISTS orders;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS categories;

  -- Create categories table
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create products table
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );

  -- Create orders table
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create order_items table
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
`);

// Categories CRUD
const categoryQueries = {
  create: db.prepare(
    "INSERT INTO categories (name, description) VALUES (?, ?)"
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
    INSERT INTO products (name, description, price, category_id) 
    VALUES (?, ?, ?, ?)
  `),
  getAll: db.prepare(`
    SELECT 
      p.*,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id 
    ORDER BY p.created_at DESC
  `),
  getById: db.prepare(`
    SELECT 
      p.*,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?
  `),
  update: db.prepare(`
    UPDATE products 
    SET 
      name = ?, 
      description = ?, 
      price = ?, 
      category_id = ?,
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  delete: db.prepare("DELETE FROM products WHERE id = ?"),
  search: db.prepare(`
    SELECT 
      p.*,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.name LIKE ?
    ORDER BY p.created_at DESC
  `),
};

// Orders CRUD
const orderQueries = {
  create: db.prepare("INSERT INTO orders (total_amount, status) VALUES (?, ?)"),
  createOrderItem: db.prepare(
    "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)"
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

export { categoryQueries, productQueries, orderQueries };

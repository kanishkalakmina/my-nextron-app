import Database from "better-sqlite3";
import path from "path";
import {
    fileURLToPath
} from "url";
import fs from "fs";
import bcrypt from "bcrypt";
import {
    v4 as uuidv4
} from "uuid";

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
    }
}

// Initialize database connection
const db = new Database(dbPath);

try {
    // Initialize tables only if they don't exist
    db.exec(`
    -- Create roles table
    CREATE TABLE IF NOT EXISTS roles (
      role_id TEXT PRIMARY KEY,
      role_name TEXT NOT NULL UNIQUE
    );

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
      stock INTEGER DEFAULT 0,
      stock_disabled BOOLEAN DEFAULT 0,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      cashier TEXT NOT NULL
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

       -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
      login_attempts INTEGER DEFAULT 0,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      password_reset_token TEXT,
      password_reset_expires DATETIME,
      FOREIGN KEY (role_id) REFERENCES roles(role_id)
    );

    -- Create bill_templates table
    CREATE TABLE IF NOT EXISTS bill_templates (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      tax_id TEXT,
      footer_text TEXT,
      show_logo INTEGER DEFAULT 1,
      show_tax_id INTEGER DEFAULT 1,
      show_footer INTEGER DEFAULT 1,
      logo_path TEXT,
      bill_width INTEGER DEFAULT 600,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

    // Enable foreign key support
    db.exec("PRAGMA foreign_keys = ON;");

       // Check if cashier column exists in payments table
       const tableInfo = db.prepare("PRAGMA table_info(payments)").all();
       const cashierColumnExists = tableInfo.some(column => column.name === 'cashier');
   
       if (!cashierColumnExists) {
           // Add cashier column if it doesn't exist
           db.exec(`
             ALTER TABLE payments 
             ADD COLUMN cashier TEXT DEFAULT 'Unknown';
           `);
           
           // Update existing records to have a default value
           db.exec(`
             UPDATE payments 
             SET cashier = 'Unknown' 
             WHERE cashier IS NULL;
           `);
       }
} catch (error) {
    console.error("Database initialization error:", error);
    throw error;
}

// Insert default roles if they don't exist
try {
    const insertRole = db.prepare(`
        INSERT OR IGNORE INTO roles (role_id, role_name)
        VALUES (?, ?)
    `);

    // Insert Administrator role
    insertRole.run(uuidv4(), "Administrator");
    insertRole.run(uuidv4(), "Manager");
    insertRole.run(uuidv4(), "Staff");
    insertRole.run(uuidv4(), "Cashier");
} catch (error) {
    console.error("Error initializing default roles:", error);
}

// Enable foreign key support
db.exec("PRAGMA foreign_keys = ON;");

// Create default admin user if not exists
const createDefaultAdmin = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, username, password, full_name, role_id, status
    ) VALUES (?, ?, ?, ?, (SELECT role_id FROM roles WHERE role_name = 'Administrator'), ?)
  `);

createDefaultAdmin.run(
    uuidv4(),
    "admin",
    bcrypt.hashSync("password", 10),
    "System Administrator",
    "active"
);

// Insert demo bill template if none exists
const billTemplateCount = db
    .prepare("SELECT COUNT(*) as count FROM bill_templates")
    .get();
if (billTemplateCount.count === 0) {
    const demoTemplateId = uuidv4();
    db.prepare(
        `
        INSERT INTO bill_templates (
            id, company_name, address, phone, email, website, 
            tax_id, footer_text, show_logo, show_tax_id, show_footer, 
            logo_path, bill_width
        ) VALUES (
            ?, 'Demo Company', '123 Demo Street, Demo City', '+1234567890',
            'demo@company.com', '', 'TAX-12345',
            'Thank you for your business!', 1, 1, 1, '', 600
        )
    `
    ).run(demoTemplateId);
}

// Role queries
const roleQueries = {
    getAll: db.prepare("SELECT * FROM roles"),
    getById: db.prepare("SELECT * FROM roles WHERE role_id = ?"),
    getRoleName: db.prepare("SELECT role_name FROM roles WHERE role_id = ?"),
    getRolePermissions: db.prepare(
        "SELECT role_name FROM roles WHERE role_id = ?"
    ),
};

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
    INSERT INTO products (id, name, description, price, category_id, image_path, stock, stock_disabled) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
        stock = ?,
        stock_disabled = ?,
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
    INSERT INTO payments (id, order_id, amount, payment_method, payment_date, subtotal, discount, tax, total, amount_received, change_amount, status, created_at, cashier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

// Users CRUD
const userQueries = {
    create: db.prepare(`
  INSERT INTO users (id, username, password, full_name, role_id, status)
  VALUES (?, ?, ?, ?, ?, ?)
`),
    getAll: db.prepare("SELECT * FROM users ORDER BY created_at DESC"),
    getById: db.prepare("SELECT * FROM users WHERE id = ?"),
    getByUsername: db.prepare("SELECT * FROM users WHERE username = ?"),
    update: db.prepare(`
  UPDATE users 
  SET username = ?, 
      full_name = ?, 
      role_id = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = ?
`),
    updatePassword: db.prepare(`
  UPDATE users 
  SET password = ?, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = ?
`),
    updateLoginAttempts: db.prepare(`
  UPDATE users 
  SET login_attempts = login_attempts + 1,
      updated_at = CURRENT_TIMESTAMP 
  WHERE username = ?
`),
    resetLoginAttempts: db.prepare(`
  UPDATE users 
  SET login_attempts = 0,
      updated_at = CURRENT_TIMESTAMP 
  WHERE username = ?
`),
    updateLastLogin: db.prepare(`
  UPDATE users 
  SET last_login = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP 
  WHERE username = ?
`),
    delete: db.prepare("DELETE FROM users WHERE id = ?"),
    search: db.prepare(`
  SELECT * FROM users WHERE username LIKE ? ORDER BY created_at DESC
`),
    findByUsername: db.prepare("SELECT * FROM users WHERE username = ?"),
    verifyPassword: (hashedPassword, plainTextPassword) => {
        return bcrypt.compareSync(plainTextPassword, hashedPassword);
    },
};

// Bill Template queries
const billTemplateQueries = {
    create: db.prepare(`
        INSERT INTO bill_templates (
            id, company_name, address, phone, email, website, 
            tax_id, footer_text, show_logo, show_tax_id, show_footer, 
            logo_path, bill_width
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
        UPDATE bill_templates 
        SET company_name = ?, address = ?, phone = ?, email = ?, website = ?,
            tax_id = ?, footer_text = ?, show_logo = ?, show_tax_id = ?, 
            show_footer = ?, logo_path = ?, bill_width = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `),
    getAll: db.prepare("SELECT * FROM bill_templates ORDER BY created_at DESC"),
    getById: db.prepare("SELECT * FROM bill_templates WHERE id = ?"),
    delete: db.prepare("DELETE FROM bill_templates WHERE id = ?"),
};

export {
    categoryQueries,
    productQueries,
    orderQueries,
    userQueries,
    roleQueries,
    holdOrderQueries,
    paymentQueries,
    invoicedItemQueries,
    billTemplateQueries,
};
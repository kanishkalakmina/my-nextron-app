import {
  categoryQueries,
  productQueries,
  orderQueries,
  userQueries,
  roleQueries,
  holdOrderQueries,
  paymentQueries,
  invoicedItemQueries,
} from "../db/index.js";
import { app } from "electron";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

// Function to generate UUID
const generateUUID = () => {
  return crypto.randomUUID();
};

const getUploadDir = () => {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    // Use AppData in production
    const appDataPath =
      process.env.APPDATA ||
      (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : process.env.HOME + "/.local/share");
    return path.join(appDataPath, "my-nextron-app", "uploads");
  } else {
    // Use public directory in development
    return path.join(process.cwd(), "renderer", "public", "upload");
  }
};

// Categories handlers
const categoryHandlers = {
  createCategory: async (event, { name, description }) => {
    try {
      const id = generateUUID();
      const result = categoryQueries.create.run(id, name, description);
      return {
        success: true,
        id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getAllCategories: async () => {
    try {
      const categories = categoryQueries.getAll.all();
      return {
        success: true,
        categories,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getCategoryById: async (event, { id }) => {
    try {
      const category = categoryQueries.getById.get(id);
      return {
        success: true,
        category,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  updateCategory: async (event, { id, name, description }) => {
    try {
      categoryQueries.update.run(name, description, id);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  deleteCategory: async (event, { id }) => {
    try {
      categoryQueries.delete.run(id);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  searchCategories: async (event, { searchTerm }) => {
    try {
      const categories = categoryQueries.search.all(`%${searchTerm}%`);
      return {
        success: true,
        categories,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Products handlers
const productHandlers = {
  uploadImage: async (event, { name, type, data }) => {
    try {
      console.log("Received file data:", {
        name,
        type,
        dataLength: data ? data.length : 0,
      });

      const uploadDir = getUploadDir();
      console.log("Upload directory:", uploadDir);

      if (!fs.existsSync(uploadDir)) {
        console.log("Creating upload directory");
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      // Generate unique filename
      const fileExtension = path.extname(name);
      const timestamp = Date.now();
      const uniqueId = crypto.randomUUID().slice(0, 8);
      const uniqueFilename = `${timestamp}-${uniqueId}${fileExtension}`;

      const filePath = path.join(uploadDir, uniqueFilename);
      console.log("Writing file to:", filePath);

      // Convert the array back to Buffer and write it
      const buffer = Buffer.from(data);
      fs.writeFileSync(filePath, buffer);
      console.log("File written successfully");

      // In production, we need to serve files from the AppData directory
      const isProd = process.env.NODE_ENV === "production";
      const relativePath = isProd ? filePath : `/upload/${uniqueFilename}`;

      return {
        success: true,
        filePath: relativePath,
      };
    } catch (error) {
      console.error("Error in uploadImage handler:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  createProduct: async (
    event,
    { name, description, price, category_id, image_path }
  ) => {
    try {
      // Validate required fields
      if (!name || !price || !category_id) {
        return {
          success: false,
          error: "Missing required fields",
        };
      }

      // Validate price is a positive number
      if (price < 0) {
        return {
          success: false,
          error: "Price must be a positive number",
        };
      }
      // Validate price is a positive number
      if (price < 0) {
        return {
          success: false,
          error: "Price must be a positive number",
        };
      }

      const id = generateUUID();
      productQueries.create.run(
        id,
        name,
        description,
        price,
        category_id,
        image_path
      );
      return {
        success: true,
        id,
      };
    } catch (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getAllProducts: async () => {
    try {
      const products = productQueries.getAll.all();
      return {
        success: true,
        products,
      };
    } catch (error) {
      console.error("Error getting products:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getProductById: async (event, { id }) => {
    try {
      const product = productQueries.getById.get(id);
      return {
        success: true,
        product,
      };
    } catch (error) {
      console.error("Error getting product:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  updateProduct: async (event, data) => {
    try {
      const { id, name, description, price, category_id, image_path } = data;

      // Validate required fields
      if (!id || !name || !price || !category_id) {
        return {
          success: false,
          error: "Missing required fields",
        };
      }

      // Validate price is a positive number
      if (price < 0) {
        return {
          success: false,
          error: "Price must be a positive number",
        };
      }

      // Get the current product to check its image
      const currentProduct = productQueries.getById.get(id);
      if (
        currentProduct &&
        currentProduct.image_path &&
        image_path !== currentProduct.image_path
      ) {
        // If there's a new image and an old image exists, delete the old one
        try {
          const oldImagePath = path.join(
            process.cwd(),
            "renderer",
            "public",
            currentProduct.image_path
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Deleted old image:", oldImagePath);
          }
        } catch (error) {
          console.error("Error deleting old image:", error);
          // Continue with the update even if image deletion fails
        }
      }

      console.log("Updating product:", {
        id,
        name,
        description,
        price,
        category_id,
        image_path,
      });

      productQueries.update.run(
        name,
        description,
        price,
        category_id,
        image_path,
        id
      );

      console.log("Product updated successfully");
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  deleteProduct: async (event, { id }) => {
    try {
      // Get the product to check its image
      const product = productQueries.getById.get(id);
      if (product && product.image_path) {
        try {
          const imagePath = path.join(
            process.cwd(),
            "renderer",
            "public",
            product.image_path
          );
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log("Deleted product image:", imagePath);
          }
        } catch (error) {
          console.error("Error deleting product image:", error);
          // Continue with the deletion even if image deletion fails
        }
      }

      productQueries.delete.run(id);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  searchProducts: async (event, { searchTerm }) => {
    try {
      const searchPattern = `%${searchTerm}%`;
      const products = productQueries.search.all(searchPattern);
      return {
        success: true,
        products,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Orders handlers
const orderHandlers = {
  createOrder: async (event, { items, totalAmount }) => {
    try {
      const orderId = generateUUID();
      const { lastInsertRowid } = orderQueries.create.run(
        totalAmount,
        "pending"
      );

      for (const item of items) {
        orderQueries.createOrderItem.run(
          orderId,
          item.productId,
          item.quantity,
          item.price
        );
      }

      return {
        success: true,
        orderId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getAllOrders: async () => {
    try {
      const orders = orderQueries.getAll.all();
      return {
        success: true,
        orders,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getOrderById: async (event, { id }) => {
    try {
      const order = orderQueries.getById.get(id);
      const items = orderQueries.getOrderItems.all(id);
      return {
        success: true,
        order: {
          ...order,
          items,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  updateOrderStatus: async (event, { id, status }) => {
    try {
      orderQueries.updateStatus.run(status, id);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  searchOrders: async (event, { searchTerm }) => {
    try {
      const orders = orderQueries.search.all(`%${searchTerm}%`);
      return {
        success: true,
        orders,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
// User handlers
const userHandlers = {
  createUser: async (event, data) => {
    try {
      const { username, password, full_name, role_id, status } = data;
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = generateUUID();

      userQueries.create.run(
        id,
        username,
        hashedPassword,
        full_name,
        role_id,
        status
      );
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error in createUser:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getAllUsers: async () => {
    try {
      const users = userQueries.getAll.all();
      // Don't send password and sensitive info to frontend
      const sanitizedUsers = users.map((user) => {
        const { password, ...rest } = user;
        // Get role name for each user
        const roleInfo = roleQueries.getRoleName.get(user.role_id);
        return {
          ...rest,
          role_name: roleInfo ? roleInfo.role_name : "Unknown Role",
        };
      });
      return {
        success: true,
        users: sanitizedUsers,
      };
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  updateUser: async (event, data) => {
    try {
      const { id, username, full_name, role_id, status } = data;
      userQueries.update.run(username, full_name, role_id, status, id);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error in updateUser:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  deleteUser: async (event, data) => {
    try {
      const { id, adminPassword } = data;

      // Get admin user and verify admin password
      const admin = userQueries.getByUsername.get("admin");
      if (!admin) {
        return {
          success: false,
          error: "Admin account not found",
        };
      }

      const isValidAdminPassword = await bcrypt.compare(
        adminPassword,
        admin.password
      );
      if (!isValidAdminPassword) {
        return {
          success: false,
          error: "Admin password is incorrect",
        };
      }

      // Prevent deleting the admin user
      const userToDelete = userQueries.getById.get(id);
      if (userToDelete && userToDelete.username === "admin") {
        return {
          success: false,
          error: "Cannot delete the admin user",
        };
      }

      // Delete the user
      userQueries.delete.run(id);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  resetUserPassword: async (event, data) => {
    try {
      const {
        username,
        currentPassword,
        adminPassword,
        newPassword,
        resetMethod,
      } = data;

      // Get the user
      const user = userQueries.getByUsername.get(username);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      if (resetMethod === "self") {
        // Verify current password
        const isValidPassword = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isValidPassword) {
          return {
            success: false,
            error: "Current password is incorrect",
          };
        }
      } else if (resetMethod === "admin") {
        // Get admin user and verify admin password
        const admin = userQueries.getByUsername.get("admin");
        if (!admin) {
          return {
            success: false,
            error: "Admin account not found",
          };
        }

        const isValidAdminPassword = await bcrypt.compare(
          adminPassword,
          admin.password
        );
        if (!isValidAdminPassword) {
          return {
            success: false,
            error: "Admin password is incorrect",
          };
        }
      }

      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      userQueries.updatePassword.run(hashedPassword, username);
      userQueries.resetLoginAttempts.run(username);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error in resetUserPassword:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
// Payments handlers
const paymentHandlers = {
  savePayment: async (event, data) => {
    try {
      const {
        id,
        order_id,
        amount,
        payment_method,
        payment_date,
        subtotal,
        discount,
        tax,
        total,
        amount_received,
        change_amount,
        status,
        created_at,
        orderItems,
      } = data;

      // Save payment first
      paymentQueries.create.run(
        id,
        order_id,
        amount,
        payment_method,
        payment_date,
        subtotal,
        discount,
        tax,
        total,
        amount_received,
        change_amount,
        status,
        created_at
      );

      // Save each purchased item
      if (orderItems && Array.isArray(orderItems)) {
        for (const item of orderItems) {
          const invoicedItemId = generateUUID();
          invoicedItemQueries.create.run(
            invoicedItemId,
            id, // payment_id
            item.id, // product_id
            item.quantity,
            item.price
          );
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error saving payment:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAllPayments: () => {
    try {
      const payments = paymentQueries.getAll.all();
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      console.error("Error fetching payments:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getPaymentById: (event, { id }) => {
    try {
      const payment = paymentQueries.getById.get(id);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error("Error fetching payment:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getPaymentByOrderId: (event, { orderId }) => {
    try {
      const payment = paymentQueries.getByOrderId.get(orderId);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error("Error fetching payment by order:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  searchPayments: (event, { searchTerm }) => {
    try {
      const term = `%${searchTerm}%`;
      const payments = paymentQueries.searchPayments.all(term, term, term);
      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      console.error("Error searching payments:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
export {
  categoryHandlers,
  productHandlers,
  orderHandlers,
  holdOrderHandlers,
  paymentHandlers,
  userHandlers,
  roleHandlers,
};

import { categoryQueries, productQueries, orderQueries } from '../db/index.js';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import crypto from 'crypto';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate unique filename
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const hash = crypto.createHash('md5').update(originalName + timestamp).digest('hex');
  const ext = path.extname(originalName);
  return `${hash}${ext}`;
};

// Categories handlers
const categoryHandlers = {
  createCategory: async (event, { name, description }) => {
    try {
      const result = categoryQueries.create.run(name, description);
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllCategories: async () => {
    try {
      const categories = categoryQueries.getAll.all();
      return { success: true, categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getCategoryById: async (event, { id }) => {
    try {
      const category = categoryQueries.getById.get(id);
      return { success: true, category };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateCategory: async (event, { id, name, description }) => {
    try {
      categoryQueries.update.run(name, description, id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteCategory: async (event, { id }) => {
    try {
      categoryQueries.delete.run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  searchCategories: async (event, { searchTerm }) => {
    try {
      const categories = categoryQueries.search.all(`%${searchTerm}%`);
      return { success: true, categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Products handlers
const productHandlers = {
  createProduct: async (event, { name, description, price, categoryId, image }) => {
    try {
      let imagePath = null;
      
      // If image is a file path (from file selection), upload it
      if (image && image.startsWith('file://')) {
        const filePath = image.replace('file://', '');
        const uploadResult = await fileHandlers.uploadImage(null, { filePath });
        if (uploadResult.success) {
          imagePath = uploadResult.imagePath;
        }
      }
      
      const result = productQueries.create.run(
        name, 
        description, 
        price, 
        imagePath, 
        categoryId
      );
      
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllProducts: async () => {
    try {
      const products = productQueries.getAll.all().map(product => ({
        ...product,
        image: fileHandlers.getImageUrl(product.image)
      }));
      return { success: true, products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getProductById: async (event, { id }) => {
    try {
      const product = productQueries.getById.get(id);
      if (product) {
        product.image = fileHandlers.getImageUrl(product.image);
      }
      return { success: true, product };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (event, { id, name, description, price, categoryId, image }) => {
    try {
      let imagePath = image;
      
      // If image is a file path (from file selection), upload it
      if (image && image.startsWith('file://')) {
        const filePath = image.replace('file://', '');
        const uploadResult = await fileHandlers.uploadImage(null, { filePath });
        if (uploadResult.success) {
          imagePath = uploadResult.imagePath;
        }
      }
      
      productQueries.update.run(
        name, 
        description, 
        price, 
        imagePath, 
        categoryId, 
        id
      );
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (event, { id }) => {
    try {
      // Get product to delete its image
      const product = productQueries.getById.get(id);
      if (product && product.image) {
        const imagePath = path.join(process.cwd(), 'public', product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      productQueries.delete.run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  searchProducts: async (event, { searchTerm }) => {
    try {
      const products = productQueries.search.all(`%${searchTerm}%`).map(product => ({
        ...product,
        image: fileHandlers.getImageUrl(product.image)
      }));
      return { success: true, products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Orders handlers
const orderHandlers = {
  createOrder: async (event, { items, totalAmount }) => {
    try {
      const { lastInsertRowid: orderId } = orderQueries.create.run(totalAmount, 'pending');
      
      for (const item of items) {
        orderQueries.createOrderItem.run(
          orderId,
          item.productId,
          item.quantity,
          item.price
        );
      }
      
      return { success: true, orderId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllOrders: async () => {
    try {
      const orders = orderQueries.getAll.all();
      return { success: true, orders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getOrderById: async (event, { id }) => {
    try {
      const order = orderQueries.getById.get(id);
      const items = orderQueries.getOrderItems.all(id);
      return { success: true, order: { ...order, items } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateOrderStatus: async (event, { id, status }) => {
    try {
      orderQueries.updateStatus.run(status, id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  searchOrders: async (event, { searchTerm }) => {
    try {
      const orders = orderQueries.search.all(`%${searchTerm}%`);
      return { success: true, orders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// File handlers
const fileHandlers = {
  uploadImage: async (event, { filePath }) => {
    try {
      const originalName = path.basename(filePath);
      const uniqueFileName = generateUniqueFileName(originalName);
      const targetPath = path.join(uploadsDir, uniqueFileName);
      
      // Copy file to uploads directory
      fs.copyFileSync(filePath, targetPath);
      
      // Return relative path to be stored in database
      const relativePath = path.join('uploads', uniqueFileName).replace(/\\/g, '/');
      
      return { 
        success: true, 
        imagePath: relativePath
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    return path.join('/', imagePath).replace(/\\/g, '/');
  }
};

export {
  categoryHandlers,
  productHandlers,
  orderHandlers,
  fileHandlers
};

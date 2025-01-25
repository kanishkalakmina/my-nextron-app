import { categoryQueries, productQueries, orderQueries } from '../db/index.js';
import { app } from 'electron';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Function to generate UUID
const generateUUID = () => {
  return crypto.randomUUID();
};

// Categories handlers
const categoryHandlers = {
  createCategory: async (event, { name, description }) => {
    try {
      const id = generateUUID();
      const result = categoryQueries.create.run(id, name, description);
      return { success: true, id };
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
  uploadImage: async (event, { name, type, data }) => {
    try {
      console.log('Received file data:', { name, type, dataLength: data?.length });
      
      const uploadDir = path.join(process.cwd(), 'renderer', 'public', 'upload');
      console.log('Upload directory:', uploadDir);
      
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating upload directory');
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(name);
      const timestamp = Date.now();
      const uniqueId = crypto.randomUUID().slice(0, 8);
      const uniqueFilename = `${timestamp}-${uniqueId}${fileExtension}`;
      
      const filePath = path.join(uploadDir, uniqueFilename);
      console.log('Writing file to:', filePath);
      
      // Convert the array back to Buffer and write it
      const buffer = Buffer.from(data);
      fs.writeFileSync(filePath, buffer);
      console.log('File written successfully');

      return { success: true, filePath: `/upload/${uniqueFilename}` };
    } catch (error) {
      console.error('Error in uploadImage handler:', error);
      return { success: false, error: error.message };
    }
  },

  createProduct: async (event, { name, description, price, category_id, image_path }) => {
    try {
      // Validate required fields
      if (!name || !price || !category_id) {
        return { success: false, error: 'Missing required fields' };
      }

      // Validate price is a positive number
      if (price < 0) {
        return { success: false, error: 'Price must be a positive number' };
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
      return { success: true, id };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
  },

  getAllProducts: async () => {
    try {
      const products = productQueries.getAll.all();
      return { success: true, products };
    } catch (error) {
      console.error('Error getting products:', error);
      return { success: false, error: error.message };
    }
  },

  getProductById: async (event, { id }) => {
    try {
      const product = productQueries.getById.get(id);
      return { success: true, product };
    } catch (error) {
      console.error('Error getting product:', error);
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (event, data) => {
    try {
      const { id, name, description, price, category_id, image_path } = data;
      
      // Validate required fields
      if (!id || !name || !price || !category_id) {
        return { success: false, error: 'Missing required fields' };
      }

      // Validate price is a positive number
      if (price < 0) {
        return { success: false, error: 'Price must be a positive number' };
      }

      // Get the current product to check its image
      const currentProduct = productQueries.getById.get(id);
      if (currentProduct && currentProduct.image_path && image_path !== currentProduct.image_path) {
        // If there's a new image and an old image exists, delete the old one
        try {
          const oldImagePath = path.join(process.cwd(), 'renderer', 'public', currentProduct.image_path);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Deleted old image:', oldImagePath);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
          // Continue with the update even if image deletion fails
        }
      }

      console.log('Updating product:', { id, name, description, price, category_id, image_path });
      
      productQueries.update.run(
        name,
        description,
        price,
        category_id,
        image_path,
        id
      );
      
      console.log('Product updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (event, { id }) => {
    try {
      // Get the product to check its image
      const product = productQueries.getById.get(id);
      if (product && product.image_path) {
        try {
          const imagePath = path.join(process.cwd(), 'renderer', 'public', product.image_path);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('Deleted product image:', imagePath);
          }
        } catch (error) {
          console.error('Error deleting product image:', error);
          // Continue with the deletion even if image deletion fails
        }
      }

      productQueries.delete.run(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  searchProducts: async (event, { searchTerm }) => {
    try {
      const searchPattern = `%${searchTerm}%`;
      const products = productQueries.search.all(searchPattern);
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
      const orderId = generateUUID();
      const { lastInsertRowid } = orderQueries.create.run(totalAmount, 'pending');
      
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

export {
  categoryHandlers,
  productHandlers,
  orderHandlers
};

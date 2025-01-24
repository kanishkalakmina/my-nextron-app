import { categoryQueries, productQueries, orderQueries } from '../db/index.js';
import { app } from 'electron';

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
  createProduct: async (event, { name, description, price, category_id }) => {
    try {
      const result = productQueries.create.run(
        name, 
        description, 
        price, 
        category_id
      );
      
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getAllProducts: async () => {
    try {
      const products = productQueries.getAll.all();
      return { success: true, products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getProductById: async (event, { id }) => {
    try {
      const product = productQueries.getById.get(id);
      return { success: true, product };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (event, { id, name, description, price, category_id }) => {
    try {
      // Validate required fields
      if (!name || !price || !category_id) {
        return { success: false, error: 'Missing required fields' };
      }

      // Validate price is a positive number
      if (price < 0) {
        return { success: false, error: 'Price must be a positive number' };
      }

      productQueries.update.run(
        name, 
        description || '', 
        price, 
        category_id,
        id
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (event, { id }) => {
    try {
      productQueries.delete.run(id);
      return { success: true };
    } catch (error) {
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

export {
  categoryHandlers,
  productHandlers,
  orderHandlers
};

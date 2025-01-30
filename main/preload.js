import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Categories
  createCategory: async (data) => {
    try {
      return await ipcRenderer.invoke("create-category", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAllCategories: async () => {
    try {
      return await ipcRenderer.invoke("get-all-categories");
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getCategoryById: async (id) => {
    try {
      return await ipcRenderer.invoke("get-category-by-id", {
        id,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  updateCategory: async (data) => {
    try {
      return await ipcRenderer.invoke("update-category", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  deleteCategory: async (id) => {
    try {
      return await ipcRenderer.invoke("delete-category", {
        id,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  searchCategories: async (searchTerm) => {
    try {
      return await ipcRenderer.invoke("search-categories", {
        searchTerm,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Products
  uploadImage: async (fileData) => {
    try {
      return await ipcRenderer.invoke("upload-image", fileData);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  createProduct: async (data) => {
    try {
      return await ipcRenderer.invoke("create-product", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAllProducts: async () => {
    try {
      return await ipcRenderer.invoke("get-all-products");
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getProductById: async (id) => {
    try {
      return await ipcRenderer.invoke("get-product-by-id", {
        id,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  updateProduct: async (data) => {
    try {
      return await ipcRenderer.invoke("update-product", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  deleteProduct: async (id) => {
    try {
      return await ipcRenderer.invoke("delete-product", {
        id,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  searchProducts: async (searchTerm) => {
    try {
      return await ipcRenderer.invoke("search-products", {
        searchTerm,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Orders
  createOrder: async (data) => {
    try {
      return await ipcRenderer.invoke("create-order", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAllOrders: async () => {
    try {
      return await ipcRenderer.invoke("get-all-orders");
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getOrderById: async (id) => {
    try {
      return await ipcRenderer.invoke("get-order-by-id", {
        id,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  updateOrderStatus: async (data) => {
    try {
      return await ipcRenderer.invoke("update-order-status", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  searchOrders: async (searchTerm) => {
    try {
      return await ipcRenderer.invoke("search-orders", {
        searchTerm,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Hold Orders
  checkReference: async (reference) => {
    try {
      return await ipcRenderer.invoke("check-reference", {
        reference,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  createHoldOrder: async (data) => {
    try {
      return await ipcRenderer.invoke("create-hold-order", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  updateHoldOrder: async (data) => {
    try {
      return await ipcRenderer.invoke("update-hold-order", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAllHoldOrders: async () => {
    try {
      return await ipcRenderer.invoke("get-all-hold-orders");
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  deleteHoldOrder: async (id) => {
    try {
      return await ipcRenderer.invoke("delete-hold-order", {
        id,
      });
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Payments
  savePayment: async (paymentDetails) => {
    try {
      return await ipcRenderer.invoke("save-payment", paymentDetails);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAllPayments: async () => {
    try {
      return await ipcRenderer.invoke("get-all-payments");
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  // User management
  createUser: async (data) => {
    try {
      return await ipcRenderer.invoke("createUser", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  getAllUsers: async () => {
    try {
      return await ipcRenderer.invoke("getAllUsers");
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  updateUser: async (data) => {
    try {
      return await ipcRenderer.invoke("updateUser", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  deleteUser: async (data) => {
    try {
      return await ipcRenderer.invoke("deleteUser", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  resetUserPassword: async (data) => {
    try {
      return await ipcRenderer.invoke("resetUserPassword", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  validateResetToken: async (data) => {
    try {
      return await ipcRenderer.invoke("validateResetToken", data);
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  // Roles
  getAllRoles: async () => {
    try {
      return await ipcRenderer.invoke("get-all-roles");
    } catch (error) {
      console.error("IPC Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

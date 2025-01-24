const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Categories
  createCategory: (data) => ipcRenderer.invoke('create-category', data),
  getAllCategories: () => ipcRenderer.invoke('get-all-categories'),
  getCategoryById: (id) => ipcRenderer.invoke('get-category-by-id', { id }),
  updateCategory: (data) => ipcRenderer.invoke('update-category', data),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', { id }),
  searchCategories: (searchTerm) => ipcRenderer.invoke('search-categories', { searchTerm }),

  // Products
  createProduct: (data) => ipcRenderer.invoke('create-product', data),
  getAllProducts: () => ipcRenderer.invoke('get-all-products'),
  getProductById: (id) => ipcRenderer.invoke('get-product-by-id', { id }),
  updateProduct: (data) => ipcRenderer.invoke('update-product', data),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', { id }),
  searchProducts: (searchTerm) => ipcRenderer.invoke('search-products', { searchTerm }),

  // Orders
  createOrder: (data) => ipcRenderer.invoke('create-order', data),
  getAllOrders: () => ipcRenderer.invoke('get-all-orders'),
  getOrderById: (id) => ipcRenderer.invoke('get-order-by-id', { id }),
  updateOrderStatus: (data) => ipcRenderer.invoke('update-order-status', data),
  searchOrders: (searchTerm) => ipcRenderer.invoke('search-orders', { searchTerm }),
});

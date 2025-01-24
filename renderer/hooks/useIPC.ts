import { useState } from 'react';

// Define the window interface to include our electron API
declare global {
  interface Window {
    electron: {
      // Categories
      createCategory: (data: { name: string; description?: string }) => Promise<{ success: boolean; id?: number; error?: string }>;
      getAllCategories: () => Promise<{ success: boolean; categories?: any[]; error?: string }>;
      getCategoryById: (id: number) => Promise<{ success: boolean; category?: any; error?: string }>;
      updateCategory: (data: { id: number; name: string; description?: string }) => Promise<{ success: boolean; error?: string }>;
      deleteCategory: (id: number) => Promise<{ success: boolean; error?: string }>;
      searchCategories: (searchTerm: string) => Promise<{ success: boolean; categories?: any[]; error?: string }>;

      // Products
      createProduct: (data: { 
        name: string; 
        description?: string;
        price: number;
        stock: number;
        categoryId?: number;
      }) => Promise<{ success: boolean; id?: number; error?: string }>;
      getAllProducts: () => Promise<{ success: boolean; products?: any[]; error?: string }>;
      getProductById: (id: number) => Promise<{ success: boolean; product?: any; error?: string }>;
      updateProduct: (data: {
        id: number;
        name: string;
        description?: string;
        price: number;
        stock: number;
        categoryId?: number;
      }) => Promise<{ success: boolean; error?: string }>;
      deleteProduct: (id: number) => Promise<{ success: boolean; error?: string }>;
      searchProducts: (searchTerm: string) => Promise<{ success: boolean; products?: any[]; error?: string }>;

      // Orders
      createOrder: (data: {
        items: Array<{
          productId: number;
          quantity: number;
          price: number;
        }>;
        totalAmount: number;
      }) => Promise<{ success: boolean; orderId?: number; error?: string }>;
      getAllOrders: () => Promise<{ success: boolean; orders?: any[]; error?: string }>;
      getOrderById: (id: number) => Promise<{ success: boolean; order?: any; error?: string }>;
      updateOrderStatus: (data: { id: number; status: string }) => Promise<{ success: boolean; error?: string }>;
      searchOrders: (searchTerm: string) => Promise<{ success: boolean; orders?: any[]; error?: string }>;
    };
  }
}

interface UseIPCOptions {
  onError?: (error: string) => void;
}

export function useIPC(options: UseIPCOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: string) => {
    setError(error);
    if (options.onError) {
      options.onError(error);
    }
  };

  // Categories
  const createCategory = async (data: { name: string; description?: string }) => {
    setLoading(true);
    try {
      const result = await window.electron.createCategory(data);
      if (!result.success) {
        handleError(result.error || 'Failed to create category');
        return null;
      }
      return result.id;
    } finally {
      setLoading(false);
    }
  };

  const getAllCategories = async () => {
    setLoading(true);
    try {
      const result = await window.electron.getAllCategories();
      if (!result.success) {
        handleError(result.error || 'Failed to fetch categories');
        return [];
      }
      return result.categories;
    } finally {
      setLoading(false);
    }
  };

  // Products
  const createProduct = async (data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId?: number;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.createProduct(data);
      if (!result.success) {
        handleError(result.error || 'Failed to create product');
        return null;
      }
      return result.id;
    } finally {
      setLoading(false);
    }
  };

  const getAllProducts = async () => {
    setLoading(true);
    try {
      const result = await window.electron.getAllProducts();
      if (!result.success) {
        handleError(result.error || 'Failed to fetch products');
        return [];
      }
      return result.products;
    } finally {
      setLoading(false);
    }
  };

  // Orders
  const createOrder = async (data: {
    items: Array<{
      productId: number;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.createOrder(data);
      if (!result.success) {
        handleError(result.error || 'Failed to create order');
        return null;
      }
      return result.orderId;
    } finally {
      setLoading(false);
    }
  };

  const getAllOrders = async () => {
    setLoading(true);
    try {
      const result = await window.electron.getAllOrders();
      if (!result.success) {
        handleError(result.error || 'Failed to fetch orders');
        return [];
      }
      return result.orders;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Categories
    createCategory,
    getAllCategories,
    // Products
    createProduct,
    getAllProducts,
    // Orders
    createOrder,
    getAllOrders,
  };
}

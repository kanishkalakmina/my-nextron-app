import { useState } from "react";

// Define the window interface to include our electron API
declare global {
  interface Window {
    electron: {
      // Categories
      createCategory: (data: {
        name: string;
        description?: string;
      }) => Promise<{ success: boolean; id?: string; error?: string }>;
      getAllCategories: () => Promise<{
        success: boolean;
        categories?: Array<{
          id: string;
          name: string;
          description?: string;
          created_at: string;
          updated_at: string;
        }>;
        error?: string;
      }>;
      getCategoryById: (
        id: string
      ) => Promise<{ success: boolean; category?: any; error?: string }>;
      updateCategory: (data: {
        id: string;
        name: string;
        description?: string;
      }) => Promise<{ success: boolean; error?: string }>;
      deleteCategory: (
        id: string
      ) => Promise<{ success: boolean; error?: string }>;
      searchCategories: (
        searchTerm: string
      ) => Promise<{ success: boolean; categories?: any[]; error?: string }>;

      // Products
      createProduct: (data: {
        name: string;
        description?: string;
        price: number;
        category_id?: string;
      }) => Promise<{ success: boolean; id?: string; error?: string }>;
      getAllProducts: () => Promise<{
        success: boolean;
        products?: any[];
        error?: string;
      }>;
      getProductById: (
        id: string
      ) => Promise<{ success: boolean; product?: any; error?: string }>;
      updateProduct: (data: {
        id: string;
        name: string;
        description?: string;
        price: number;
        category_id?: string;
      }) => Promise<{ success: boolean; error?: string }>;
      deleteProduct: (
        id: string
      ) => Promise<{ success: boolean; error?: string }>;
      searchProducts: (
        searchTerm: string
      ) => Promise<{ success: boolean; products?: any[]; error?: string }>;
      uploadImage: (fileData: {
        name: string;
        type: string;
        data: Array<number>;
      }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      // Orders
      createOrder: (data: {
        items: Array<{
          productId: string;
          quantity: number;
          price: number;
        }>;
        totalAmount: number;
      }) => Promise<{ success: boolean; orderId?: string; error?: string }>;
      getAllOrders: () => Promise<{
        success: boolean;
        orders?: any[];
        error?: string;
      }>;
      getOrderById: (
        id: string
      ) => Promise<{ success: boolean; order?: any; error?: string }>;
      updateOrderStatus: (data: {
        id: string;
        status: string;
      }) => Promise<{ success: boolean; error?: string }>;
      searchOrders: (
        searchTerm: string
      ) => Promise<{ success: boolean; orders?: any[]; error?: string }>;

      // Hold Orders
      checkReference: (reference: string) => Promise<{
        success: boolean;
        exists: boolean;
        error?: string;
      }>;
      createHoldOrder: (data: {
        reference: string;
        items: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        total_items: number;
        total_amount: number;
      }) => Promise<{ success: boolean; id?: string; error?: string }>;
      updateHoldOrder: (data: {
        id: string;
        reference: string;
        items: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        total_items: number;
        total_amount: number;
      }) => Promise<{ success: boolean; error?: string }>;
      getAllHoldOrders: () => Promise<{
        success: boolean;
        orders?: Array<{
          id: string;
          reference: string;
          items: Array<{
            id: string;
            name: string;
            price: number;
            quantity: number;
          }>;
          total_items: number;
          total_amount: number;
          created_at: string;
        }>;
        error?: string;
      }>;
      deleteHoldOrder: (
        id: string
      ) => Promise<{ success: boolean; error?: string }>;
      // payment
      showNotification: (data: {
        title: string;
        body: string;
      }) => Promise<{ success: boolean; error?: string }>;
      getDailyIncome: () => Promise<{
        success: boolean;
        data?: Array<{
          date: string;
          total_transactions: number;
          total_amount: number;
          total_discount: number;
          total_tax: number;
        }>;
        error?: string;
      }>;
      savePayment: (paymentDetails: {
        order_id: string;
        amount: number;
        payment_method: string;
        payment_date: string;
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
        amount_received: number;
        change_amount: number;
        status: string;
        created_at: string;
      }) => Promise<{ success: boolean; error?: string }>;

      // User management
      createUser: (data: {
        username: string;
        password: string;
        full_name: string;
        role_id: string;
        status: "active" | "inactive" | "suspended";
      }) => Promise<{ success: boolean; error?: string }>;

      getAllUsers: () => Promise<{
        success: boolean;
        users?: Array<{
          id: string;
          username: string;
          full_name: string;
          role_id: string;
          role_name: string;
          status: "active" | "inactive" | "suspended";
          last_login?: string;
          created_at: string;
        }>;
        error?: string;
      }>;

      updateUser: (data: {
        id: string;
        username: string;
        password?: string;
        full_name: string;
        role_id: string;
        status: "active" | "inactive" | "suspended";
      }) => Promise<{ success: boolean; error?: string }>;

      deleteUser: (data: {
        id: string;
        adminPassword: string;
      }) => Promise<{ success: boolean; error?: string }>;

      resetUserPassword: (data: {
        id: string;
        username: string;
        adminPassword: string;
        newPassword: string;
        resetMethod: "admin" | "self";
        currentPassword?: string;
      }) => Promise<{ success: boolean; error?: string }>;

      validateResetToken: (data: { token: string }) => Promise<{
        success: boolean;
        userId?: string;
        error?: string;
      }>;

      getAllRoles: () => Promise<{
        success: boolean;
        roles?: any[];
        error?: string;
      }>;
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
  const createCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.createCategory(data);
      if (!result.success) {
        handleError(result.error || "Failed to create category");
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
        handleError(result.error || "Failed to fetch categories");
        return [];
      }
      return result.categories;
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id: string) => {
    setLoading(true);
    try {
      const result = await window.electron.getCategoryById(id);
      if (!result.success) {
        handleError(result.error || "Failed to fetch category");
        return null;
      }
      return result.category;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (data: {
    id: string;
    name: string;
    description?: string;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.updateCategory(data);
      if (!result.success) {
        handleError(result.error || "Failed to update category");
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      const result = await window.electron.deleteCategory(id);
      if (!result.success) {
        handleError(result.error || "Failed to delete category");
        return null;
      }
      return result.success;
    } finally {
      setLoading(false);
    }
  };

  // Products
  const createProduct = async (data: {
    name: string;
    description?: string;
    price: number;
    category_id?: string;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.createProduct(data);
      if (!result.success) {
        handleError(result.error || "Failed to create product");
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
        handleError(result.error || "Failed to fetch products");
        return [];
      }
      return result.products;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id: string) => {
    setLoading(true);
    try {
      const result = await window.electron.getProductById(id);
      if (!result.success) {
        handleError(result.error || "Failed to fetch product");
        return null;
      }
      return result.product;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (data: {
    id: string;
    name: string;
    description?: string;
    price: number;
    category_id?: string;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.updateProduct(data);
      if (!result.success) {
        handleError(result.error || "Failed to update product");
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      const result = await window.electron.deleteProduct(id);
      if (!result.success) {
        handleError(result.error || "Failed to delete product");
        return null;
      }
      return result.success;
    } finally {
      setLoading(false);
    }
  };

  // Orders
  const createOrder = async (data: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.createOrder(data);
      if (!result.success) {
        handleError(result.error || "Failed to create order");
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
        handleError(result.error || "Failed to fetch orders");
        return [];
      }
      return result.orders;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (id: string) => {
    setLoading(true);
    try {
      const result = await window.electron.getOrderById(id);
      if (!result.success) {
        handleError(result.error || "Failed to fetch order");
        return null;
      }
      return result.order;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (data: { id: string; status: string }) => {
    setLoading(true);
    try {
      const result = await window.electron.updateOrderStatus(data);
      if (!result.success) {
        handleError(result.error || "Failed to update order status");
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Hold Orders
  const checkReference = async (reference: string) => {
    setLoading(true);
    try {
      const result = await window.electron.checkReference(reference);
      if (!result.success) {
        handleError(result.error || "Failed to check reference");
        return { success: false, exists: false };
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const createHoldOrder = async (data: {
    reference: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    total_items: number;
    total_amount: number;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.createHoldOrder(data);
      if (!result.success) {
        handleError(result.error || "Failed to create hold order");
        return null;
      }
      return result.id;
    } finally {
      setLoading(false);
    }
  };

  const updateHoldOrder = async (data: {
    id: string;
    reference: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    total_items: number;
    total_amount: number;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.updateHoldOrder(data);
      if (!result.success) {
        handleError(result.error || "Failed to update hold order");
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const getAllHoldOrders = async () => {
    setLoading(true);
    try {
      const result = await window.electron.getAllHoldOrders();
      if (!result.success) {
        handleError(result.error || "Failed to fetch hold orders");
        return [];
      }
      return result.orders;
    } finally {
      setLoading(false);
    }
  };

  const deleteHoldOrder = async (id: string) => {
    setLoading(true);
    try {
      const result = await window.electron.deleteHoldOrder(id);
      if (!result.success) {
        handleError(result.error || "Failed to delete hold order");
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  // User management
  const createUser = async (data: any) => {
    setLoading(true);
    try {
      const result = await window.electron.createUser(data);
      if (!result.success) {
        handleError(result.error || "Failed to create user");
        return null;
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const result = await window.electron.getAllUsers();
      if (!result.success) {
        handleError(result.error || "Failed to fetch users");
        return [];
      }
      return result.users;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: any) => {
    setLoading(true);
    try {
      const result = await window.electron.updateUser(data);
      if (!result.success) {
        handleError(result.error || "Failed to update user");
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (data: { id: string; adminPassword: string }) => {
    setLoading(true);
    try {
      const result = await window.electron.deleteUser(data);
      if (!result.success) {
        handleError(result.error || "Failed to delete user");
        return null;
      }
      return result.success;
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (data: {
    id: string;
    username: string;
    adminPassword: string;
    newPassword: string;
    resetMethod: "admin" | "self";
    currentPassword?: string;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.resetUserPassword(data);
      if (!result.success) {
        handleError(result.error || "Failed to reset user password");
        return null;
      }
      return result.success;
    } finally {
      setLoading(false);
    }
  };

  const validateResetToken = async (data: { token: string }) => {
    setLoading(true);
    try {
      const result = await window.electron.validateResetToken(data);
      if (!result.success) {
        handleError(result.error || "Failed to validate reset token");
        return null;
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getAllRoles = async () => {
    setLoading(true);
    try {
      const result = await window.electron.getAllRoles();
      if (!result.success) {
        handleError(result.error || "Failed to fetch roles");
        return [];
      }
      return result.roles;
    } finally {
      setLoading(false);
    }
  };

  const savePayment = async (data: {
    order_id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    amount_received: number;
    change_amount: number;
    status: string;
    created_at: string;
  }) => {
    setLoading(true);
    try {
      const result = await window.electron.savePayment(data);
      if (!result.success) {
        handleError(result.error || "Failed to save payment");
        return false;
      }
      return true;
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
    getCategoryById,
    updateCategory,
    deleteCategory,
    // Products
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    // Orders
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    // Hold Orders
    checkReference,
    createHoldOrder,
    updateHoldOrder,
    getAllHoldOrders,
    deleteHoldOrder,
    savePayment,

    // User management
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    resetUserPassword,
    validateResetToken,
    getAllRoles,
  };
}

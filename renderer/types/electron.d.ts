interface Window {
  electron: {
    // Categories
    createCategory: (data: { name: string; description?: string }) => Promise<{
      success: boolean;
      id?: string;
      error?: string;
    }>;
    getAllCategories: () => Promise<{
      success: boolean;
      categories?: {
        id: string;
        name: string;
        description?: string;
        created_at: string;
        updated_at: string;
      }[];
      error?: string;
    }>;
    // ... other category methods

    // Payments
    getAllPayments: () => Promise<{
      success: boolean;
      data?: {
        id: string;
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
      }[];
      error?: string;
    }>;
    savePayment: (paymentDetails: any) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;
    // ... other methods
  };
}

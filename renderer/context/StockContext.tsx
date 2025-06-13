import React, { createContext, useContext, useEffect, useState } from 'react';
import { useIPC } from '../hooks/useIPC';

export interface StockNotification {
  id: string;
  productName: string;
  stock: number;
  timestamp: Date;
  type: string;
}

export const NOTIFICATION_TYPES = {
  STOCK: 'stock',
  PAYMENT: 'payment',
  SYSTEM: 'system',
} as const;

interface StockContextType {
  checkLowStock: () => void;
  notifications: StockNotification[];
  dismissNotification: (id: string) => void;
  checkStockAfterPayment: (products: any[]) => void;
}

const StockContext = createContext<StockContextType>({
  checkLowStock: () => {},
  notifications: [],
  dismissNotification: () => {},
  checkStockAfterPayment: () => {},
});

export const StockProvider = ({ children }: { children: React.ReactNode }) => {
  const { getAllProducts } = useIPC();
  const [notifications, setNotifications] = useState<StockNotification[]>([]);

  const checkLowStock = async () => {
    try {
      const result = await getAllProducts();
      if (result && Array.isArray(result)) {
        const lowStockProducts = result
          .filter(product => product.isNA === false && product.stock <= 5)
          .map(product => ({
            id: product.id,
            productName: product.name,
            stock: product.stock,
            timestamp: new Date(),
            type: NOTIFICATION_TYPES.STOCK
          }));

        // Merge new notifications with existing ones, avoiding duplicates
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifications = lowStockProducts.filter(n => !existingIds.has(n.id));
          return [...prev, ...newNotifications];
        });
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  };

  // Add this method to check stock after payment
  const checkStockAfterPayment = async (products: any[]) => {
    try {
      const result = await getAllProducts();
      if (result && Array.isArray(result)) {
        const updatedProducts = products.map(p => {
          const currentProduct = result.find(r => r.id === p.id);
          return {
            id: p.id,
            productName: p.name,
            stock: currentProduct?.stock || 0,
            timestamp: new Date(),
            type: NOTIFICATION_TYPES.STOCK
          };
        }).filter(p => p.stock <= 5);

        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifications = updatedProducts.filter(n => !existingIds.has(n.id));
          return [...prev, ...newNotifications];
        });
      }
    } catch (error) {
      console.error('Error checking stock after payment:', error);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  useEffect(() => {
    checkLowStock();
    const interval = setInterval(checkLowStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StockContext.Provider value={{ 
      checkLowStock, 
      notifications, 
      dismissNotification,
      checkStockAfterPayment 
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext); 
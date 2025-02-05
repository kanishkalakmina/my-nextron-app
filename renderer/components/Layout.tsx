import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LowStockNotification {
  id: string;
  productName: string;
  stock: number;
  timestamp: Date;
}

interface LayoutProps {
  children: React.ReactNode;
  notifications?: LowStockNotification[];
  onDismissNotification?: (id: string) => void;
}

export default function Layout({ children, notifications = [], onDismissNotification }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="flex-none">
        <Sidebar />
      </div>
      <div className="relative flex flex-1 flex-col">
        <TopBar notifications={notifications} onDismissNotification={onDismissNotification} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

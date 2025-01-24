import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  ShoppingCartIcon,
  TagIcon,
  ChartBarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Categories', href: '/category', icon: TagIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">POS System</h1>
        </div>
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    isActive
                      ? 'text-indigo-600'
                      : 'text-gray-400 group-hover:text-indigo-600'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {children}
      </div>
    </div>
  );
};

export default Layout;

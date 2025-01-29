import React from "react";
import { BellIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    try {
      // Clear any stored user data
      localStorage.removeItem('user');
      // Show success message
      toast.success('Logged out successfully');
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">Point of Sale</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          <BellIcon className="h-6 w-6" />
        </button>
        
        {/* User Profile */}
        <div className="flex flex-col items-center">
          <UserCircleIcon className="h-7 w-7 text-gray-500" />
          <span className="text-xs text-gray-600 mt-0.5">{user?.username || 'Guest'}</span>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-1 rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

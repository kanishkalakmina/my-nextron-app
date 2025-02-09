import React, { useState, useRef, useEffect } from "react";
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";

interface LowStockNotification {
  id: string;
  productName: string;
  stock: number;
  timestamp: Date;
}

interface TopBarProps {
  onNotificationClick?: () => void;
}

interface NotificationTypes {
  STOCK: 'stock';
  PAYMENT: 'payment';
  SYSTEM: 'system';
}

const NOTIFICATION_TYPES: NotificationTypes = {
  STOCK: 'stock',
  PAYMENT: 'payment',
  SYSTEM: 'system',
};

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case NOTIFICATION_TYPES.STOCK:
      return <ExclamationCircleIcon className="h-6 w-6 text-orange-500" />;
    case NOTIFICATION_TYPES.PAYMENT:
      return <CurrencyDollarIcon className="h-6 w-6 text-green-500" />;
    case NOTIFICATION_TYPES.SYSTEM:
      return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    default:
      return <BellIcon className="h-6 w-6 text-gray-500" />;
  }
};

const TopBar = ({ onNotificationClick }: TopBarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout, userData } = useAuth();
  const { notifications, dismissNotification } = useStock();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDismissNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dismissNotification(id);
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">
            Point of Sale
          </h1>
        </div>

        {/* User Menu and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                <div className="p-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {notifications.length > 0 ? (
                  <div className="max-h-[480px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 relative group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <NotificationIcon type={NOTIFICATION_TYPES.STOCK} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                Low Stock Alert
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5 truncate">
                              {notification.productName} ({notification.stock} items remaining)
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDismissNotification(notification.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-gray-200 rounded-full"
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <BellIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-4 text-gray-600">No new notifications</p>
                  </div>
                )}
{/* 
                {notifications.length > 0 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150"
                    >
                      Close
                    </button>
                  </div>
                )} */}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {userData?.full_name || "User"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.full_name || "User"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

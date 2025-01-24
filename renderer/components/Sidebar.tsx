import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  TagIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Point of Sale", href: "/dashboard", icon: CalculatorIcon },
  { name: "Categories", href: "/category", icon: TagIcon },
  { name: "Products", href: "/product", icon: CubeIcon },
  { name: "Open Orders", href: "/orders", icon: ShoppingCartIcon },
  { name: "Transactions", href: "/transactions", icon: CurrencyDollarIcon },
  { name: "Reports", href: "/reports", icon: ChartBarIcon },
  { name: "Settings", href: "/settings", icon: CogIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile on mount
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const checkIfMobile = () => {
    const isMobileView = window.innerWidth < 1024; // lg breakpoint
    setIsMobile(isMobileView);
    if (isMobileView) {
      setIsCollapsed(true);
    }
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      className={`h-screen bg-white border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-blue-500" style={{ fontFamily: "'Dancing Script', cursive" }}>
            𝓑𝓲𝓼𝓽𝓻𝓸
          </h1>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <ChevronLeftIcon className="h-6 w-6" />
            )}
          </button>
        )}
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <nav className="space-y-1 px-2 py-2">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon
                  className={`${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  } h-6 w-6 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`}
                  aria-hidden="true"
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

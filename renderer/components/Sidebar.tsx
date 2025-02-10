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
import { hasPageAccess } from "../utils/roleAccess";
import { Pages, PageRoutes, PageTitles } from "../utils/pages";

const navigation = [
  {
    name: PageTitles[Pages.POINT_OF_SALE],
    href: PageRoutes[Pages.POINT_OF_SALE],
    icon: CalculatorIcon,
    page: Pages.POINT_OF_SALE,
  },
  {
    name: PageTitles[Pages.CATEGORIES],
    href: PageRoutes[Pages.CATEGORIES],
    icon: TagIcon,
    page: Pages.CATEGORIES,
  },
  {
    name: PageTitles[Pages.PRODUCTS],
    href: PageRoutes[Pages.PRODUCTS],
    icon: CubeIcon,
    page: Pages.PRODUCTS,
  },
  {
    name: PageTitles[Pages.ORDERS],
    href: PageRoutes[Pages.ORDERS],
    icon: ShoppingCartIcon,
    page: Pages.ORDERS,
  },
  {
    name: PageTitles[Pages.TRANSACTIONS],
    href: PageRoutes[Pages.TRANSACTIONS],
    icon: CurrencyDollarIcon,
    page: Pages.TRANSACTIONS,
  },
  {
    name: PageTitles[Pages.USERS],
    href: PageRoutes[Pages.USERS],
    icon: UserGroupIcon,
    page: Pages.USERS,
  },
  {
    name: PageTitles[Pages.REPORTS],
    href: PageRoutes[Pages.REPORTS],
    icon: ChartBarIcon,
    page: Pages.REPORTS,
  },
  {
    name: PageTitles[Pages.SETTINGS],
    href: PageRoutes[Pages.SETTINGS],
    icon: CogIcon,
    page: Pages.SETTINGS,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window size check in useEffect to avoid SSR issues
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(isMobileView);
      if (isMobileView) {
        setIsCollapsed(true);
      }
    };

    // Check if we're on mobile on mount
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Accessing localStorage only on the client side inside useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Filter navigation based on user role after it is set
  const filteredNavigation = navigation.filter(
    (item) => userRole && hasPageAccess(userRole, item.page)
  );

  return (
    <div
      className={`h-screen bg-gradient-to-b from-white to-gray-50 border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b px-4 bg-white">
        {!isCollapsed && (
          <h1
            className="text-2xl font-bold text-indigo-600"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            𝓑𝓲𝓼𝓽𝓻𝓸
          </h1>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredNavigation.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center rounded-lg px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                )}
                <item.icon
                  className={`${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  } h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                    isCollapsed ? "" : "mr-4"
                  }`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="truncate text-base">{item.name}</span>
                )}
                {!isCollapsed && isActive && (
                  <span
                    className={`absolute inset-y-0 right-0 w-1 bg-indigo-600 rounded-l-full`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

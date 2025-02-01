export const Pages = {
  DASHBOARD: "dashboard",
  USERS: "users",
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
  REPORTS: "reports",
  SETTINGS: "settings",
  TRANSACTIONS: "transactions",
  POINT_OF_SALE: "point_of_sale",
} as const;

export type PageKey = keyof typeof Pages;
export type PageValue = (typeof Pages)[PageKey];

// Page routes mapping
export const PageRoutes = {
  [Pages.USERS]: "/users",
  [Pages.PRODUCTS]: "/product",
  [Pages.CATEGORIES]: "/category",
  [Pages.ORDERS]: "/orders",
  [Pages.REPORTS]: "/reports",
  [Pages.SETTINGS]: "/settings",
  [Pages.TRANSACTIONS]: "/transactions",
  [Pages.POINT_OF_SALE]: "/dashboard",
} as const;

// Page titles
export const PageTitles = {
  [Pages.USERS]: "Users Management",
  [Pages.PRODUCTS]: "Products",
  [Pages.CATEGORIES]: "Categories",
  [Pages.ORDERS]: "Open Orders",
  [Pages.REPORTS]: "Reports",
  [Pages.SETTINGS]: "Settings",
  [Pages.TRANSACTIONS]: "Transactions",
  [Pages.POINT_OF_SALE]: "Point of Sale",
} as const;

// Helper function to get route by page
export const getPageRoute = (page: PageValue): string => {
  return PageRoutes[page];
};

// Helper function to get title by page
export const getPageTitle = (page: PageValue): string => {
  return PageTitles[page];
};

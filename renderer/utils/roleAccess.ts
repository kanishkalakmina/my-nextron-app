import { Pages, PageValue } from "./pages";

// Define page access permissions for each role
interface PageAccess {
  [key: string]: boolean;
}

export interface RoleAccess {
  [key: string]: PageAccess;
}

export const roleAccessConfig: RoleAccess = {
  Administrator: {
    [Pages.USERS]: true,
    [Pages.PRODUCTS]: true,
    [Pages.CATEGORIES]: true,
    [Pages.ORDERS]: true,
    [Pages.REPORTS]: true,
    [Pages.SETTINGS]: true,
    [Pages.TRANSACTIONS]: true,
    [Pages.POINT_OF_SALE]: true,
  },
  Manager: {
    [Pages.USERS]: false,
    [Pages.PRODUCTS]: true,
    [Pages.CATEGORIES]: true,
    [Pages.ORDERS]: true,
    [Pages.REPORTS]: true,
    [Pages.SETTINGS]: false,
    [Pages.TRANSACTIONS]: true,
    [Pages.POINT_OF_SALE]: true,
  },
  Staff: {
    [Pages.USERS]: false,
    [Pages.PRODUCTS]: true,
    [Pages.CATEGORIES]: true,
    [Pages.ORDERS]: true,
    [Pages.REPORTS]: false,
    [Pages.SETTINGS]: false,
    [Pages.TRANSACTIONS]: false,
    [Pages.POINT_OF_SALE]: true,
  },
  Cashier: {
    [Pages.USERS]: false,
    [Pages.PRODUCTS]: true,
    [Pages.CATEGORIES]: true,
    [Pages.ORDERS]: true,
    [Pages.REPORTS]: false,
    [Pages.SETTINGS]: false,
    [Pages.TRANSACTIONS]: true,
    [Pages.POINT_OF_SALE]: true,
  },
};

export const hasPageAccess = (role: string, page: PageValue): boolean => {
  if (!role || !page) return false;

  const rolePermissions = roleAccessConfig[role];
  if (!rolePermissions) return false;

  return rolePermissions[page] || false;
};

// Helper function to get accessible pages for a role
export const getAccessiblePages = (role: string): PageValue[] => {
  if (!role || !roleAccessConfig[role]) return [];

  return Object.entries(roleAccessConfig[role])
    .filter(([_, hasAccess]) => hasAccess)
    .map(([page]) => page as PageValue);
};

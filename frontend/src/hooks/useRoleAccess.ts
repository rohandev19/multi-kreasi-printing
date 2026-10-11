import { useRoleContext } from '../contexts/RoleContext';
import type { UserRole } from '../contexts/RoleContext';

export interface MenuItem {
  name: string;
  icon: string; // just passing a string name or we could use the actual component in the UI
  path: string;
  roles: UserRole[];
}

// Define the menu items based on Requirement 10
export const MENU_ITEMS: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Warehouse_Staff', 'Finance_Staff', 'Customer'],
  },
  {
    name: 'Orders',
    icon: 'ShoppingCart',
    path: '/orders',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Finance_Staff'],
  },
  {
    name: 'My Orders',
    icon: 'ShoppingBag',
    path: '/my-orders',
    roles: ['Customer'],
  },
  {
    name: 'Production',
    icon: 'Factory',
    path: '/production',
    roles: ['Owner', 'Manager', 'Production_Staff'],
  },
  {
    name: 'Design Files',
    icon: 'PenTool',
    path: '/design',
    roles: ['Owner', 'Manager', 'Designer'],
  },
  {
    name: 'Warehouse',
    icon: 'Package',
    path: '/warehouse',
    roles: ['Owner', 'Manager', 'Warehouse_Staff'],
  },
  {
    name: 'Customers',
    icon: 'Users',
    path: '/customers',
    roles: ['Owner', 'Manager', 'Finance_Staff'],
  },
  {
    name: 'Invoices',
    icon: 'FileText',
    path: '/invoices',
    roles: ['Owner', 'Manager', 'Finance_Staff', 'Customer'],
  },
];

export const useRoleAccess = () => {
  const { role, user, loading, hasAccess: contextHasAccess, hasPermission } = useRoleContext();

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    return contextHasAccess(allowedRoles);
  };

  const canPerformAction = (action: string, subject: string, data?: any): boolean => {
    return hasPermission(action, subject, data);
  };

  const getVisibleMenuItems = (): MenuItem[] => {
    if (!role) return [];
    return MENU_ITEMS.filter((item) => item.roles.includes(role));
  };

  return {
    loading,
    role,
    roleName: role || 'Guest',
    user,
    canAccess,
    canPerformAction,
    getVisibleMenuItems,
  };
};

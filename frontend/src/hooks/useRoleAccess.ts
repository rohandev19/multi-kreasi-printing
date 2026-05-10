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
  const { role, user, loading, hasAccess: contextHasAccess } = useRoleContext();

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    return contextHasAccess(allowedRoles);
  };

  const canPerformAction = (action: string): boolean => {
    // Requirements define specific buttons based on role
    // This is a stub that we can expand upon when building specific pages
    // e.g. if (action === 'delete_invoice' && role !== 'Owner') return false;
    
    if (!role) return false;

    // Based on Requirement 11
    if (role === 'Owner' || role === 'Manager') {
      return true; // They can perform all actions
    }

    if (role === 'Designer') {
      if (['approve_design', 'reject_design', 'request_revision'].includes(action)) return true;
      if (action === 'delete_design') return false;
    }

    if (role === 'Production_Staff') {
      if (['start_job', 'complete_job', 'report_issue'].includes(action)) return true;
      if (['delete_job', 'reassign_job'].includes(action)) return false;
    }

    if (role === 'Warehouse_Staff') {
      if (['adjust_stock', 'record_shipment'].includes(action)) return true;
      if (['delete_inventory', 'create_product'].includes(action)) return false;
    }

    if (role === 'Finance_Staff') {
      if (['record_payment', 'send_reminder'].includes(action)) return true;
      if (action === 'delete_invoice') return false;
    }

    if (role === 'Customer') {
      if (['view_order_details', 'download_invoice'].includes(action)) return true;
      if (['edit_order', 'cancel_order'].includes(action)) return false;
    }

    // Default to true for now unless explicitly restricted above, but in production we might want default false
    return true;
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

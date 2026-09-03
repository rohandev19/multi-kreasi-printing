/**
 * Icon Migration Map: Lucide to Phosphor Icons
 * 
 * This file contains the complete mapping from Lucide React icons to Phosphor Icons.
 * Use this map to systematically replace all Lucide icons throughout the application.
 * 
 * @see Requirements 3.2, 3.3, 3.4
 */

import type { IconMigrationMap } from './types';

/**
 * Comprehensive mapping of all Lucide icons used in the application
 * to their Phosphor Icons equivalents.
 * 
 * Organized by category for easier maintenance and reference.
 */
export const LUCIDE_TO_PHOSPHOR_MAP: IconMigrationMap[] = [
  // ==========================================
  // NAVIGATION ICONS (Sidebar & Menu)
  // ==========================================
  {
    lucideName: 'LayoutDashboard',
    phosphorName: 'SquaresFour',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Dashboard/grid layout icon',
  },
  {
    lucideName: 'ShoppingCart',
    phosphorName: 'ShoppingCart',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Orders/cart icon - same name',
  },
  {
    lucideName: 'Factory',
    phosphorName: 'Factory',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Production icon - same name',
  },
  {
    lucideName: 'Users',
    phosphorName: 'Users',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Staff/users icon - same name',
  },
  {
    lucideName: 'FileText',
    phosphorName: 'FileText',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Documents/invoices icon - same name',
  },
  {
    lucideName: 'Package',
    phosphorName: 'Package',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Warehouse/packaging icon - same name',
  },
  {
    lucideName: 'Palette',
    phosphorName: 'Palette',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Design files icon - same name',
  },
  {
    lucideName: 'Settings',
    phosphorName: 'Gear',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Settings icon - use Gear for more professional look',
  },
  {
    lucideName: 'ClipboardList',
    phosphorName: 'ClipboardText',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Clipboard with text/list',
  },
  {
    lucideName: 'Store',
    phosphorName: 'Storefront',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Catalog/store icon',
  },
  {
    lucideName: 'ScrollText',
    phosphorName: 'Scroll',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Audit log/history icon',
  },
  {
    lucideName: 'BarChart3',
    phosphorName: 'ChartBar',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Reports/analytics icon',
  },
  
  // ==========================================
  // ACTION ICONS (Buttons & Controls)
  // ==========================================
  {
    lucideName: 'Search',
    phosphorName: 'MagnifyingGlass',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Search functionality',
  },
  {
    lucideName: 'Bell',
    phosphorName: 'Bell',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Notifications icon - same name',
  },
  {
    lucideName: 'LogOut',
    phosphorName: 'SignOut',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Logout/sign out action',
  },
  {
    lucideName: 'Plus',
    phosphorName: 'Plus',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Add/create action - same name',
  },
  {
    lucideName: 'Check',
    phosphorName: 'Check',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Confirm/success icon - same name',
  },
  {
    lucideName: 'X',
    phosphorName: 'X',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Close/cancel icon - same name',
  },
  {
    lucideName: 'Download',
    phosphorName: 'Download',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Download action - same name',
  },
  {
    lucideName: 'Filter',
    phosphorName: 'Funnel',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Filter/funnel icon',
  },
  {
    lucideName: 'Trash2',
    phosphorName: 'Trash',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Delete action',
  },
  {
    lucideName: 'Eye',
    phosphorName: 'Eye',
    phosphorImport: '@phosphor-icons/react',
    notes: 'View/preview action - same name',
  },
  {
    lucideName: 'EyeOff',
    phosphorName: 'EyeSlash',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Hide/invisible icon',
  },
  {
    lucideName: 'Pencil',
    phosphorName: 'PencilSimple',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Edit action',
  },
  {
    lucideName: 'Copy',
    phosphorName: 'Copy',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Copy/duplicate action - same name',
  },
  {
    lucideName: 'Send',
    phosphorName: 'PaperPlaneTilt',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Send/submit action',
  },
  {
    lucideName: 'Save',
    phosphorName: 'FloppyDisk',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Save action',
  },
  {
    lucideName: 'UploadCloud',
    phosphorName: 'CloudArrowUp',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Upload to cloud',
  },
  {
    lucideName: 'Edit',
    phosphorName: 'NotePencil',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Edit/modify icon',
  },
  
  // ==========================================
  // NAVIGATION CONTROLS (Chevrons & Arrows)
  // ==========================================
  {
    lucideName: 'ChevronDown',
    phosphorName: 'CaretDown',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Dropdown/collapse indicator',
  },
  {
    lucideName: 'ChevronUp',
    phosphorName: 'CaretUp',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Expand indicator',
  },
  {
    lucideName: 'ChevronLeft',
    phosphorName: 'CaretLeft',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Previous/back navigation',
  },
  {
    lucideName: 'ChevronRight',
    phosphorName: 'CaretRight',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Next/forward navigation',
  },
  {
    lucideName: 'ArrowLeft',
    phosphorName: 'ArrowLeft',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Back navigation - same name',
  },
  {
    lucideName: 'ArrowRight',
    phosphorName: 'ArrowRight',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Forward navigation - same name',
  },
  
  // ==========================================
  // STATUS & INDICATOR ICONS
  // ==========================================
  {
    lucideName: 'CheckCircle',
    phosphorName: 'CheckCircle',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Success/completed status - same name',
  },
  {
    lucideName: 'CheckCircle2',
    phosphorName: 'CheckCircle',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Alternative check circle in Lucide',
  },
  {
    lucideName: 'XCircle',
    phosphorName: 'XCircle',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Error/cancelled status - same name',
  },
  {
    lucideName: 'AlertCircle',
    phosphorName: 'WarningCircle',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Warning/alert status',
  },
  {
    lucideName: 'AlertTriangle',
    phosphorName: 'Warning',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Warning indicator',
  },
  {
    lucideName: 'Clock',
    phosphorName: 'Clock',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Pending/time status - same name',
  },
  {
    lucideName: 'ClipboardCheck',
    phosphorName: 'ClipboardText',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Completed task/checklist',
  },
  {
    lucideName: 'Play',
    phosphorName: 'Play',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Start/play action - same name',
  },
  
  // ==========================================
  // BUSINESS & COMMERCE ICONS
  // ==========================================
  {
    lucideName: 'DollarSign',
    phosphorName: 'CurrencyDollar',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Currency/pricing icon',
  },
  {
    lucideName: 'CreditCard',
    phosphorName: 'CreditCard',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Payment icon - same name',
  },
  {
    lucideName: 'ShoppingBag',
    phosphorName: 'ShoppingBag',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Shopping/orders icon - same name',
  },
  {
    lucideName: 'Printer',
    phosphorName: 'Printer',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Print action - same name',
  },
  {
    lucideName: 'Building',
    phosphorName: 'Buildings',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Company/organization icon',
  },
  {
    lucideName: 'Building2',
    phosphorName: 'BuildingOffice',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Office building icon',
  },
  
  // ==========================================
  // TREND & ANALYTICS ICONS
  // ==========================================
  {
    lucideName: 'TrendingUp',
    phosphorName: 'TrendUp',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Positive trend indicator',
  },
  {
    lucideName: 'TrendingDown',
    phosphorName: 'TrendDown',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Negative trend indicator',
  },
  
  // ==========================================
  // COMMUNICATION ICONS
  // ==========================================
  {
    lucideName: 'Mail',
    phosphorName: 'Envelope',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Email/message icon',
  },
  {
    lucideName: 'MessageCircle',
    phosphorName: 'ChatCircle',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Chat/messaging icon',
  },
  {
    lucideName: 'Headphones',
    phosphorName: 'Headphones',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Support/help icon - same name',
  },
  
  // ==========================================
  // UI COMPONENT ICONS
  // ==========================================
  {
    lucideName: 'User',
    phosphorName: 'User',
    phosphorImport: '@phosphor-icons/react',
    notes: 'User profile icon - same name',
  },
  {
    lucideName: 'Shield',
    phosphorName: 'Shield',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Security/protection icon - same name',
  },
  {
    lucideName: 'ShieldCheck',
    phosphorName: 'ShieldCheck',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Verified/secure icon - same name',
  },
  {
    lucideName: 'Key',
    phosphorName: 'Key',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Password/security icon - same name',
  },
  {
    lucideName: 'Lock',
    phosphorName: 'Lock',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Locked/secure icon - same name',
  },
  {
    lucideName: 'Calendar',
    phosphorName: 'Calendar',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Date/calendar icon - same name',
  },
  {
    lucideName: 'Star',
    phosphorName: 'Star',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Rating/favorite icon - same name',
  },
  
  // ==========================================
  // LAYOUT & VIEW ICONS
  // ==========================================
  {
    lucideName: 'LayoutList',
    phosphorName: 'ListBullets',
    phosphorImport: '@phosphor-icons/react',
    notes: 'List view icon',
  },
  {
    lucideName: 'LayoutGrid',
    phosphorName: 'GridFour',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Grid view icon',
  },
  {
    lucideName: 'List',
    phosphorName: 'List',
    phosphorImport: '@phosphor-icons/react',
    notes: 'List/menu icon - same name',
  },
  {
    lucideName: 'Columns',
    phosphorName: 'Columns',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Column layout icon - same name',
  },
  {
    lucideName: 'MoreVertical',
    phosphorName: 'DotsThreeVertical',
    phosphorImport: '@phosphor-icons/react',
    notes: 'More options menu (vertical)',
  },
  {
    lucideName: 'GripVertical',
    phosphorName: 'DotsSixVertical',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Drag handle icon',
  },
  
  // ==========================================
  // MEDIA & CONTENT ICONS
  // ==========================================
  {
    lucideName: 'FileImage',
    phosphorName: 'FileImage',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Image file icon - same name',
  },
  {
    lucideName: 'Truck',
    phosphorName: 'Truck',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Delivery/shipping icon - same name',
  },
  {
    lucideName: 'Zap',
    phosphorName: 'Lightning',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Fast/express icon',
  },
  {
    lucideName: 'BadgePercent',
    phosphorName: 'Percent',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Discount/percentage icon',
  },
  {
    lucideName: 'HelpCircle',
    phosphorName: 'Question',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Help/FAQ icon',
  },
  {
    lucideName: 'FileQuestion',
    phosphorName: 'FileX',
    phosphorImport: '@phosphor-icons/react',
    notes: '404/not found icon',
  },
  {
    lucideName: 'Home',
    phosphorName: 'House',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Home/homepage icon',
  },
  {
    lucideName: 'Activity',
    phosphorName: 'Activity',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Activity/pulse icon - same name',
  },
  {
    lucideName: 'Link2',
    phosphorName: 'Link',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Link/URL icon',
  },
  {
    lucideName: 'Sliders',
    phosphorName: 'Faders',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Settings/adjustments icon',
  },
  {
    lucideName: 'Briefcase',
    phosphorName: 'Briefcase',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Business/job icon - same name',
  },
  {
    lucideName: 'MapPin',
    phosphorName: 'MapPin',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Location icon - same name',
  },
  {
    lucideName: 'Minus',
    phosphorName: 'Minus',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Subtract/remove icon - same name',
  },
  {
    lucideName: 'SearchX',
    phosphorName: 'MagnifyingGlass',
    phosphorImport: '@phosphor-icons/react',
    notes: 'No search results - use regular search with X nearby',
  },
  {
    lucideName: 'RefreshCw',
    phosphorName: 'ArrowClockwise',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Refresh/reload icon',
  },
  {
    lucideName: 'Menu',
    phosphorName: 'List',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Menu/hamburger icon',
  },
  {
    lucideName: 'CircleDollarSign',
    phosphorName: 'CurrencyCircleDollar',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Dollar sign in circle',
  },
  {
    lucideName: 'Server',
    phosphorName: 'Database',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Server/database icon',
  },
  {
    lucideName: 'Inbox',
    phosphorName: 'Tray',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Inbox/tray icon',
  },
  {
    lucideName: 'PackageMinus',
    phosphorName: 'Package',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Package with minus - use Package with separate minus icon',
  },
  {
    lucideName: 'PackagePlus',
    phosphorName: 'Package',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Package with plus - use Package with separate plus icon',
  },
  {
    lucideName: 'Phone',
    phosphorName: 'Phone',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Phone icon - same name',
  },
  {
    lucideName: 'Award',
    phosphorName: 'Medal',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Award/medal icon',
  },
  {
    lucideName: 'Image',
    phosphorName: 'Image',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Image icon - same name',
  },
  {
    lucideName: 'Banknote',
    phosphorName: 'Money',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Banknote/money icon',
  },
  {
    lucideName: 'ArrowRightLeft',
    phosphorName: 'ArrowsLeftRight',
    phosphorImport: '@phosphor-icons/react',
    notes: 'Swap/transfer icon',
  },
];

/**
 * Helper function to find Phosphor equivalent for a Lucide icon
 * @param lucideIconName - The name of the Lucide icon
 * @returns The IconMigrationMap entry or undefined if not found
 */
export function findPhosphorEquivalent(lucideIconName: string): IconMigrationMap | undefined {
  return LUCIDE_TO_PHOSPHOR_MAP.find(map => map.lucideName === lucideIconName);
}

/**
 * Helper function to get all Lucide icon names in the map
 * @returns Array of Lucide icon names
 */
export function getAllLucideIconNames(): string[] {
  return LUCIDE_TO_PHOSPHOR_MAP.map(map => map.lucideName);
}

/**
 * Helper function to get all Phosphor icon names in the map
 * @returns Array of Phosphor icon names
 */
export function getAllPhosphorIconNames(): string[] {
  return LUCIDE_TO_PHOSPHOR_MAP.map(map => map.phosphorName);
}

/**
 * Helper function to check if a Lucide icon has a mapping
 * @param lucideIconName - The name of the Lucide icon
 * @returns True if mapping exists, false otherwise
 */
export function hasPhosphorMapping(lucideIconName: string): boolean {
  return LUCIDE_TO_PHOSPHOR_MAP.some(map => map.lucideName === lucideIconName);
}

/**
 * Export as default for easier imports
 */
export default LUCIDE_TO_PHOSPHOR_MAP;

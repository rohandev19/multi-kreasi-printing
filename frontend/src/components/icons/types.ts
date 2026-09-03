/**
 * Icon System Type Definitions
 * 
 * Defines the interface for icon components in the Multi Kreasi Printing application.
 * This type system supports the migration from Lucide to Phosphor Icons.
 */

/**
 * Weight options for Phosphor Icons
 * Controls the stroke thickness of icon rendering
 */
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

/**
 * Base props interface for all icon components
 * Compatible with Phosphor Icons prop structure
 */
export interface IconProps {
  /**
   * Icon size in pixels or CSS size string
   * @default 20
   */
  size?: number | string;
  
  /**
   * Icon color (CSS color value)
   * @default "currentColor"
   */
  color?: string;
  
  /**
   * Stroke weight of the icon
   * @default "regular"
   */
  weight?: IconWeight;
  
  /**
   * Additional CSS classes to apply to the icon
   */
  className?: string;
  
  /**
   * Accessibility label for screen readers
   * Should be provided when icon has semantic meaning
   */
  'aria-label'?: string;
  
  /**
   * Mirrored rendering for RTL support
   * @default false
   */
  mirrored?: boolean;
}

/**
 * Type for icon component functions
 * Represents a React functional component that accepts IconProps
 */
export type IconComponent = React.FC<IconProps>;

/**
 * Navigation item configuration with icon support
 */
export interface NavigationItemProps {
  /**
   * Route path for navigation
   */
  path: string;
  
  /**
   * Icon component to display
   */
  icon: React.ReactNode;
  
  /**
   * Label text for the navigation item
   */
  label: string;
  
  /**
   * Active state indicator
   */
  isActive: boolean;
  
  /**
   * Optional badge to display (e.g., notification count)
   */
  badge?: number | string;
  
  /**
   * Roles that can see this navigation item
   */
  roles: string[];
}

/**
 * Icon migration mapping entry
 * Used to map Lucide icon names to Phosphor equivalents
 */
export interface IconMigrationMap {
  /**
   * Original Lucide icon name
   */
  lucideName: string;
  
  /**
   * Corresponding Phosphor icon name
   */
  phosphorName: string;
  
  /**
   * Import path for the Phosphor icon
   * @example '@phosphor-icons/react'
   */
  phosphorImport: string;
  
  /**
   * Optional notes about the mapping or usage differences
   */
  notes?: string;
}

/**
 * Configuration for icon rendering in different contexts
 */
export interface IconConfig {
  /**
   * Default size for navigation icons
   */
  navigationSize: number;
  
  /**
   * Default size for action buttons
   */
  actionSize: number;
  
  /**
   * Default size for small inline icons
   */
  inlineSize: number;
  
  /**
   * Default weight for all icons
   */
  defaultWeight: IconWeight;
}

/**
 * Default icon configuration values
 */
export const DEFAULT_ICON_CONFIG: IconConfig = {
  navigationSize: 20,
  actionSize: 16,
  inlineSize: 14,
  defaultWeight: 'regular',
};

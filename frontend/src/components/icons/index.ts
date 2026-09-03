/**
 * Icon System Exports
 * 
 * Central export point for the icon system, including types and migration utilities.
 * Import from this file to access icon-related functionality.
 * 
 * @example
 * ```typescript
 * import { IconProps, LUCIDE_TO_PHOSPHOR_MAP, findPhosphorEquivalent } from '@/components/icons';
 * ```
 */

// Export all types
export type {
  IconProps,
  IconWeight,
  IconComponent,
  NavigationItemProps,
  IconMigrationMap,
  IconConfig,
} from './types';

// Export default config
export { DEFAULT_ICON_CONFIG } from './types';

// Export migration map and helper functions
export {
  LUCIDE_TO_PHOSPHOR_MAP,
  findPhosphorEquivalent,
  getAllLucideIconNames,
  getAllPhosphorIconNames,
  hasPhosphorMapping,
} from './migration-map';

// Default export for the migration map
export { default as migrationMap } from './migration-map';

# Icon System Migration Utilities

This directory contains the icon system type definitions and migration utilities for replacing Lucide icons with Phosphor Icons throughout the Multi Kreasi Printing application.

## Files

### `types.ts`
Defines TypeScript interfaces and types for the icon system:
- `IconProps` - Base props interface for all icon components
- `IconWeight` - Type for Phosphor icon weights ('thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone')
- `IconComponent` - Type for React icon components
- `NavigationItemProps` - Interface for navigation items with icons
- `IconMigrationMap` - Interface for icon migration mappings
- `IconConfig` - Configuration for icon rendering
- `DEFAULT_ICON_CONFIG` - Default icon configuration values

### `migration-map.ts`
Contains the comprehensive mapping of all Lucide icons used in the application to their Phosphor Icons equivalents:
- `LUCIDE_TO_PHOSPHOR_MAP` - Array of 90+ icon mappings organized by category
- `findPhosphorEquivalent()` - Helper to find Phosphor icon for a given Lucide icon
- `getAllLucideIconNames()` - Get all Lucide icon names in the map
- `getAllPhosphorIconNames()` - Get all Phosphor icon names in the map
- `hasPhosphorMapping()` - Check if a Lucide icon has a mapping

### `index.ts`
Central export point for all icon system functionality.

## Usage

### Basic Import
```typescript
import { IconProps, LUCIDE_TO_PHOSPHOR_MAP } from '@/components/icons';
```

### Finding a Phosphor Equivalent
```typescript
import { findPhosphorEquivalent } from '@/components/icons';

const mapping = findPhosphorEquivalent('LayoutDashboard');
// Returns: { lucideName: 'LayoutDashboard', phosphorName: 'SquaresFour', ... }
```

### Using IconProps Interface
```typescript
import { IconProps } from '@/components/icons';
import { SquaresFour } from '@phosphor-icons/react';

const MyComponent = () => {
  const iconProps: IconProps = {
    size: 20,
    weight: 'regular',
    color: 'currentColor',
    'aria-label': 'Dashboard icon'
  };
  
  return <SquaresFour {...iconProps} />;
};
```

### Checking Icon Mappings
```typescript
import { hasPhosphorMapping, getAllLucideIconNames } from '@/components/icons';

// Check if an icon has a mapping
if (hasPhosphorMapping('Settings')) {
  console.log('Mapping exists!');
}

// Get all mapped icons
const allIcons = getAllLucideIconNames();
console.log(`Total mapped icons: ${allIcons.length}`);
```

## Icon Migration Guide

### Step 1: Find the Phosphor Equivalent
Check `migration-map.ts` to find the Phosphor icon name for your Lucide icon.

Example: `LayoutDashboard` → `SquaresFour`

### Step 2: Update Imports
Replace Lucide imports with Phosphor imports:

**Before:**
```typescript
import { LayoutDashboard, Settings, Users } from 'lucide-react';
```

**After:**
```typescript
import { SquaresFour, Gear, Users } from '@phosphor-icons/react';
```

### Step 3: Update Component Usage
Update the icon component in your JSX:

**Before:**
```tsx
<LayoutDashboard size={20} />
```

**After:**
```tsx
<SquaresFour size={20} weight="regular" />
```

### Step 4: Update Props
Phosphor icons support additional props:
- `weight` - Controls stroke thickness ('thin' | 'light' | 'regular' | 'bold' | 'fill')
- `mirrored` - For RTL support

## Icon Categories in Migration Map

The migration map organizes icons into categories:

1. **Navigation Icons** - Sidebar and menu icons (Dashboard, Orders, Settings, etc.)
2. **Action Icons** - Buttons and controls (Search, Download, Edit, etc.)
3. **Navigation Controls** - Chevrons and arrows (CaretDown, ArrowLeft, etc.)
4. **Status & Indicator Icons** - Status indicators (CheckCircle, Warning, Clock, etc.)
5. **Business & Commerce Icons** - Business-specific icons (CurrencyDollar, CreditCard, etc.)
6. **Trend & Analytics Icons** - Chart and trend icons (TrendUp, TrendDown, etc.)
7. **Communication Icons** - Messaging icons (Envelope, ChatCircle, etc.)
8. **UI Component Icons** - Common UI elements (User, Shield, Calendar, etc.)
9. **Layout & View Icons** - Layout controls (GridFour, ListBullets, etc.)
10. **Media & Content Icons** - Media and content icons (FileImage, Truck, etc.)

## Design Requirements

This icon system satisfies the following requirements from the Remove AI Slop Design spec:

- **Requirement 3.2**: Replace Lucide Icons with Phosphor Icons library
- **Requirement 3.3**: Maintain consistent stroke width across all icons
- **Requirement 3.4**: Use consistent sizing (16px or 20px for navigation)

## Configuration

Default icon sizes are defined in `DEFAULT_ICON_CONFIG`:
- Navigation icons: 20px
- Action buttons: 16px
- Inline icons: 14px
- Default weight: 'regular'

## Notes

- All Phosphor icons use the same import path: `@phosphor-icons/react`
- Some icons have the same name in both libraries (e.g., `Users`, `Package`, `Bell`)
- Some icons are renamed for clarity (e.g., `Settings` → `Gear`, `Search` → `MagnifyingGlass`)
- The migration map includes notes for each mapping to explain differences

## Next Steps

After creating these utilities, the next tasks will:
1. Install the Phosphor Icons package
2. Update components to use Phosphor icons
3. Remove Lucide React dependency
4. Test icon rendering across all pages

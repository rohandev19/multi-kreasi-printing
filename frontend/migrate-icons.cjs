const fs = require('fs');
const path = require('path');

// Migration map from Lucide to Phosphor icons
const iconMap = {
  // Navigation
  'LayoutDashboard': 'SquaresFour',
  'ShoppingCart': 'ShoppingCart',
  'Factory': 'Factory',
  'Users': 'Users',
  'FileText': 'FileText',
  'Package': 'Package',
  'Palette': 'Palette',
  'Settings': 'Gear',
  'ClipboardList': 'ClipboardText',
  'Store': 'Storefront',
  'ScrollText': 'Scroll',
  'BarChart3': 'ChartBar',
  
  // Actions
  'Search': 'MagnifyingGlass',
  'Bell': 'Bell',
  'LogOut': 'SignOut',
  'Plus': 'Plus',
  'Check': 'Check',
  'X': 'X',
  'Download': 'Download',
  'Filter': 'Funnel',
  'Trash2': 'Trash',
  'Eye': 'Eye',
  'EyeOff': 'EyeSlash',
  'Pencil': 'PencilSimple',
  'Copy': 'Copy',
  'Send': 'PaperPlaneTilt',
  'Save': 'FloppyDisk',
  'UploadCloud': 'CloudArrowUp',
  'Edit': 'NotePencil',
  
  // Navigation Controls
  'ChevronDown': 'CaretDown',
  'ChevronUp': 'CaretUp',
  'ChevronLeft': 'CaretLeft',
  'ChevronRight': 'CaretRight',
  'ArrowLeft': 'ArrowLeft',
  'ArrowRight': 'ArrowRight',
  
  // Status
  'CheckCircle': 'CheckCircle',
  'CheckCircle2': 'CheckCircle',
  'XCircle': 'XCircle',
  'AlertCircle': 'WarningCircle',
  'AlertTriangle': 'Warning',
  'Clock': 'Clock',
  'ClipboardCheck': 'ClipboardText',
  'Play': 'Play',
  
  // Business
  'DollarSign': 'CurrencyDollar',
  'CreditCard': 'CreditCard',
  'ShoppingBag': 'ShoppingBag',
  'Printer': 'Printer',
  'Building': 'Buildings',
  'Building2': 'BuildingOffice',
  
  // Trends
  'TrendingUp': 'TrendUp',
  'TrendingDown': 'TrendDown',
  
  // Communication
  'Mail': 'Envelope',
  'MessageCircle': 'ChatCircle',
  'Headphones': 'Headphones',
  
  // UI
  'User': 'User',
  'Shield': 'Shield',
  'ShieldCheck': 'ShieldCheck',
  'Key': 'Key',
  'Lock': 'Lock',
  'Calendar': 'Calendar',
  'Star': 'Star',
  
  // Layout
  'LayoutList': 'ListBullets',
  'LayoutGrid': 'GridFour',
  'List': 'List',
  'Columns': 'Columns',
  'MoreVertical': 'DotsThreeVertical',
  'GripVertical': 'DotsSixVertical',
  
  // Media
  'FileImage': 'FileImage',
  'Truck': 'Truck',
  'Zap': 'Lightning',
  'BadgePercent': 'Percent',
  'HelpCircle': 'Question',
  'FileQuestion': 'FileX',
  'Home': 'House',
  'Activity': 'Activity',
  'Link2': 'Link',
  'Sliders': 'Faders',
  'Briefcase': 'Briefcase',
  'MapPin': 'MapPin',
  'Minus': 'Minus',
  'SearchX': 'MagnifyingGlass',
  'Info': 'Info',
  'RefreshCw': 'ArrowClockwise',
  'Menu': 'List',
  'CircleDollarSign': 'CurrencyCircleDollar',
  'Server': 'Database',
  'Inbox': 'Tray',
  'PackageMinus': 'Package',
  'PackagePlus': 'Package',
  'Phone': 'Phone',
  'Award': 'Medal',
  'Image': 'Image',
  'Banknote': 'Money',
  'ArrowRightLeft': 'ArrowsLeftRight',
};

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file imports from lucide-react
  if (!content.includes("from 'lucide-react'") && !content.includes('from "lucide-react"')) {
    return false;
  }
  
  console.log(`\nMigrating: ${filePath}`);
  
  // Extract the import statement
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/g;
  const match = importRegex.exec(content);
  
  if (match) {
    const imports = match[1].split(',').map(i => i.trim());
    const phosphorImports = [];
    const unmappedIcons = [];
    
    imports.forEach(lucideIcon => {
      if (iconMap[lucideIcon]) {
        phosphorImports.push(iconMap[lucideIcon]);
        console.log(`  ${lucideIcon} → ${iconMap[lucideIcon]}`);
      } else {
        unmappedIcons.push(lucideIcon);
        console.log(`  ⚠️  ${lucideIcon} → NOT MAPPED`);
      }
    });
    
    if (unmappedIcons.length > 0) {
      console.log(`  WARNING: Unmapped icons: ${unmappedIcons.join(', ')}`);
    }
    
    // Replace import statement
    const newImport = `import { ${phosphorImports.join(', ')} } from '@phosphor-icons/react'`;
    content = content.replace(match[0], newImport);
    modified = true;
    
    // Replace usage in JSX
    imports.forEach(lucideIcon => {
      if (iconMap[lucideIcon]) {
        const phosphorIcon = iconMap[lucideIcon];
        
        // Replace self-closing tags: <Icon />
        const selfClosingRegex = new RegExp(`<${lucideIcon}([^>]*?)/?>`, 'g');
        content = content.replace(selfClosingRegex, (match, props) => {
          // Check if weight prop already exists
          if (props && !props.includes('weight=')) {
            const trimmedProps = props.trim();
            return `<${phosphorIcon}${trimmedProps ? ' ' + trimmedProps : ''} weight="regular" />`;
          }
          return `<${phosphorIcon}${props} />`;
        });
      }
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ File migrated successfully`);
    return true;
  }
  
  return false;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
console.log('Starting icon migration from Lucide to Phosphor...');
console.log(`Scanning directory: ${srcDir}\n`);

const allFiles = walkDir(srcDir);
let migratedCount = 0;

allFiles.forEach(file => {
  if (migrateFile(file)) {
    migratedCount++;
  }
});

console.log(`\n✓ Migration complete! ${migratedCount} files were migrated.`);

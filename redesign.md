# Panduan Lengkap Redesign UI/UX — stitch.withgoogle.com

> **Dokumen ini berisi prompt yang sangat detail untuk setiap halaman, komponen, modal, alert, dan state di aplikasi Multi Kreasi Printing.**
> Paste prompt langsung ke [stitch.withgoogle.com](https://stitch.withgoogle.com) — output-nya bisa langsung di-copy ke project.

---

## 📋 Bagian 1: Master Prompt Template (WAJIB PASTE DI AWAL)

Copy-paste blok di bawah ini **sebagai System Prompt / konteks awal** sebelum paste prompt halaman spesifik. Jika Stitch hanya mendukung satu prompt box, gabungkan Master Prompt + Prompt Halaman jadi satu.

```text
You are an expert React + Tailwind CSS developer building a premium Enterprise B2B Web Application for a printing company called "Multi Kreasi Printing" (abbreviated MK Printing).

=== STRICT TECHNICAL CONSTRAINTS ===
1. FRAMEWORK: React 18+ Functional Components with TypeScript types (use `interface` for props).
2. STYLING: Tailwind CSS only — NO custom CSS files, NO inline styles except for `style={{ backdropFilter }}` where needed.
3. ICONS: Lucide React ONLY — import from 'lucide-react'. Never use emojis, Heroicons, or FontAwesome.
4. FONT: 'Inter' (loaded via Google Fonts). Apply `font-sans` which maps to Inter.
5. ROUTING: Use `<Link to="...">` from 'react-router-dom', never `<a href>`.
6. CURRENCY: Always format IDR with `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`.

=== DESIGN SYSTEM ===
COLORS:
- Primary: `indigo-600` (buttons, links, active states), `indigo-700` (hover), `indigo-50` (subtle bg)
- Page background: `bg-slate-50`
- Card surface: `bg-white` with `border border-slate-200` or `border-slate-100`
- Text: `text-slate-900` (headings), `text-slate-600` (body), `text-slate-400` (muted/captions)
- Danger: `red-600` / `red-50` / `red-100`
- Success: `emerald-600` / `emerald-50` / `emerald-100`
- Warning: `amber-600` / `amber-50` / `amber-100`
- Info: `blue-600` / `blue-50` / `blue-100`

CORNERS & SHADOWS:
- Cards: `rounded-xl` or `rounded-2xl`, `shadow-sm`
- Buttons: `rounded-xl`, large primary = `rounded-xl`, pill = `rounded-full`
- Modals: `rounded-xl shadow-2xl`
- Input fields: `rounded-xl` with `focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`

STATUS BADGES (consistent everywhere):
- Pending / Draft: `bg-amber-100 text-amber-700 border border-amber-200`
- Approved / Active: `bg-blue-100 text-blue-700 border border-blue-200`
- In Progress: `bg-indigo-100 text-indigo-700 border border-indigo-200`
- Completed / Paid: `bg-emerald-100 text-emerald-700 border border-emerald-200`
- Cancelled / Failed / Overdue: `bg-red-100 text-red-700 border border-red-200`
- Shipped / Delivered: `bg-purple-100 text-purple-700 border border-purple-200`

ANIMATIONS:
- Page entrance: fade-in + subtle translateY (200ms ease-out)
- Modal entrance: translateY(12px) + scale(0.97) → normal (200ms ease-out)
- Toast entrance: translateX(100%) → translateX(0) (300ms cubic-bezier(0.16,1,0.3,1))
- Hover transitions: `transition-all duration-200`
- Loading spinner: `animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600`
- Skeleton loading: `animate-pulse bg-slate-200 rounded-xl`

=== USER JOURNEY / APPLICATION FLOW ===
This is a PUBLIC-FIRST application. When ANY user (logged-in or not) first opens the URL, they land on the PUBLIC Homepage ("/"), NOT a login page or dashboard.

PUBLIC PAGES (accessible without login):
- "/" — Homepage / Landing Page (hero, services, CTA)
- "/products" — Product Catalog (browse, search, filter all printing products)
- "/products/:id" — Product Detail (specs, configuration, add to cart)
- "/cart" — Shopping Cart (review items, adjust quantities)
- "/about" — About Us
- "/contact" — Contact Us
- "/terms" — Terms & Conditions
- "/login" — Login page
- "/register" — Registration page (creates a Customer account)
- "/verify-email/:token" — Email verification after registration

AUTH WALL — Login is required ONLY when:
1. User clicks "Proceed to Checkout" from the cart → redirects to /login?redirect=/dashboard/checkout if not logged in
2. User navigates to any "/dashboard/*" route → redirects to /login if not logged in

POST-LOGIN REDIRECT:
- Customer role → redirected to "/products" (continue shopping)
- All staff roles (Owner, Manager, Sales, etc.) → redirected to "/dashboard"

PUBLIC LAYOUT vs DASHBOARD LAYOUT:
- Public pages use PublicLayout: public Navbar (logo, nav links, cart icon, login/signup buttons) + Footer
- Dashboard pages use AppLayout: Sidebar (role-based menu) + Header (search, notifications, avatar)
- The Navbar on public pages shows "Log In" / "Sign Up" buttons when NOT authenticated, and shows the user's avatar + dropdown when authenticated

CART BEHAVIOR:
- Guests CAN add items to cart (stored in localStorage or session)
- Cart persists after login (merged with server-side cart)
- Checkout requires authentication

=== COMPONENT CONVENTIONS ===
- Export as named export: `export const ComponentName = () => { ... }`
- Include realistic mock data (Indonesian company names, IDR prices, real-ish printing products)
- Always include ALL states: loading, empty, error, populated
- Tables must have: search input, filter dropdowns, column sort indicators, pagination
- Forms must have: inline validation, disabled states, loading spinner on submit button
- Every interactive element needs `hover:`, `focus:`, `active:`, and `disabled:` states

=== RBAC ROLES ===
Owner, Manager, Sales, Designer, Production_Staff, Finance_Staff, Warehouse_Staff, Customer
Mock with: `const userRole = 'Manager'`

=== SIDEBAR MENU STRUCTURE (by role) ===
- Customer: Catalog, Dashboard, My Orders, Invoices
- Owner / Manager: Dashboard, Orders, Production, Design Files, Warehouse, Users, Customers, Invoices
- Designer: Dashboard, Orders, Design Files
- Production_Staff: Dashboard, Orders, Production
- Warehouse_Staff: Dashboard, Warehouse
- Finance_Staff: Dashboard, Orders, Customers, Invoices
- Sales: Dashboard, Orders, Customers

Provide ONLY the complete React+TypeScript code in a single file.
```

---

## 📐 Bagian 2: Shared UI Components (Paste Satu-Satu)

### 2.1 🔲 Modal Component (Base)

```text
Generate a reusable Modal component for the MK Printing application.

COMPONENT API:
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideHeader?: boolean;
}

VISUAL SPECS:
- Overlay: `fixed inset-0 z-50`, background `rgba(15, 23, 42, 0.6)` with `backdrop-filter: blur(4px)`
- Modal panel: `bg-white rounded-xl shadow-2xl` centered vertically and horizontally with `p-4` safe area
- Header: `px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl` with title (text-lg font-bold text-slate-800) and X close button (Lucide X icon, 18px, slate-400 hover:slate-600, rounded-full hover:bg-slate-200 p-1.5)
- Size map: sm=max-w-sm, md=max-w-md, lg=max-w-lg, xl=max-w-xl, 2xl=max-w-2xl
- Animation: keyframe `modal-in` from opacity:0 translateY(12px) scale(0.97) to opacity:1 translateY(0) scale(1), 200ms ease-out
- Close on Escape key press
- Close on overlay click (but NOT on modal panel click — use ref comparison)
- When open: `document.body.style.overflow = 'hidden'`
- When unmounted/closed: restore overflow to ''
- Accessibility: role="dialog", aria-modal="true", aria-label={title}

Export as `export const Modal`.
```

### 2.2 ✅ Confirm Dialog

```text
Generate a ConfirmDialog component built on top of the Modal component.

COMPONENT API:
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;   // default: "Confirm"
  cancelLabel?: string;    // default: "Cancel"
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

VISUAL SPECS per variant:
- danger: icon = Trash2 (Lucide, 24px, text-red-600), icon bg = bg-red-100 rounded-full w-12 h-12, confirm button = bg-red-600 hover:bg-red-700 focus:ring-red-500
- warning: icon = AlertTriangle (Lucide, 24px, text-amber-600), icon bg = bg-amber-100, button = bg-amber-600 hover:bg-amber-700 focus:ring-amber-500
- info: icon = Info (Lucide, 24px, text-blue-600), icon bg = bg-blue-100, button = bg-blue-600 hover:bg-blue-700 focus:ring-blue-500

LAYOUT:
- Uses Modal with size="sm"
- Content area (p-6): horizontal flex with icon circle on left, message text on right (text-sm text-slate-600 leading-relaxed)
- Footer: `px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3`
  - Cancel button: `px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50`
  - Confirm button: `px-4 py-2 text-sm font-medium text-white rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50` + variant color classes
  - When loading=true: confirm text changes to "Processing..."
  - Both buttons disabled when loading=true

Export as `export const ConfirmDialog`.
```

### 2.3 🍞 Toast / Notification System

```text
Generate a ToastProvider + useToast hook for the MK Printing application.

TOAST TYPES: 'success' | 'error' | 'info'

TOAST MESSAGE SHAPE:
{ id: string, type: ToastType, title: string, message?: string }

PROVIDER BEHAVIOR:
- Maintains a `toasts` state array
- `addToast(type, title, message?)` — generates random id, appends toast, auto-removes after 5 seconds
- Convenience methods: `success(title, message?)`, `error(title, message?)`, `info(title, message?)`
- `removeToast(id)` — immediately removes a toast

VISUAL SPECS:
- Container: `fixed bottom-4 right-4 z-[60] flex flex-col gap-2`
- Each toast card: `flex items-start gap-3 w-80 p-4 rounded-xl shadow-lg border`
  - success: `bg-emerald-50 border-emerald-200 text-emerald-800` with CheckCircle icon (20px, text-emerald-500)
  - error: `bg-red-50 border-red-200 text-red-800` with AlertCircle icon (20px, text-red-500)
  - info: `bg-blue-50 border-blue-200 text-blue-800` with Info icon (20px, text-blue-500)
- Left: icon (flex-shrink-0 mt-0.5)
- Center: title (font-semibold text-sm) + optional message (text-xs opacity-90 mt-1)
- Right: X close button (16px, text-current opacity-50 hover:opacity-100)
- Animation: `@keyframes toast-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }` 300ms cubic-bezier(0.16,1,0.3,1)

Export: `export const ToastProvider` and `export const useToast`.
```

### 2.4 📊 Metric Card (Dashboard KPI)

```text
Generate a reusable MetricCard component.

COMPONENT API:
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;  // Lucide icon element
  trend?: { value: number; direction: 'up' | 'down' };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

VISUAL SPECS:
- Card: `bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow`
- Layout: flex between left content and right icon circle
- Left side:
  - Title: `text-sm font-medium text-slate-500 mb-1`
  - Value: `text-3xl font-extrabold text-slate-900 tracking-tight`
  - Subtitle/trend area: `flex items-center gap-2 mt-2`
    - If trend is present: show TrendingUp or TrendingDown icon (14px) + percentage text
    - Trend up: `text-emerald-600 font-semibold text-sm`
    - Trend down: `text-red-600 font-semibold text-sm`
    - Subtitle: `text-xs text-slate-400`
- Right side: icon in a colored circle (w-14 h-14 rounded-2xl flex items-center justify-center)
  - default: `bg-indigo-50 text-indigo-600`
  - success: `bg-emerald-50 text-emerald-600`
  - warning: `bg-amber-50 text-amber-600`
  - danger: `bg-red-50 text-red-600`
  - Icon size: 28px

Export as `export const MetricCard`.
```

### 2.5 📄 Data Table (Reusable)

```text
Generate a reusable DataTable wrapper component for the MK Printing application.

FEATURES:
1. Search bar (top-left): Lucide Search icon (18px, text-slate-400) inside a `relative` wrapper. Input: `pl-10 pr-4 py-2.5 w-72 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder:text-slate-400`
2. Filter dropdowns (top-right area): styled `<select>` with `px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500`
3. Action button slot (top-right): primary CTA button `h-10 px-5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm`
4. Table: `w-full border-collapse`
   - Thead: `bg-slate-50 border-b border-slate-200`
   - Th: `px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider` with sort arrows (ChevronUp/ChevronDown, 12px)
   - Tbody tr: `border-b border-slate-100 hover:bg-slate-50/50 transition-colors`
   - Td: `px-6 py-4 text-sm text-slate-700`
   - Checkbox column (optional): `w-12` with indigo-600 accent checkbox
5. Pagination (bottom):
   - Left: `text-sm text-slate-500 font-medium` showing "Showing 1-10 of 85 results"
   - Right: button group with Previous/Next + page numbers
   - Active page: `bg-indigo-600 text-white border-indigo-600`
   - Inactive page: `bg-white text-slate-600 border-slate-200 hover:bg-slate-50`
   - Disabled: `opacity-50 cursor-not-allowed`
6. Empty state: centered div with Lucide icon (48px, text-slate-300), title (text-lg font-bold text-slate-900), subtitle (text-slate-500), optional CTA button
7. Loading state: 5 skeleton rows using `animate-pulse` with `h-4 bg-slate-200 rounded` blocks matching column widths

Export as `export const DataTable`.
```

---

## 🌐 Bagian 3: Public Pages (Accessible tanpa login)

### 3.1 🏠 Landing Page / Homepage (`/`)

```text
Generate the Landing Page / Homepage for MK Printing.

SECTIONS (in order, full-width):

1. HERO SECTION:
   - Background: `bg-slate-950` with gradient overlay `bg-gradient-to-br from-indigo-900/50 via-slate-900 to-purple-900/40`
   - Two decorative blurred circles: indigo-500/20 (800px, top-right, blur-[120px]) and purple-500/20 (600px, bottom-left, blur-[100px])
   - Content centered:
     - Badge pill: `rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold uppercase` with animated ping dot (2px green circle)
     - H1: `text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white` — main text + gradient text span `text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400`
     - Subtitle: `text-lg sm:text-xl text-slate-400 font-medium max-w-2xl`
     - Two CTA buttons: primary (rounded-full bg-indigo-600, glow shadow `shadow-[0_0_40px_rgba(79,70,229,0.3)]` hover amplified) and secondary (rounded-full bg-slate-800 border-slate-700)
     - Stats bar: `border-t border-slate-800/50 pt-8 mt-16` — "500+ Clients", dot separator, "10M+ Prints", dot separator, 5 gold Star icons (fill-current text-amber-400)

2. CORE SERVICES SECTION:
   - Background: `bg-white py-24`
   - Title + subtitle centered
   - 3-column grid of service cards: `bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300`
   - Each card: colored icon circle (w-16 h-16 rounded-2xl, group-hover:scale-110), title (text-xl font-extrabold), description, "Explore category →" link
   - Services: Corporate Identity (Package icon, blue), Marketing Materials (Printer icon, indigo), Large Format (Truck icon, purple)

3. HOW IT WORKS SECTION:
   - Background: `bg-slate-50 py-24 border-y border-slate-200`
   - 3 steps in grid with connecting horizontal line (hidden md:block, h-0.5 bg-slate-200)
   - Each step: number circle (w-24 h-24 rounded-full bg-white border-8 border-slate-50, text-2xl font-black text-indigo-600), title, description
   - Steps: "01 Upload & Configure", "02 Proof & Approve", "03 Fast Delivery"

4. WHY CHOOSE US SECTION (NEW):
   - Background: `bg-white py-24`
   - 4-column grid of feature cards
   - Features: "Quality Guarantee" (ShieldCheck, emerald), "Fast Turnaround" (Clock, blue), "Competitive Pricing" (BadgePercent, amber), "Dedicated Support" (Headphones, purple)
   - Each card: icon circle, title, 2-line description, subtle hover lift

5. TESTIMONIALS SECTION (NEW):
   - Background: `bg-slate-50 py-24 border-y border-slate-200`
   - 3-column grid of testimonial cards: `bg-white p-8 rounded-2xl border border-slate-100 shadow-sm`
   - Each: 5 Star icons (amber-400), quote text (text-slate-600 italic), avatar circle + name + company
   - Mock data: 3 Indonesian corporate clients

6. CTA SECTION:
   - `bg-indigo-600 rounded-[3rem] p-12 shadow-2xl shadow-indigo-600/20` with subtle texture overlay (opacity-10)
   - H2 white text, subtitle indigo-100, two buttons (white primary, indigo-700 secondary)

Export as `export const HomePage`.
```

### 3.2 📦 Product Catalog (`/products`)

```text
Generate the Product Catalog page for MK Printing.

PAGE STRUCTURE:

1. PAGE HEADER:
   - Breadcrumb: `text-sm text-slate-500 font-medium mb-4` — Home > Products
   - Title: `text-3xl font-extrabold text-slate-900 tracking-tight`
   - Subtitle: `text-slate-500 font-medium`

2. FILTER BAR (sticky top):
   - Background: `bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 sticky top-0 z-10`
   - Left: Search input with Search icon (magnifying glass) — `w-80 pl-10 pr-4 py-2.5 rounded-xl border-slate-200`
   - Center: Category filter pills (horizontally scrollable): "All", "Business Cards", "Flyers", "Banners", "Packaging", "Stickers", "Custom"
     - Active pill: `bg-indigo-600 text-white rounded-full px-4 py-2 text-sm font-semibold`
     - Inactive pill: `bg-slate-100 text-slate-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-slate-200`
   - Right: View toggle (Grid / List) using LayoutGrid and List icons — active = `bg-indigo-100 text-indigo-600`, inactive = `text-slate-400`
   - Right: Sort dropdown: "Newest", "Price: Low to High", "Price: High to Low", "Popular"

3. PRODUCT GRID (default view):
   - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
   - Each product card:
     - Image area: `aspect-[4/3] bg-slate-100 rounded-t-xl overflow-hidden relative group`
       - Placeholder image with `object-cover w-full h-full group-hover:scale-105 transition-transform duration-500`
       - "New" badge (if applicable): `absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md`
       - Quick view button on hover: `absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity` with "Quick View" button
     - Content area: `p-5`
       - Category tag: `text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2`
       - Product name: `text-base font-bold text-slate-900 mb-1 line-clamp-2`
       - Description: `text-sm text-slate-500 line-clamp-2 mb-3`
       - Price: `text-lg font-extrabold text-slate-900` with "starts from" label (text-xs text-slate-400)
       - Bottom row: "Add to Cart" button (`w-full h-10 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2`) with ShoppingCart icon (16px)

4. PRODUCT LIST VIEW (alternative):
   - Each row: horizontal card with image (w-48 h-32 rounded-xl), info section, price, and "Add to Cart" button
   - `bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow`

5. PAGINATION (bottom):
   - Same as DataTable pagination pattern

6. EMPTY/NO RESULTS STATE:
   - Centered: SearchX icon (48px, text-slate-300), "No products found", "Try adjusting your search or filters", "Clear Filters" button

MOCK DATA: 8-12 products (Business Cards, Flyers A5, Banners, Stickers, Packaging Boxes, Brochures, Posters, Calendars, etc.) with realistic IDR prices (Rp 50.000 - Rp 2.000.000).

Export as `export const ProductsCatalog`.
```

### 3.3 🔍 Product Detail (`/products/:id`)

```text
Generate a Product Detail page for MK Printing.

PAGE LAYOUT (2-column on desktop):

LEFT COLUMN (lg:w-1/2):
1. Main Image:
   - `aspect-square bg-slate-100 rounded-2xl overflow-hidden` with image
   - Zoom on hover: `hover:scale-105 transition-transform duration-500 cursor-zoom-in`
2. Thumbnail Gallery (below):
   - Horizontal row of 4-5 thumbnails: `w-16 h-16 rounded-lg border-2 cursor-pointer`
   - Active: `border-indigo-600`
   - Inactive: `border-slate-200 hover:border-slate-300`

RIGHT COLUMN (lg:w-1/2):
1. Breadcrumb: Home > Products > {Category} > {Product Name}
2. Category badge: `text-xs font-semibold text-indigo-600 uppercase tracking-wider`
3. Product Title: `text-3xl font-extrabold text-slate-900 tracking-tight mb-2`
4. Rating row: 5 Star icons (fill amber-400) + review count + "Write a review" link
5. Price: `text-3xl font-extrabold text-slate-900 mt-4` with "per unit" suffix (text-sm text-slate-400)
6. Short description: `text-slate-600 leading-relaxed mt-4`
7. Divider: `border-t border-slate-200 my-6`

8. CONFIGURATION FORM:
   a. Paper Type: radio group (Art Paper 150gsm, Art Paper 260gsm, HVS 80gsm, etc.)
      - Each option: `border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-indigo-300 transition-colors`
      - Selected: `border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600`
   b. Finishing: checkbox group (Glossy Lamination, Matte Lamination, Spot UV, Emboss)
      - Same card-style selection
   c. Size: dropdown `<select>` with standard sizes (A4, A5, A3, Custom)
   d. Quantity: number stepper with – and + buttons
      - Container: `flex items-center border border-slate-200 rounded-xl overflow-hidden`
      - Minus/Plus buttons: `w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-lg`
      - Input: `w-20 h-12 text-center border-x border-slate-200 font-semibold text-slate-900`
   e. Upload Design File (optional):
      - Dropzone: `border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer`
      - Upload icon (UploadCloud, 32px, text-slate-400), "Drag & drop or click to upload", "PDF, AI, PSD (Max 50MB)"
      - After upload: show file name + file size + Remove button (X icon, text-red-500)

9. PRICE SUMMARY:
   - `bg-slate-50 rounded-xl p-4 border border-slate-100 mt-6`
   - Line items: Base price, Finishing surcharge, Quantity discount
   - Total: `text-2xl font-extrabold text-indigo-600`

10. ACTION BUTTONS:
    - "Add to Cart": `w-full h-14 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2` with ShoppingCart icon
    - "Buy Now": `w-full h-14 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 mt-3` with ArrowRight icon

11. TRUST INDICATORS row:
    - 3 items: ShieldCheck "Quality Guaranteed", Truck "Free Delivery >Rp 500K", RefreshCw "Easy Revision"
    - `flex items-center gap-2 text-sm text-slate-500`

BELOW FOLD (full width):
12. PRODUCT TABS:
    - Tab buttons: "Description", "Specifications", "Reviews (12)"
    - Active tab: `border-b-2 border-indigo-600 text-indigo-600 font-semibold`
    - Inactive: `text-slate-500 hover:text-slate-700`
    - Description tab: rich text content with bullet points
    - Specifications tab: two-column table with specs (Material, Print Method, Resolution, Color Mode, etc.)
    - Reviews tab: list of review cards with star rating, reviewer name, date, comment text

13. RELATED PRODUCTS:
    - `mt-16` section with title "You might also like"
    - 4-column product card grid (same card design as catalog)

Export as `export const ProductDetail`.
```

### 3.4 🛒 Cart Page (`/cart`)

```text
Generate a Shopping Cart page for MK Printing.

LAYOUT: 2-column (lg:flex-row)

LEFT COLUMN (lg:w-2/3):
1. Page header:
   - Back arrow (ArrowLeft icon, Link to /products)
   - Title: "Shopping Cart" (`text-3xl font-extrabold text-slate-900 tracking-tight`)
   - Item count badge: `text-slate-400 text-lg font-medium`

2. Cart items list:
   - Each item card: `bg-white rounded-xl border border-slate-100 p-6 shadow-sm`
   - Layout: horizontal flex with image (w-24 h-24 rounded-xl bg-slate-100), info area, quantity controls, price, remove button
   - Image: product thumbnail with `object-cover`
   - Info:
     - Product name: `text-base font-bold text-slate-900`
     - Specs line: `text-sm text-slate-500` (e.g., "A4 · Art Paper 150gsm · Glossy")
     - SKU: `text-xs text-slate-400 font-mono`
   - Quantity stepper: same – / input / + pattern as product detail
   - Unit price: `text-sm text-slate-500`
   - Line total: `text-lg font-extrabold text-slate-900`
   - Remove button: `p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors` with Trash2 icon (18px)

3. EMPTY CART STATE:
   - ShoppingCart icon (64px, text-slate-300)
   - "Your cart is empty" (text-2xl font-bold)
   - "Browse our catalog to find what you need" (text-slate-500)
   - "Browse Catalog" button (primary, rounded-xl)

RIGHT COLUMN (lg:w-1/3):
4. Order Summary card (sticky):
   - `bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24`
   - Title: "Order Summary" (text-lg font-bold)
   - Line items summary (scrollable, max-h-60)
   - Subtotal, Tax (11% PPN), Total
   - Total amount: `text-2xl font-extrabold text-indigo-600`
   - "Proceed to Checkout" button: `w-full h-14 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg flex items-center justify-center gap-2` with ArrowRight icon
   - "Continue Shopping" link below (text-sm text-indigo-600)
   - Trust line: Lock icon + "Secure checkout" (text-xs text-slate-400)

Mock data: 3-4 items with printing products, Indonesian company context.

Export as `export const CartPage`.
```

### 3.5 💳 Checkout Page (`/dashboard/checkout`)

```text
Generate a Checkout page for MK Printing.

LAYOUT: 2-column (lg:flex-row), max-w-5xl centered

LEFT COLUMN (lg:w-2/3):
1. Header:
   - Back arrow Link to /cart
   - "Checkout" title (text-3xl font-extrabold)

2. STEP 1 CARD — "Order Details":
   - Step number circle: `w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center` showing "1"
   - Form inside `bg-white p-8 rounded-2xl shadow-sm border border-gray-100`
   - Fields:
     a. Order Priority: `<select>` with options Normal, High, Urgent
        - Helper text below: "Additional fees may apply for high or urgent priority." (text-xs text-gray-500)
     b. Requested Delivery Date: `<input type="date">` with min=today
     c. Order Notes: `<textarea rows={4}>` with placeholder "Any specific requirements or instructions for production?"
   - All inputs: `w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 p-3`

3. STEP 2 CARD (NEW) — "Delivery Information":
   - Step number "2"
   - Delivery method radio cards:
     - "Self Pickup" (Building icon): "Pick up at our workshop", Free
     - "Standard Delivery" (Truck icon): "3-5 business days", Rp 25.000
     - "Express Delivery" (Zap icon): "1-2 business days", Rp 75.000
   - Each radio card: `border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-300` — selected: `border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600`
   - If delivery selected: show address textarea

RIGHT COLUMN (lg:w-1/3):
4. Order Summary (sticky):
   - Same summary pattern as CartPage
   - Scrollable item list
   - Subtotal, Delivery fee, Tax (11%), Total
   - "Place Order" submit button: `w-full h-14 bg-indigo-600 text-white font-bold rounded-xl` with CheckCircle2 icon
   - Loading state: spinner replacing button text
   - Disabled when loading
   - Terms text: `text-xs text-center text-gray-500 mt-4` — "By placing your order, you agree to our Terms of Service."

STATES:
- Loading (cart fetching): centered spinner
- Empty cart: redirect message with "Back to Catalog" button
- Submit loading: button shows spinner, all fields disabled
- Error: toast notification via useToast

Export as `export const CheckoutPage`.
```

### 3.6 💰 Payment Instructions Page (`/dashboard/payment/:orderId`)

```text
Generate a Payment Instructions page shown after successful order placement.

PAGE LAYOUT: single column, max-w-3xl centered, `py-12`

SECTIONS:

1. SUCCESS HEADER (centered):
   - Green circle: `w-20 h-20 rounded-full bg-green-100 flex items-center justify-center`
   - CheckCircle2 icon (40px, text-green-600)
   - Title: "Order Received!" (text-3xl font-extrabold text-gray-900)
   - Subtitle: "Thank you for your order. Please complete your payment." (text-lg text-gray-500)

2. ORDER SUMMARY CARD:
   - Container: `bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`
   - Header bar: `bg-gray-50 p-6 border-b border-gray-100`
     - Left: "Order Number" label (text-sm text-gray-500) + order number (text-xl font-bold text-gray-900)
     - Right: "Total Payment" label + amount (text-2xl font-extrabold text-indigo-600)

3. PAYMENT INSTRUCTIONS SECTION:
   - Section title: FileText icon + "Payment Instructions (Bank Transfer)" (font-bold text-gray-900)
   - Bank details card: `bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4`
     - Row 1: "Bank Name" — "Bank Central Asia (BCA)" (font-bold text-lg)
     - Row 2: "Account Name" — "PT Multi Kreasi Printing" (font-bold)
     - Row 3: "Account Number" — "123 456 7890" (font-mono text-xl font-bold tracking-wider) + Copy button (Copy icon, p-2, text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md)
   - Rows separated by `border-b border-gray-200 pb-4`
   - Copy button triggers toast: success('Copied!', 'Text copied to clipboard.')

4. PAYMENT DEADLINE (NEW):
   - Alert card: `bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3`
   - Clock icon (text-amber-600)
   - Text: "Please complete payment within 24 hours. Your order will be automatically cancelled after the deadline." (text-sm text-amber-800)
   - Countdown timer displaying: "23:59:42 remaining" (font-mono font-bold text-amber-700)

5. INFO ALERT:
   - `bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800`
   - Info icon (Lucide Info, NOT emoji)
   - Text: "Please transfer the exact amount of {formatted amount}. Your order will be processed as soon as we receive your payment."

6. UPLOAD PROOF OF PAYMENT (NEW):
   - `bg-white rounded-xl p-6 border border-slate-200 mt-6`
   - Title: "Upload Payment Proof" (font-bold)
   - Dropzone: same pattern as product detail file upload
   - Accepted formats: JPG, PNG, PDF (Max 5MB)
   - After upload: file preview thumbnail + "Payment proof uploaded successfully" success text
   - "Submit Payment Proof" button: `bg-indigo-600 text-white rounded-xl`

7. ALTERNATIVE PAYMENT METHODS (NEW):
   - Collapsible section with ChevronDown icon
   - "Other Payment Methods" title
   - Grid of 2-3 additional bank options (BNI, Mandiri) with same detail format

8. BOTTOM CTA:
   - "View My Orders" button: `w-full h-14 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2` with ArrowRight icon

STATES:
- Loading: centered spinner
- Order not found: "Order not found" + "Return to Home" link

Export as `export const PaymentPage`.
```

### 3.7 📝 Register Page (`/register`)

```text
Generate a Registration page for MK Printing.

PAGE LAYOUT: centered card on `bg-slate-50 min-h-screen`

CARD: `max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100`

CONTENT:

1. HEADER:
   - Title: "Create your account" (text-3xl font-extrabold text-gray-900)
   - Subtitle: "Join Multi Kreasi Printing today" (text-sm text-gray-600)

2. ERROR ALERT (conditional):
   - `bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm`
   - Shows validation or server error messages

3. FORM FIELDS:
   a. Full Name: text input, required, placeholder "John Doe"
   b. Email Address: email input, required, autocomplete="email", placeholder "you@example.com"
   c. Phone Number: tel input, optional label "(Optional)", placeholder "+62 812 3456 7890"
   d. Password: password input, required
      - Helper: "Must be at least 8 chars with uppercase, lowercase, and number." (text-xs text-gray-500 mt-1)
      - PASSWORD STRENGTH INDICATOR (NEW):
        - 4 bars: `h-1 rounded-full transition-all duration-300`
        - Weak (1 bar): bg-red-500
        - Fair (2 bars): bg-amber-500
        - Good (3 bars): bg-blue-500
        - Strong (4 bars): bg-emerald-500
        - Label below bars: "Weak" / "Fair" / "Good" / "Strong" with matching color
   e. Confirm Password: password input, required
      - If mismatch while typing: red border + "Passwords do not match" (text-xs text-red-600)

   All inputs: `mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 text-sm`
   Labels: `block text-sm font-medium text-gray-700`

4. SUBMIT BUTTON:
   - `w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`
   - Loading: "Creating account..."
   - Default: "Create Account"

5. BOTTOM LINK:
   - "Already have an account? Sign in" (text-sm, Link to /login, text-indigo-600 hover:text-indigo-500)

6. SUCCESS STATE (replaces form):
   - Green checkmark circle (h-12 w-12 bg-green-100)
   - "Registration Successful!" (text-2xl font-bold)
   - "Please check your email to verify your account." (text-gray-600)
   - "Go to Login" button (Link to /login)

CLIENT-SIDE VALIDATION:
- Password min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Confirm password must match
- Email format validation
- Clear error on input change

Export as `export const RegisterPage`.
```

### 3.8 🔐 Login Page (`/login`)

```text
Generate a Login page for MK Printing.

PAGE LAYOUT: full-screen centered on `bg-slate-50`, `font-sans`

CARD: `max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100 relative`

CONTENT:

1. BACK LINK:
   - `absolute top-6 left-6` — ArrowLeft icon + "Back" (text-sm font-medium text-slate-400 hover:text-blue-600)
   - Links to "/"

2. HEADER:
   - Logo/Brand: "MK Printing" (text-3xl font-extrabold text-slate-800 tracking-tight)
   - Subtitle: "Sign in to your account" (text-slate-500)
   - Centered, `mb-8 mt-6`

3. ERROR ALERT (conditional):
   - `mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm`

4. FORM:
   a. Email: `<input type="email">` required, placeholder "admin@mkprinting.com"
   b. Password: `<input type="password">` required
      - SHOW/HIDE toggle (NEW): Eye / EyeOff icon button at the right of the input field (`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`)
   c. REMEMBER ME + FORGOT PASSWORD row (NEW):
      - Left: checkbox + "Remember me" (text-sm text-slate-600)
      - Right: "Forgot password?" link (text-sm text-indigo-600 hover:text-indigo-500)

   Labels: `block text-sm font-semibold text-slate-700 mb-1`
   Inputs: `w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`

5. LOGIN BUTTON:
   - `w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`
   - Loading: "Logging in..." / Default: "Log In"

6. DIVIDER (NEW):
   - `flex items-center gap-4 my-6`
   - Left/Right: `flex-1 h-px bg-slate-200`
   - Center: "or" (text-sm text-slate-400)

7. REGISTER LINK (NEW):
   - "Don't have an account? Create one" — Link to /register
   - `text-center text-sm text-slate-500`

Export as default function `Login`.
```

### 3.9 ✉️ Email Verification Page (`/verify-email/:token`)

```text
Generate an Email Verification page for MK Printing.

PAGE LAYOUT: full-screen centered, bg-slate-50

THREE STATES:

1. VERIFYING STATE:
   - Centered card (max-w-md, bg-white, rounded-2xl, shadow-sm, border, p-12)
   - Spinning loader (animate-spin, h-16 w-16, border-4 border-indigo-200, border-t-indigo-600, rounded-full)
   - "Verifying your email..." (text-xl font-bold text-slate-900 mt-6)
   - "Please wait while we confirm your email address." (text-slate-500 mt-2)

2. SUCCESS STATE:
   - Same card layout
   - Green checkmark circle (w-20 h-20 bg-emerald-100 rounded-full, CheckCircle2 48px text-emerald-600)
   - "Email Verified!" (text-2xl font-extrabold text-slate-900)
   - "Your account is now active. You can log in to start placing orders." (text-slate-500)
   - Confetti animation (optional CSS keyframes with colored dots)
   - "Go to Login" button: primary indigo-600, rounded-xl, h-12 px-8

3. ERROR STATE:
   - Same card layout
   - Red alert circle (w-20 h-20 bg-red-100, XCircle 48px text-red-600)
   - "Verification Failed" (text-2xl font-extrabold text-slate-900)
   - Error message: "This link may have expired or already been used." (text-slate-500)
   - "Request New Verification Email" button: primary
   - "Back to Home" link: text-sm text-slate-500

Calls GET /api/v1/auth/verify-email/:token on mount.

Export as `export const VerifyEmailPage`.
```

### 3.10 📄 About Page (`/about`)

```text
Generate an About Us page for MK Printing.

SECTIONS:
1. Hero: `bg-slate-950 text-white py-20` with gradient overlay
   - Title: "About Multi Kreasi Printing" (text-4xl font-extrabold)
   - Subtitle: company history paragraph (text-slate-300)

2. Stats row: 4 metric items in `bg-white -mt-12 mx-auto max-w-5xl rounded-2xl shadow-lg p-8 grid grid-cols-4 gap-8`
   - "15+" Years Experience, "500+" Clients, "10M+" Prints Delivered, "50+" Employees

3. Mission/Vision: 2-column layout
   - Mission card: bg-indigo-50 rounded-2xl p-8 with Target icon
   - Vision card: bg-purple-50 rounded-2xl p-8 with Eye icon

4. Team Section (NEW):
   - Title: "Our Leadership"
   - 3 team member cards: avatar circle, name, title, brief bio
   - `bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow`

5. Values Section (NEW):
   - 4 values in grid: Quality, Innovation, Integrity, Customer Focus
   - Each with icon, title, description

Export as `export const AboutPage`.
```

### 3.11 📞 Contact Page (`/contact`)

```text
Generate a Contact Us page for MK Printing.

LAYOUT: 2-column (lg:flex-row)

LEFT COLUMN (lg:w-1/2):
1. Title: "Get in Touch" (text-3xl font-extrabold)
2. Subtitle paragraph
3. Contact info cards (stacked):
   - Location: MapPin icon + full address
   - Phone: Phone icon + "+62 21 1234 5678"
   - Email: Mail icon + "info@mkprinting.com"
   - Hours: Clock icon + "Mon-Fri: 08:00 - 17:00 WIB"
   Each card: `flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200`
4. Social media links row: Instagram, Facebook, LinkedIn icons

RIGHT COLUMN (lg:w-1/2):
5. Contact Form card: `bg-white rounded-2xl shadow-sm border border-slate-200 p-8`
   - Fields: Name, Email, Phone (optional), Subject (dropdown: General Inquiry, Quotation Request, Support, Partnership), Message (textarea rows=5)
   - Submit button: "Send Message" with Send icon
   - Success state: green confirmation message in the form area

Export as `export const ContactPage`.
```

### 3.12 📋 Terms & Conditions Page (`/terms`)

```text
Generate a Terms & Conditions page for MK Printing.

LAYOUT: single column, max-w-4xl centered

1. Header: "Terms & Conditions" (text-3xl font-extrabold)
2. Last updated: "Last updated: August 2026" (text-sm text-slate-500)
3. Table of Contents (NEW):
   - Sidebar or top list of clickable section links: "1. General Terms", "2. Payment Terms", "3. Delivery Policy", etc.
   - Smooth scroll to section on click
4. Content sections:
   - Each section: h2 title, paragraphs, bullet lists
   - Sections: General Terms, Payment Terms, Production & Delivery, Refund & Cancellation, Intellectual Property, Limitation of Liability, Privacy Policy Summary

Styled like a legal document but readable — short paragraphs, clear headings, adequate spacing.

Export as `export const TermsPage`.
```

---

## 🔒 Bagian 4: Auth-Protected Internal Pages

### 4.1 📊 Dashboard (All Roles) (`/dashboard`)

```text
Generate a role-adaptive Dashboard for MK Printing.

The dashboard changes layout based on `userRole`. Generate the OWNER/MANAGER variant as the most complete version.

OWNER/MANAGER DASHBOARD:

1. HEADER ROW:
   - Welcome message: "Good morning, Rohan" (text-2xl font-extrabold text-slate-900) — based on time of day (morning/afternoon/evening)
   - Subtitle: Today's date (text-slate-500 font-medium)
   - Right: "Customize Dashboard" button (Sliders icon, text-sm, outlined style)
   - Right: Date range picker (This Week / This Month / Last 30 Days / Custom)

2. METRIC CARDS ROW (4 cards):
   - Total Revenue: DollarSign icon, emerald variant, formatted IDR, trend +12.5% up
   - Orders Today: ShoppingBag icon, default variant, count, trend
   - Pending Approvals: Clock icon, warning variant, count, no trend
   - Low Stock Alerts: AlertTriangle icon, danger variant, count
   - Use the MetricCard component pattern

3. PENDING APPROVALS TABLE (left, lg:w-3/5):
   - Card: `bg-white rounded-xl shadow-sm border border-slate-200`
   - Header: "Pending Approvals" with badge showing count (bg-amber-100 text-amber-700 rounded-full px-2)
   - Table columns: Order #, Customer, Items Summary, Total Value, Date
   - Each row has [Approve] (bg-emerald-600 text-white text-xs px-3 py-1 rounded-lg) and [Reject] (bg-white text-red-600 border border-red-200 text-xs px-3 py-1 rounded-lg) buttons
   - Only show orders > Rp 2.000.000

4. PRODUCTION STATUS (right, lg:w-2/5):
   - Card: "Active Production Jobs"
   - List of 3-4 jobs with:
     - Job ID + Machine name
     - Progress bar: `h-2 rounded-full bg-slate-200` with inner `bg-indigo-600 rounded-full` showing percentage
     - Progress percentage text
     - Status badge (In Progress / QC)
   - Empty state if no active jobs

5. REVENUE CHART AREA:
   - Card: "Revenue Trend (Last 7 Days)"
   - Placeholder area: `h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center`
   - Text: "Chart will be rendered with Recharts" (for Stitch, just show the placeholder)

6. RECENT ORDERS TABLE (full width):
   - Card: "Recent Orders"
   - Table: Order #, Customer, Items, Status (badge), Total, Date
   - 5 mock rows
   - "View All Orders →" link at bottom

CUSTOMER DASHBOARD VARIANT:
- Welcome + 2 metric cards (Active Orders, Total Spent)
- Active Orders with horizontal timeline (see Customer Portal)
- Order History table

DESIGNER DASHBOARD VARIANT:
- 3 metric cards (Pending Reviews, Approved Today, Revision Requests)
- Design review card grid (see Design Files section)

PRODUCTION DASHBOARD VARIANT:
- 3 metric cards (In Queue, In Progress, Completed Today)
- Production queue table

FINANCE DASHBOARD VARIANT:
- 3 metric cards (Outstanding, Overdue, Received This Month)
- Invoice summary table

Export as default function `Dashboard`.
```

### 4.2 📦 Orders Page (`/dashboard/orders`)

```text
Generate the Orders Management page for MK Printing internal staff.

PAGE STRUCTURE:

1. HEADER:
   - Title: "Orders" (text-2xl font-extrabold text-slate-900 tracking-tight)
   - Subtitle: "Manage and track all customer orders" (text-sm text-slate-500)
   - Right: "Create Order" button (Plus icon, primary indigo-600) — visible to Owner, Manager, Sales only

2. FILTER/SEARCH BAR:
   - Search input (w-72): Search icon + placeholder "Search by order number or customer..."
   - Status filter dropdown: All, Pending_Approval, Approved, In_Production, Quality_Check, Ready, Shipped, Delivered, Cancelled
   - Priority filter: All, Normal, High, Urgent
   - Date range picker (optional)
   - "Export CSV" button (Download icon, outlined style)

3. ORDERS TABLE:
   - Columns: Checkbox, Order #, Customer, Items (count), Priority (badge), Status (badge), Total (IDR), Created Date, Actions
   - Priority badges:
     - Normal: `bg-slate-100 text-slate-600`
     - High: `bg-amber-100 text-amber-700`
     - Urgent: `bg-red-100 text-red-700` with animation pulse
   - Actions column: Eye icon (view detail), MoreVertical dropdown menu
   - Dropdown menu items (role-dependent):
     - Approve Order (Owner/Manager)
     - Reject Order (Owner/Manager)
     - Start Production (Production_Staff)
     - Record Payment (Finance_Staff)
     - Cancel Order (Owner/Manager)
   - Clickable rows: navigate to `/dashboard/orders/:id`

4. BULK ACTIONS BAR (appears when checkboxes selected):
   - `bg-indigo-600 text-white rounded-xl p-3 flex items-center justify-between sticky bottom-4 shadow-lg`
   - Left: "{n} orders selected"
   - Right: "Approve All", "Export Selected", "Cancel Selected" buttons

5. PAGINATION: standard pattern

6. EMPTY STATE:
   - Package icon (48px, text-slate-300)
   - "No orders found"
   - "Create your first order or adjust your filters"
   - "Create Order" button

7. LOADING STATE:
   - 6 skeleton rows

MOCK DATA: 10-15 orders with varied statuses, customers (Indonesian company names), realistic IDR totals.

Export as default function `Orders`.
```

### 4.3 📋 Order Detail Page (`/dashboard/orders/:id`)

```text
Generate the Order Detail page for MK Printing.

PAGE LAYOUT: max-w-6xl, single column with cards

1. HEADER:
   - Back arrow (Link to /dashboard/orders)
   - Order number: "Order #ORD-2026-0089" (text-2xl font-extrabold)
   - Status badge (large): `px-4 py-2 rounded-full text-sm font-bold`
   - Right side action buttons (role-dependent):
     - "Approve" (CheckCircle icon, emerald)
     - "Reject" (XCircle icon, red)
     - "Print Invoice" (Printer icon, outlined)
     - "Cancel Order" (Ban icon, red outlined)
     - Each with ConfirmDialog before execution

2. ORDER TIMELINE / PROGRESS BAR:
   - Horizontal stepper: 6 steps
   - Steps: Order Placed → Approved → Design Review → In Production → Quality Check → Delivered
   - Completed steps: `bg-emerald-600` circle with Check icon (white), green connecting line
   - Current step: `bg-indigo-600` with pulsing ring animation, indigo connecting line
   - Future steps: `bg-slate-200` gray circle, gray line
   - Each step: icon, label, timestamp (if completed)
   - Responsive: horizontal on desktop, vertical on mobile

3. ORDER INFO GRID (2 columns):
   LEFT CARD — "Order Information":
   - Order Number, Created Date, Priority (badge), Status (badge)
   - Customer Name (link to customer detail), Customer Email
   - Delivery Method, Estimated Delivery Date
   - Notes (if any)

   RIGHT CARD — "Payment Information":
   - Invoice Number (link), Total Amount (text-2xl font-extrabold text-indigo-600)
   - Payment Status badge, Payment Method, Payment Date (if paid)
   - "Record Payment" button (for Finance_Staff, if unpaid)

4. ORDER ITEMS TABLE:
   - Card: "Order Items"
   - Columns: #, Product Image (w-12 h-12 rounded-lg), Product Name, Specifications, Quantity, Unit Price, Subtotal
   - Footer row: Subtotal, Tax, Delivery Fee, Grand Total (bold)
   - Each item row: expandable to show specs detail (paper type, finishing, size)

5. DESIGN FILES SECTION:
   - Card: "Design Files"
   - Grid of file cards: thumbnail preview, filename, file size, upload date, status (Pending/Approved/Needs Revision)
   - Actions: Download, Preview (opens DesignPreviewModal), Approve (Designer role), Request Revision (Designer role)
   - "Upload Design" button (UploadCloud icon) — opens UploadDesignModal
   - Empty state: "No design files uploaded yet"

6. PRODUCTION LOG:
   - Card: "Production Log"
   - Timeline-style list of events:
     - Each event: timestamp, icon (based on type), description, user who performed it
     - Types: status_change, note_added, file_uploaded, payment_recorded
   - "Add Note" button at top

7. ACTIVITY / AUDIT LOG (NEW):
   - Collapsible card: "Activity History"
   - Every status change, file upload, approval, rejection with timestamp and user
   - `text-sm text-slate-600` with `text-xs text-slate-400` timestamps

Export as `export const OrderDetail`.
```

### 4.4 🎨 Design Files Page (`/dashboard/design`)

```text
Generate the Design Files Management page for the Designer role.

PAGE STRUCTURE:

1. HEADER:
   - Title: "Design Reviews" (text-2xl font-extrabold)
   - Tab buttons: "Pending Review", "Approved", "Needs Revision", "All"
     - Active: `border-b-2 border-indigo-600 text-indigo-600 font-semibold pb-3`
     - Inactive: `text-slate-500 hover:text-slate-700 pb-3`
   - Right: Counter badges per tab (bg-amber-100 for pending, bg-emerald-100 for approved, bg-red-100 for revision)

2. DESIGN CARDS GRID:
   - `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`
   - Each card: `bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow`
     - Thumbnail area: `aspect-[4/3] bg-slate-100 relative`
       - File type badge: `absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-mono` (e.g., "PDF", "PSD", "AI")
       - Hover overlay: "Click to Preview" with Eye icon
     - Content: `p-5`
       - Order ID: `text-xs font-bold text-indigo-600`
       - Customer name: `text-sm text-slate-500`
       - Specs line: "A4 · Art Paper 300gsm · Glossy Lamination" (text-xs text-slate-400)
       - Status badge
       - Divider
       - Action buttons row:
         - "Download" (Download icon, outlined small button)
         - "Approve" (Check icon, emerald small button) — only for Pending
         - "Request Revision" (MessageSquare icon, amber small button) — only for Pending
         - "View Order" (ExternalLink icon, text link)
     - If "Needs Revision": show revision notes in `bg-red-50 border-t border-red-100 p-3 text-xs text-red-700`

3. UPLOAD DESIGN MODAL trigger:
   - Floating action button or "Upload New Design" in header area

4. DESIGN PREVIEW MODAL:
   - Full-screen or large modal (size="2xl")
   - Image/PDF preview area (large, centered)
   - Sidebar with file details, order info, action buttons
   - Zoom controls (ZoomIn, ZoomOut icons)

5. EMPTY STATE per tab:
   - Pending: "No designs waiting for review" (Inbox icon)
   - Approved: "No approved designs yet" (CheckCircle icon)
   - Revision: "No revision requests" (MessageSquare icon)

MOCK DATA: 6-8 design files with various statuses.

Export as default function `DesignFiles`.
```

### 4.5 ⚙️ Production Page (`/dashboard/production`)

```text
Generate the Production Queue page for Production Staff.

PAGE STRUCTURE:

1. HEADER:
   - Title: "Production Queue" (text-2xl font-extrabold)
   - Subtitle with total count
   - Right: View toggle (Kanban Board / Table View) using Columns and List icons

2. STATUS FILTER TABS:
   - "All", "Queued", "In Progress", "Quality Check", "Completed"
   - With count badges per status

3. TABLE VIEW:
   - Columns: Job ID, Order #, Product, Machine Assigned, Material Required, Status, Priority, Progress, Actions
   - Machine: e.g., "Offset Press 1", "Digital Press 2", "Large Format Printer"
   - Material: e.g., "Art Paper 150gsm × 500 sheets", "Vinyl 5m"
   - Progress: visual bar (h-2 rounded-full) + percentage
   - Expandable row detail:
     - Full spec list (paper, finishing, quantity, colors)
     - Design file thumbnail + download link
     - Timeline of production events
   - Actions:
     - "Start Production" button (Play icon, indigo) — for Queued jobs
     - "Mark QC" button (ClipboardCheck icon, amber) — for In Progress jobs
     - "Complete" button (CheckCircle icon, emerald) — for QC jobs
     - "Report Issue" button (AlertTriangle icon, red outlined)
     - "Reassign Machine" (Settings icon, outlined)
   - Active/In-Progress rows: left border accent `border-l-4 border-indigo-600`
   - Pulsing dot for In Progress status

4. KANBAN VIEW (NEW):
   - 4 columns: Queued → In Progress → Quality Check → Completed
   - Each column: header with count, scrollable card list
   - Each card: `bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-grab`
     - Job ID, Product name, Machine, Priority badge
     - Mini progress bar
     - Drag handle (GripVertical icon, text-slate-300)
   - Column backgrounds: `bg-slate-50 rounded-2xl p-4 min-h-[400px]`

5. MODALS:
   - ReportIssueModal: textarea for issue description, severity dropdown (Minor/Major/Critical), file upload for photo evidence
   - ReassignJobModal: machine selection dropdown, reason textarea

6. EMPTY STATE:
   - "Production queue is empty" with Factory icon
   - "All caught up! No jobs waiting."

MOCK DATA: 8-10 production jobs with varied statuses and machines.

Export as default function `Production`.
```

### 4.6 💰 Invoices Page (`/dashboard/invoices`)

```text
Generate the Invoices & Payments page for Finance Staff.

PAGE STRUCTURE:

1. METRIC CARDS (3):
   - "Total Outstanding": DollarSign icon, warning variant, IDR amount
   - "Overdue Invoices": AlertTriangle icon, danger variant, count
   - "Received This Month": TrendingUp icon, success variant, IDR amount

2. HEADER ROW:
   - Title: "Invoices"
   - Right: "Create Invoice" button (Plus icon, primary)

3. FILTER BAR:
   - Search: "Search by invoice number or customer..."
   - Status filter: All, Paid, Unpaid, Overdue, Partially Paid, Cancelled
   - Date range filter
   - "Export" button (Download icon)

4. INVOICES TABLE:
   - Columns: Invoice #, Customer, Order #, Issue Date, Due Date, Total Amount, Paid Amount, Balance, Status, Actions
   - Status badges with standard colors
   - Overdue rows: subtle `bg-red-50/50` background tint
   - Amount columns: right-aligned, font-mono
   - Actions:
     - "Record Payment" (CreditCard icon, primary) — for Unpaid/Partially Paid
     - "View Detail" (Eye icon)
     - "Download PDF" (Download icon)
     - "Send Reminder" (Mail icon) — for Overdue
   - Clicking "Record Payment" opens RecordPaymentModal

5. RecordPaymentModal:
   - Modal with form fields:
     - Payment Amount (number input, pre-filled with balance)
     - Payment Method dropdown (Bank Transfer, Cash, Credit Card, Giro)
     - Payment Date (date input, default today)
     - Reference Number (text input, e.g., bank transfer reference)
     - Payment Proof upload (optional file upload)
     - Notes (textarea)
   - Validation: amount > 0, amount <= balance
   - Submit: "Record Payment" button with loading state

6. InvoiceDetailModal:
   - Invoice header: company logo area, invoice number, dates
   - Bill To / Bill From sections
   - Items table with subtotal, tax, total
   - Payment history list
   - "Download PDF" and "Print" buttons in modal footer

7. CreateInvoiceModal:
   - Order selection dropdown (only orders without invoices)
   - Auto-populated line items from order
   - Due date picker
   - Tax rate input (default 11%)
   - Additional notes textarea
   - Preview before creating

8. PaymentHistoryModal:
   - Table of all payments for a specific invoice
   - Columns: Date, Amount, Method, Reference, Recorded By
   - Total paid vs Total invoice comparison

MOCK DATA: 10+ invoices with varied statuses, IDR amounts (Rp 500.000 - Rp 50.000.000).

Export as default function `Invoices`.
```

### 4.7 📦 Warehouse / Inventory Page (`/dashboard/warehouse`)

```text
Generate the Warehouse Inventory Management page.

PAGE STRUCTURE:

1. LOW STOCK ALERT BANNER (conditional):
   - `bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3`
   - AlertTriangle icon (text-red-600)
   - "⚠️ {n} materials are critically low in stock" (font-bold text-red-800)
   - "View All" link (text-red-600 underline)
   - Dismiss X button

2. METRIC CARDS (4):
   - "Total Materials": Package icon, default
   - "Low Stock": AlertTriangle icon, warning
   - "Out of Stock": XCircle icon, danger
   - "Recent Restocks": TrendingUp icon, success

3. HEADER ROW:
   - Title: "Inventory"
   - Right: "Add Material" button (Plus icon, primary) — opens MaterialFormModal

4. FILTER BAR:
   - Search: "Search materials..."
   - Category filter: All, Paper, Ink, Vinyl, Packaging, Finishing, Other
   - Stock status: All, In Stock, Low Stock, Out of Stock
   - Supplier filter

5. MATERIALS TABLE:
   - Columns: Material Name, SKU/Code, Category, Current Stock, Min Threshold, Unit, Supplier, Last Restocked, Actions
   - Stock column: visual comparison
     - If current >= min: `text-emerald-600` with green dot
     - If current < min but > 0: `text-amber-600 font-bold` with amber dot + "LOW" badge
     - If current = 0: `text-red-600 font-bold` with red dot + "OUT" badge
   - Stock bar: `w-24 h-2 rounded-full bg-slate-200` with fill based on current/max ratio
     - Green (>50%), Amber (20-50%), Red (<20%)
   - Actions:
     - "Adjust Stock" (PlusCircle/MinusCircle icon) — opens AdjustStockModal
     - "Edit" (Pencil icon) — opens MaterialFormModal in edit mode
     - "Delete" (Trash2 icon) — opens ConfirmDialog (danger)
     - "View History" (History icon)

6. AdjustStockModal:
   - Material name display (read-only)
   - Current stock display
   - Adjustment type: radio (Add Stock / Remove Stock)
   - Quantity input (number)
   - Reason dropdown (Restock, Production Usage, Damaged, Correction, Other)
   - Notes textarea (optional)
   - New stock preview: "Current: 500 → New: 650" with green/red color

7. MaterialFormModal (create/edit):
   - Fields: Material Name, SKU, Category (dropdown), Unit (dropdown: Sheets, Reams, Rolls, Liters, Pcs, Kg), Min Threshold, Supplier, Notes
   - For create: initial stock field
   - Validation: name required, SKU unique, threshold > 0

8. STOCK HISTORY (NEW — expandable or separate tab):
   - Table: Date, Type (In/Out), Quantity, Reason, Performed By, Notes
   - Filter by date range

MOCK DATA: 12+ printing materials (Art Paper 150gsm, Art Paper 260gsm, HVS 80gsm, Cyan Ink CMYK, Magenta Ink, Vinyl Roll 1.2m, etc.)

Export as default function `Warehouse`.
```

### 4.8 👥 Customers Page (`/dashboard/customers`)

```text
Generate the Customers Management page for MK Printing.

PAGE STRUCTURE:

1. HEADER:
   - Title: "Customers"
   - Right: "Add Customer" button (Plus icon, primary) — opens CustomerFormModal

2. FILTER BAR:
   - Search: "Search customers by name, email, or company..."
   - Tier filter: All, Standard, Silver, Gold, Platinum
   - Sort: Name A-Z, Most Recent, Highest Value

3. CUSTOMERS TABLE:
   - Columns: Company/Name, Contact Person, Email, Phone, Loyalty Tier, Total Orders, Lifetime Value, Last Order, Actions
   - Tier badges:
     - Standard: `bg-slate-100 text-slate-600`
     - Silver: `bg-gray-100 text-gray-700 border border-gray-300` (subtle metallic feel)
     - Gold: `bg-amber-100 text-amber-700 border border-amber-300`
     - Platinum: `bg-purple-100 text-purple-700 border border-purple-300`
   - Lifetime value: right-aligned, font-mono, IDR format
   - Actions:
     - "View Detail" (Eye icon) — opens CustomerDetailModal
     - "Edit" (Pencil icon) — opens CustomerFormModal in edit
     - "Create Quotation" (FileText icon) — Sales role only
     - "Delete" (Trash2 icon) — ConfirmDialog

4. CustomerDetailModal:
   - Customer header: company name, contact, tier badge, registration date
   - Stats row: Total Orders, Total Spent, Average Order Value, Last Order Date
   - Recent Orders tab: last 5 orders with status badges
   - Communication tab: notes/follow-up history
   - "Follow Up" button (Mail icon)
   - "View All Orders" link

5. CustomerFormModal:
   - Fields: Company Name, Contact Person, Email, Phone, Address (textarea), Tax ID (NPWP), Loyalty Tier (dropdown), Notes
   - Validation: email format, phone format, company name required

MOCK DATA: 8-10 Indonesian corporate clients (PT Sukses Makmur, CV Berkah Jaya, etc.) with realistic data.

Export as default function `Customers`.
```

### 4.9 👤 Users Management Page (`/dashboard/users`)

```text
Generate the Users / Staff Management page (Owner/Manager only).

PAGE STRUCTURE:

1. HEADER:
   - Title: "Users & Staff"
   - Right: "Invite User" button (UserPlus icon, primary)

2. FILTER BAR:
   - Search: "Search by name or email..."
   - Role filter: All, Owner, Manager, Sales, Designer, Production_Staff, Finance_Staff, Warehouse_Staff, Customer
   - Status filter: All, Active, Inactive

3. USERS TABLE:
   - Columns: Avatar + Name, Email, Role (badge), Status (dot + text), Created Date, Last Login, Actions
   - Avatar: `w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center` showing first letter
   - Role badges with unique colors per role:
     - Owner: `bg-purple-100 text-purple-700`
     - Manager: `bg-blue-100 text-blue-700`
     - Sales: `bg-cyan-100 text-cyan-700`
     - Designer: `bg-pink-100 text-pink-700`
     - Production_Staff: `bg-orange-100 text-orange-700`
     - Finance_Staff: `bg-emerald-100 text-emerald-700`
     - Warehouse_Staff: `bg-amber-100 text-amber-700`
     - Customer: `bg-slate-100 text-slate-600`
   - Status: green dot + "Active" or red dot + "Inactive"
   - Actions:
     - "Edit" (Pencil icon) — opens UserFormModal
     - "Deactivate/Activate" toggle (UserX/UserCheck icon) — ConfirmDialog
     - "Reset Password" (Key icon) — ConfirmDialog
     - Cannot deactivate own account (button disabled with tooltip)
     - Cannot change Owner role (only Owner can)

4. UserFormModal:
   - Mode: Create or Edit
   - Create fields: Full Name, Email, Role (dropdown), Password (auto-generate option with Copy button), Phone (optional)
   - Edit fields: Full Name, Email, Role (dropdown, disabled for Owner unless current user is Owner), Phone
   - Role descriptions: each role option shows a brief description of permissions
   - Email notification checkbox: "Send welcome email with login credentials"
   - Validation: email unique, name required

5. PAGINATION: standard

6. EMPTY STATE:
   - Users icon, "No users found", "Invite your first team member"

MOCK DATA: 8-10 users with varied roles and statuses.

Export as default function `Users`.
```

### 4.10 👤 Profile Page (`/dashboard/profile`)

```text
Generate the User Profile page.

PAGE LAYOUT: max-w-4xl centered

1. PROFILE HEADER CARD:
   - `bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden`
   - Cover image: `h-32 bg-gradient-to-r from-blue-500 to-indigo-600`
   - Avatar section: `-mt-12 px-8`
     - Avatar circle: `w-24 h-24 bg-white rounded-full p-1 shadow-md`
       - Inner: `bg-blue-100 text-blue-600 rounded-full text-3xl font-bold uppercase` showing first letter
     - Name: `text-2xl font-bold text-slate-800`
     - Email with Mail icon: `text-slate-500`
     - Role badge: `px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold` with Shield icon

2. ACCOUNT DETAILS SECTION:
   - Section title: User icon + "Account Details" (text-lg font-semibold)
   - 2-column grid of read-only fields in `bg-slate-50 rounded-lg border border-slate-100 p-3`:
     - Full Name, Email Address, Account Role, Account Status ("Active" in emerald)
   - "Edit Profile" button (NEW): opens inline edit mode
     - Editable fields: Full Name, Phone, Company Name (for Customer role)
     - Save / Cancel buttons

3. SECURITY SECTION:
   - Section title: Key icon + "Security"
   - Change Password row: `flex justify-between items-center p-4 border border-slate-200 rounded-lg`
     - "Password" label + "Last changed recently" subtitle
     - "Change Password" button (outlined)
   - On click: expand to show change password form:
     - Current Password, New Password, Confirm New Password
     - Password strength indicator (same as Register)
     - Save button

4. NOTIFICATION PREFERENCES (NEW):
   - Section title: Bell icon + "Notification Preferences"
   - Toggle switches for:
     - Email notifications for new orders
     - Email notifications for payment received
     - Email notifications for production updates
     - Low stock alerts (Warehouse staff only)
   - Toggle: `w-11 h-6 rounded-full` with sliding circle, indigo-600 when active

5. SESSIONS & DEVICES (NEW):
   - Section title: Monitor icon + "Active Sessions"
   - List of active sessions: device name, IP address, last active time
   - "Revoke All Sessions" button (danger outlined)

6. DANGER ZONE (Customer only, NEW):
   - Red bordered card: `border border-red-200 rounded-xl p-6`
   - "Delete Account" — with ConfirmDialog (danger variant)
   - Warning text about data loss

Export as default function `Profile`.
```

### 4.11 📋 My Orders Page — Customer (`/dashboard/my-orders`)

```text
Generate the "My Orders" page for the Customer role.

PAGE STRUCTURE:

1. HEADER:
   - Welcome: "My Orders" (text-2xl font-extrabold)
   - Subtitle: "Track and manage your orders"
   - Right: "New Order" button (Plus icon, primary, Link to /products)

2. STATUS FILTER TABS:
   - "All", "Active", "Completed", "Cancelled"
   - Active counts in badges

3. ACTIVE ORDERS SECTION:
   - Large cards for each active order:
   - Card: `bg-white rounded-2xl shadow-sm border border-slate-200 p-6`
     - Top row: Order # (font-bold), Date, Priority badge, Total amount
     - HORIZONTAL TIMELINE:
       - 5 steps: Order Placed → Approved → Design Review → In Production → Ready for Delivery
       - Completed: emerald circle with Check icon, green connecting line
       - Current: indigo pulsing circle, indigo connecting line
       - Future: gray-200 circle, gray dashed line
       - Below each step: step name (text-xs), completion date (text-xs text-slate-400)
     - Item summary: collapsed list of items (first 2 shown + "+3 more")
     - Bottom actions row:
       - "View Details" (Link to order detail)
       - "Contact Support" (MessageSquare icon)
       - "Cancel Order" (only if status allows, opens ConfirmDialog)

4. ORDER HISTORY TABLE (below active orders):
   - Columns: Order #, Date, Items Count, Total, Status, Actions
   - Actions: "View", "Reorder" (RefreshCw icon — re-adds items to cart), "Download Invoice" (Download icon)
   - "Reorder" opens ConfirmDialog: "This will add the same items to your cart. Proceed?"

5. EMPTY STATES:
   - No active orders: ShoppingBag icon, "No active orders", "Browse our catalog to place your first order"
   - No order history: "No past orders yet"

MOCK DATA: 2-3 active orders at different stages, 5+ completed/cancelled past orders.

Export as default function `MyOrders`.
```

### 4.12 🔔 Notifications Page (`/dashboard/notifications`)

```text
Generate the Notifications page.

PAGE STRUCTURE:

1. HEADER:
   - Title: "Notifications" (text-2xl font-extrabold)
   - Subtitle: "You have {n} unread messages" (text-sm text-slate-500)
   - Right: "Mark all as read" button (Check icon, text-indigo-600, visible only when unread > 0)

2. FILTER TABS (NEW):
   - "All", "Orders", "Payments", "Alerts", "System"

3. NOTIFICATION LIST:
   - Each notification card: `bg-white rounded-xl p-5 border transition-all`
   - Unread: `border-indigo-100 shadow-md shadow-indigo-50/50 bg-indigo-50/10`
   - Read: `border-slate-100 shadow-sm`
   - Layout: horizontal flex
     - Left: icon circle (w-12 h-12 rounded-full)
       - Order: Package icon (text-blue-500) in bg-blue-50
       - Payment: CreditCard icon (text-emerald-500) in bg-emerald-50
       - Alert: AlertCircle icon (text-amber-500) in bg-amber-50
       - System: Bell icon (text-slate-500) in bg-slate-50
     - Center: title (font-bold), message (text-sm), relative timestamp
     - Right (hover-visible): Mark as read button (Check icon), Delete button (Trash2 icon)
   - Clickable: navigates to relevant page (e.g., order detail for order notifications)

4. EMPTY STATE:
   - Bell icon (32px, text-slate-400) in circle
   - "You're all caught up!" (text-lg font-bold)
   - "No new notifications right now." (text-slate-500)

5. LOADING STATE:
   - 3 skeleton cards with pulse animation

NOTIFICATION TYPES AND THEIR MOCK DATA:
- "New Order Received" — order type
- "Payment Confirmed" — payment type
- "Low Material Stock" — alert type
- "Design Approved" — order type
- "Order Shipped" — order type
- "System Maintenance" — system type

RELATIVE TIME: "Just now", "5m ago", "2h ago", "Yesterday", "Aug 5"

Export as `export const Notifications`.
```

### 4.13 ❌ 404 Not Found Page

```text
Generate a 404 Not Found page.

PAGE LAYOUT: full-screen centered, `bg-slate-50`

CONTENT (max-w-md centered):
1. Icon: FileQuestion (Lucide, 48px, strokeWidth 1.5) inside `w-24 h-24 bg-indigo-100 rounded-full border border-indigo-200 text-indigo-600 shadow-sm`
2. Title: "Page Not Found" (text-4xl font-extrabold text-slate-900 tracking-tight)
3. Message: "We couldn't find the page you're looking for. It might have been moved or deleted." (text-lg text-slate-500 font-medium)
4. Two buttons:
   - "Go Back" (ArrowLeft icon): `bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl h-12 px-6 shadow-sm font-bold`
   - "Dashboard" / "Homepage" (Home icon, dynamic based on auth): `bg-indigo-600 text-white rounded-xl h-12 px-6 shadow-md shadow-indigo-600/20 font-bold`
5. DECORATIVE (NEW):
   - Large "404" text behind content: `text-[200px] font-black text-slate-100 absolute select-none`
   - Subtle floating animation on the icon

Export as `export const NotFound`.
```

---

## 🧩 Bagian 5: Layout Components

### 5.1 📱 App Sidebar

```text
Generate the application Sidebar component for MK Printing.

VISUAL SPECS:
- Width: `w-64` (expanded), `w-20` (collapsed, icons only)
- Height: full viewport `h-screen`
- Background: `bg-white border-r border-slate-200`
- Position: `fixed left-0 top-0` or flex layout with main content
- Toggle button: at bottom, `ChevronLeft`/`ChevronRight` icon to collapse/expand

SECTIONS:

1. LOGO AREA (top):
   - Expanded: "MK Printing" (text-xl font-extrabold text-slate-800) + small tagline "Enterprise Platform" (text-xs text-slate-400)
   - Collapsed: "MK" (text-lg font-black text-indigo-600) in a rounded square

2. NAVIGATION MENU:
   - Menu items change based on `userRole` (see RBAC sidebar structure)
   - Each item: `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all`
   - Default: `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
   - Active: `bg-indigo-50 text-indigo-700 font-semibold` with left border accent `border-l-4 border-indigo-600` or colored bg
   - Icon: Lucide, 20px
   - Menu icons: Dashboard=LayoutDashboard, Orders=ShoppingBag, Production=Factory, Design=Palette, Warehouse=Warehouse, Users=Users, Customers=Building2, Invoices=Receipt, My Orders=Package, Catalog=Store
   - Collapsed: show only icons centered, tooltip on hover

3. NOTIFICATION BADGE (on sidebar item):
   - Red dot or count badge next to relevant items
   - `absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold`

4. USER SECTION (bottom):
   - Avatar circle (w-9 h-9) + name + role
   - Dropdown menu on click: "Profile", "Settings", "Logout"
   - Logout: text-red-600 with LogOut icon

5. MOBILE: sidebar hidden by default, hamburger menu (Menu icon) in Header triggers slide-in with overlay

Export as default `Sidebar`.
```

### 5.2 🔝 App Header

```text
Generate the application Header/Topbar component.

VISUAL SPECS:
- Height: `h-16`
- Background: `bg-white border-b border-slate-200`
- Sticky: `sticky top-0 z-30`
- Padding: `px-6`

LAYOUT (flex between):

LEFT:
- Mobile hamburger (Menu icon, lg:hidden)
- Page title (dynamic, from route) — optional breadcrumb
- Breadcrumb: `text-sm text-slate-500` with ChevronRight separators

RIGHT (flex items-center gap-4):
1. SEARCH (NEW):
   - Search icon button that expands to full search bar on click
   - `command+K` keyboard shortcut hint badge: `bg-slate-100 text-slate-400 text-xs px-1.5 py-0.5 rounded`
   - Expanded: full-width search overlay with results dropdown

2. NOTIFICATION BELL:
   - Bell icon (20px, text-slate-500 hover:text-slate-700)
   - If unread: red dot badge `w-2.5 h-2.5 bg-red-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white`
   - Click: dropdown panel with latest 5 notifications + "View All" link
   - Dropdown: `absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 max-h-[400px] overflow-y-auto`

3. USER AVATAR + DROPDOWN:
   - Avatar: `w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center`
   - Name (hidden sm:block): `text-sm font-semibold text-slate-700`
   - ChevronDown icon (16px)
   - Dropdown menu: `absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2`
     - User info header: name + email + role badge
     - Divider
     - "My Profile" (User icon)
     - "Settings" (Settings icon) — if applicable
     - "Help & Support" (HelpCircle icon)
     - Divider
     - "Sign Out" (LogOut icon, text-red-600)
   - Menu items: `px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3`

Export as default `Header`.
```

### 5.3 🌐 Public Layout (Header + Footer)

```text
Generate the Public Layout wrapper with a public Navbar and Footer.

NAVBAR:
- `bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50`
- Height: `h-16`
- Logo: "MK Printing" (font-extrabold text-xl text-slate-900) — Link to /
- Nav links: Home, Products, About, Contact
  - Default: `text-sm font-medium text-slate-600 hover:text-indigo-600`
  - Active (matches current path): `text-indigo-600 font-semibold`
- Right side:
  - Cart icon (ShoppingBag) with item count badge (`bg-indigo-600 text-white w-5 h-5 rounded-full text-xs`) — Link to /cart
  - If logged in: Avatar + name dropdown (same as internal header)
  - If not logged in: "Log In" (outlined) + "Sign Up" (primary indigo-600) buttons
- MOBILE: hamburger menu → slide-down menu with all links + auth buttons

FOOTER:
- `bg-slate-900 text-slate-400 py-16 mt-auto`
- 4-column grid:
  - Column 1: Logo + company description (2 lines) + social icons (Instagram, Facebook, LinkedIn — 20px, hover:text-white)
  - Column 2: "Products" links (Business Cards, Flyers, Banners, Packaging, Custom)
  - Column 3: "Company" links (About Us, Contact, Careers, Blog)
  - Column 4: "Support" links (Help Center, Terms, Privacy Policy, FAQ)
- Bottom bar: `border-t border-slate-800 mt-8 pt-8`
  - Left: "© 2026 PT Multi Kreasi Printing. All rights reserved."
  - Right: payment method icons or trust badges (optional)

Export as `export const PublicLayout`.
```

---

## 🔧 Bagian 6: All Modals (Detail Prompts)

### 6.1 Create Order Modal

```text
Generate a CreateOrderModal for MK Printing (used by Sales/Manager to manually create orders).

MODAL: size="xl"

FORM SECTIONS:
1. Customer Selection:
   - Searchable dropdown/combobox: type to search customers
   - Show customer name + company in dropdown items
   - "Add New Customer" link at bottom of dropdown → opens CustomerFormModal

2. Order Items (repeatable section):
   - Each item row: Product dropdown, Quantity input, Unit Price (auto-filled from product), Line Total (calculated)
   - "Add Item" button (Plus icon)
   - "Remove" button per row (Trash2 icon, text-red-500)

3. Order Configuration:
   - Priority: Normal/High/Urgent radio group
   - Notes: textarea
   - Estimated Delivery Date: date picker
   - Delivery Method: Self Pickup / Standard / Express

4. Price Summary:
   - `bg-slate-50 rounded-xl p-4 border border-slate-100`
   - Subtotal, Tax (11%), Delivery Fee, Total (text-xl font-extrabold text-indigo-600)

5. Footer:
   - Cancel button (outlined)
   - "Create Order" button (primary, loading state)

Validation: at least 1 item, customer required, quantity > 0.

Export as `export const CreateOrderModal`.
```

### 6.2 Upload Design Modal

```text
Generate an UploadDesignModal for designers or customers to upload design files.

MODAL: size="lg"

CONTENT:
1. Order selector (dropdown) — select which order this design is for
2. File version label input (e.g., "v1", "Final", "Revised")
3. Dropzone:
   - `border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer`
   - UploadCloud icon (48px, text-slate-400)
   - "Drag and drop your files here" (font-semibold)
   - "or click to browse" (text-sm text-slate-500)
   - "Accepted: PDF, AI, PSD, EPS, JPG, PNG (Max 50MB)" (text-xs text-slate-400 mt-2)
4. File preview after selection:
   - File card: icon (based on type), filename, file size, progress bar during upload, remove button
   - Multiple files supported
5. Notes for designer (textarea)
6. Footer: Cancel, "Upload" button with upload progress

Export as `export const UploadDesignModal`.
```

### 6.3 Record Shipment Modal

```text
Generate a RecordShipmentModal for recording order shipments.

MODAL: size="lg"

FORM FIELDS:
1. Shipping Method: dropdown (JNE, JNT, SiCepat, GoSend, GrabExpress, Self Pickup, Company Vehicle)
2. Tracking Number: text input
3. Estimated Arrival: date input
4. Shipping Cost: currency input (IDR)
5. Driver/Courier Name: text input (optional)
6. Driver Phone: tel input (optional)
7. Package Weight: number input + "kg" suffix
8. Package Dimensions: 3 inputs (L × W × H cm)
9. Notes: textarea
10. Photo proof: file upload (optional photo of packaged items)

Footer: Cancel, "Record Shipment" (primary, with Truck icon)

Export as `export const RecordShipmentModal`.
```

---

## 🎨 Bagian 7: Micro-Interactions & States (Apply Globally)

### 7.1 Loading States

```text
All loading states in the application must follow these patterns:

1. PAGE-LEVEL LOADING:
   - Centered spinner: `flex h-full items-center justify-center`
   - Spinner: `animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600`

2. TABLE LOADING (Skeleton):
   - Replace table rows with 5-6 skeleton rows
   - Each cell: `animate-pulse bg-slate-200 rounded h-4` with varying widths (w-32, w-24, w-16, etc.)
   - Maintain table header (not animated)
   - `space-y-4 p-6`

3. CARD LOADING (Skeleton):
   - Replace card content with skeleton blocks
   - Image area: `animate-pulse bg-slate-200 rounded-t-xl aspect-[4/3]`
   - Text lines: alternating w-3/4 and w-1/2 blocks with `h-4 bg-slate-200 rounded mb-3`

4. BUTTON LOADING:
   - Replace button text with spinner: `animate-spin rounded-full h-5 w-5 border-b-2 border-white` (for primary buttons) or `border-indigo-600` (for outlined)
   - Button disabled during loading: `disabled:opacity-50 disabled:cursor-not-allowed`
   - Text change: e.g., "Save" → "Saving..."

5. INLINE/FIELD LOADING:
   - Small spinner next to field (for async validation like email uniqueness check)
   - `animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full`
```

### 7.2 Empty States

```text
All empty states must follow this pattern:

VISUAL STRUCTURE (centered in available space):
1. Icon: relevant Lucide icon, `48px`, `text-slate-300`, `strokeWidth={1.5}`
2. Inside circle: `w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6`
3. Title: `text-lg font-bold text-slate-900 mb-2`
4. Description: `text-sm text-slate-500 mb-6 max-w-sm text-center`
5. CTA button (optional): primary indigo-600 or outlined, relevant icon

EMPTY STATE TEXT PER CONTEXT:
- Orders: Package icon, "No orders yet", "Create your first order to get started"
- Customers: Building2 icon, "No customers found", "Add your first customer"
- Invoices: Receipt icon, "No invoices", "Invoices will appear here when orders are created"
- Design Files: Palette icon, "No design files", "Upload your first design to begin"
- Production: Factory icon, "Queue is empty", "All caught up! No production jobs waiting"
- Warehouse: Package icon, "No materials", "Add your first material to inventory"
- Notifications: Bell icon, "You're all caught up!", "No new notifications right now"
- Search no results: SearchX icon, "No results found", "Try adjusting your search or filters", "Clear Filters" button
- Cart empty: ShoppingCart icon, "Your cart is empty", "Browse our catalog to find what you need"
```

### 7.3 Error States

```text
Error handling UI patterns:

1. PAGE-LEVEL ERROR:
   - Centered card: `max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center`
   - Red circle: `w-16 h-16 bg-red-100 rounded-full mx-auto mb-4` with AlertCircle icon (32px, text-red-600)
   - Title: "Something went wrong" (text-xl font-bold text-slate-900)
   - Error message: `text-sm text-slate-500 mb-6`
   - "Try Again" button (primary) + "Go Back" button (outlined)

2. INLINE FORM ERROR:
   - Field border changes to `border-red-300 focus:ring-red-500`
   - Error text below: `text-xs text-red-600 mt-1 flex items-center gap-1` with AlertCircle (12px) icon
   - Field label also turns `text-red-600`

3. FORM SUBMISSION ERROR:
   - Alert banner above form: `bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6`
   - AlertCircle icon (20px, text-red-600, flex-shrink-0)
   - Title: `font-semibold text-red-800 text-sm`
   - Message: `text-sm text-red-700`
   - Optional dismiss X button

4. TOAST ERROR:
   - Triggered via `useToast().error(title, message)`
   - Follows Toast component pattern (red variant)

5. API 401 / SESSION EXPIRED:
   - Modal or full-page: "Your session has expired"
   - "Please log in again" with redirect to /login
   - Lock icon

6. API 403 / FORBIDDEN:
   - "Access Denied" page with ShieldOff icon
   - "You don't have permission to view this page"
   - "Go to Dashboard" button

7. NETWORK ERROR:
   - "Connection Lost" banner at top of page
   - `bg-red-600 text-white text-sm font-medium py-2 px-4 text-center`
   - Auto-retry indicator with countdown
```

### 7.4 Hover, Focus & Active States

```text
Interactive state patterns applied globally:

BUTTONS:
- Primary: `bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all`
- Secondary/Outlined: `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all`
- Danger: `bg-red-600 hover:bg-red-700 active:scale-[0.98] focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all`
- Ghost: `text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors`
- Icon-only: `p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors`

TABLE ROWS:
- `hover:bg-slate-50/50 transition-colors cursor-pointer`
- Selected row: `bg-indigo-50/50 border-l-4 border-l-indigo-600`

CARDS:
- `hover:shadow-md transition-shadow duration-200`
- Clickable cards: `cursor-pointer hover:border-indigo-200`
- Selected card: `ring-2 ring-indigo-600 border-indigo-600`

INPUTS:
- Default: `border-slate-200 bg-white`
- Focus: `focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none`
- Error: `border-red-300 focus:ring-red-500 focus:border-red-500`
- Disabled: `bg-slate-100 text-slate-400 cursor-not-allowed`

LINKS:
- Navigation: `text-slate-600 hover:text-indigo-600 transition-colors`
- Inline text: `text-indigo-600 hover:text-indigo-700 hover:underline`

BADGES:
- `hover:opacity-80 transition-opacity` (if clickable)

DROPDOWN MENUS:
- Items: `px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors cursor-pointer`
- Danger items: `text-red-600 hover:bg-red-50`
```

### 7.5 Transitions & Animations

```text
Animation patterns used throughout:

1. PAGE TRANSITIONS:
   @keyframes fade-in {
     from { opacity: 0; transform: translateY(8px); }
     to { opacity: 1; transform: translateY(0); }
   }
   .animate-fade-in { animation: fade-in 200ms ease-out; }

2. MODAL:
   @keyframes modal-in {
     from { opacity: 0; transform: translateY(12px) scale(0.97); }
     to { opacity: 1; transform: translateY(0) scale(1); }
   }
   .animate-modal-in { animation: modal-in 200ms ease-out; }

3. TOAST:
   @keyframes toast-in {
     from { transform: translateX(100%); opacity: 0; }
     to { transform: translateX(0); opacity: 1; }
   }
   .animate-toast-in { animation: toast-in 300ms cubic-bezier(0.16, 1, 0.3, 1); }

4. SIDEBAR COLLAPSE:
   - Width transition: `transition-all duration-300 ease-in-out`
   - Menu text fade: `transition-opacity duration-200`

5. DROPDOWN MENU:
   @keyframes dropdown-in {
     from { opacity: 0; transform: translateY(-4px) scale(0.95); }
     to { opacity: 1; transform: translateY(0) scale(1); }
   }
   200ms ease-out

6. SKELETON PULSE:
   - Tailwind's built-in `animate-pulse`

7. PROGRESS BAR FILL:
   - `transition-all duration-500 ease-out` on width change

8. NOTIFICATION BADGE PING:
   @keyframes ping {
     75%, 100% { transform: scale(2); opacity: 0; }
   }
   - Used on unread notification dot

9. CARD HOVER LIFT:
   - `hover:-translate-y-0.5 transition-transform duration-200`

10. BUTTON PRESS:
    - `active:scale-[0.98]` for tactile feedback
```

---

## 🛠️ Bagian 8: Tips Integrasi ke Project

### 8.1 Mapping dari Stitch Output → Project Files

| Stitch Output Component | Target File Path |
|---|---|
| `HomePage` | `frontend/src/pages/public/HomePage.tsx` |
| `ProductsCatalog` | `frontend/src/pages/public/ProductsCatalog.tsx` |
| `ProductDetail` | `frontend/src/pages/public/ProductDetail.tsx` |
| `CartPage` | `frontend/src/pages/public/CartPage.tsx` |
| `CheckoutPage` | `frontend/src/pages/public/CheckoutPage.tsx` |
| `PaymentPage` | `frontend/src/pages/public/PaymentPage.tsx` |
| `RegisterPage` | `frontend/src/pages/public/Register.tsx` |
| `Login` | `frontend/src/pages/Login.tsx` |
| `VerifyEmailPage` | `frontend/src/pages/public/VerifyEmail.tsx` |
| `AboutPage` | `frontend/src/pages/public/AboutPage.tsx` |
| `ContactPage` | `frontend/src/pages/public/ContactPage.tsx` |
| `TermsPage` | `frontend/src/pages/public/TermsPage.tsx` |
| `Dashboard` | `frontend/src/pages/Dashboard.tsx` |
| `Orders` | `frontend/src/pages/Orders.tsx` |
| `OrderDetail` | `frontend/src/pages/OrderDetail.tsx` |
| `DesignFiles` | `frontend/src/pages/DesignFiles.tsx` |
| `Production` | `frontend/src/pages/Production.tsx` |
| `Invoices` | `frontend/src/pages/Invoices.tsx` |
| `Warehouse` | `frontend/src/pages/Warehouse.tsx` |
| `Customers` | `frontend/src/pages/Customers.tsx` |
| `Users` | `frontend/src/pages/Users.tsx` |
| `Profile` | `frontend/src/pages/Profile.tsx` |
| `MyOrders` | `frontend/src/pages/MyOrders.tsx` |
| `Notifications` | `frontend/src/pages/Notifications.tsx` |
| `NotFound` | `frontend/src/pages/NotFound.tsx` |
| `Modal` | `frontend/src/components/ui/Modal.tsx` |
| `ConfirmDialog` | `frontend/src/components/ui/ConfirmDialog.tsx` |
| `ToastProvider` | `frontend/src/contexts/ToastContext.tsx` |
| `MetricCard` | `frontend/src/components/MetricCard.tsx` |
| `Sidebar` | `frontend/src/components/layout/Sidebar.tsx` |
| `Header` | `frontend/src/components/layout/Header.tsx` |
| `PublicLayout` | `frontend/src/components/layout/public/PublicLayout.tsx` |
| `CreateOrderModal` | `frontend/src/components/modals/CreateOrderModal.tsx` |
| `UploadDesignModal` | `frontend/src/components/modals/UploadDesignModal.tsx` |
| `RecordPaymentModal` | `frontend/src/components/modals/RecordPaymentModal.tsx` |
| `RecordShipmentModal` | `frontend/src/components/modals/RecordShipmentModal.tsx` |
| `MaterialFormModal` | `frontend/src/components/modals/MaterialFormModal.tsx` |
| `AdjustStockModal` | `frontend/src/components/modals/AdjustStockModal.tsx` |
| `CustomerFormModal` | `frontend/src/components/modals/CustomerFormModal.tsx` |
| `CustomerDetailModal` | `frontend/src/components/modals/CustomerDetailModal.tsx` |
| `UserFormModal` | `frontend/src/components/modals/UserFormModal.tsx` |
| `InvoiceDetailModal` | `frontend/src/components/modals/InvoiceDetailModal.tsx` |
| `CreateInvoiceModal` | `frontend/src/components/modals/CreateInvoiceModal.tsx` |
| `PaymentHistoryModal` | `frontend/src/components/modals/PaymentHistoryModal.tsx` |
| `DesignPreviewModal` | `frontend/src/components/modals/DesignPreviewModal.tsx` |
| `ReportIssueModal` | `frontend/src/components/modals/ReportIssueModal.tsx` |
| `ReassignJobModal` | `frontend/src/components/modals/ReassignJobModal.tsx` |

### 8.2 Post-Copy Checklist

Setelah copy output Stitch ke file project:

1. **Routing**: Ganti `<a href="...">` → `<Link to="...">` dari `react-router-dom`
2. **Context**: Ganti `const userRole = '...'` → gunakan `useRoleAccess()` hook
3. **API**: Ganti mock data fetch → gunakan `api.get()`/`api.post()` dari `../api/axios`
4. **Toast**: Ganti `alert()` atau `console.log` → gunakan `useToast()` dari `../../contexts/ToastContext`
5. **Modal**: Pastikan modal menggunakan `Modal` base component dari `../../components/ui/Modal`
6. **Currency**: Pastikan semua harga menggunakan `formatCurrency()` helper
7. **Icons**: Pastikan semua icons import dari `lucide-react`, bukan emoji
8. **TypeScript**: Tambahkan interface/type untuk props dan API responses
9. **Loading**: Pastikan setiap halaman handle loading state (skeleton atau spinner)
10. **Error**: Pastikan setiap API call punya error handling (try/catch + toast)

### 8.3 Pages/Features Baru yang Belum Ada di Codebase

Halaman-halaman berikut **belum ada di router/codebase** dan perlu ditambahkan. Lihat **Bagian 9** untuk prompt detail masing-masing halaman.

| Feature | Route | Target File | Notes |
|---|---|---|---|
| Forgot Password | `/forgot-password` | `frontend/src/pages/public/ForgotPassword.tsx` | Form email + reset flow |
| Reset Password | `/reset-password/:token` | `frontend/src/pages/public/ResetPassword.tsx` | New password form |
| FAQ Page | `/faq` | `frontend/src/pages/public/FaqPage.tsx` | Accordion-style FAQ |
| Settings Page | `/dashboard/settings` | `frontend/src/pages/Settings.tsx` | App-wide settings (Owner only) |
| Audit Log | `/dashboard/audit-log` | `frontend/src/pages/AuditLog.tsx` | Full activity history (Owner/Manager) |
| Reports | `/dashboard/reports` | `frontend/src/pages/Reports.tsx` | Revenue, orders, production analytics |
| Quotation System | `/dashboard/quotations` | `frontend/src/pages/Quotations.tsx` | Create/manage quotations (Sales) |

### 8.4 Route Registration

Setelah membuat file halaman baru, daftarkan di `frontend/src/router.tsx`:

```tsx
// === Public routes (di dalam PublicLayout children) ===
{ path: 'faq', element: <FaqPage /> },

// === Auth routes (sejajar dengan /login) ===
{ path: '/forgot-password', element: <Suspense fallback={<LoadingSpinner />}><ForgotPassword /></Suspense> },
{ path: '/reset-password/:token', element: <Suspense fallback={<LoadingSpinner />}><ResetPassword /></Suspense> },

// === Dashboard routes (di dalam /dashboard children, wrapped ProtectedRoute) ===
{ path: 'settings', element: <ProtectedRoute allowedRoles={['Owner']}><Suspense fallback={<LoadingSpinner />}><Settings /></Suspense></ProtectedRoute> },
{ path: 'audit-log', element: <ProtectedRoute allowedRoles={['Owner', 'Manager']}><Suspense fallback={<LoadingSpinner />}><AuditLog /></Suspense></ProtectedRoute> },
{ path: 'reports', element: <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Finance_Staff']}><Suspense fallback={<LoadingSpinner />}><Reports /></Suspense></ProtectedRoute> },
{ path: 'quotations', element: <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Sales']}><Suspense fallback={<LoadingSpinner />}><Quotations /></Suspense></ProtectedRoute> },
```

### 8.5 Sidebar Menu Update

Tambahkan item baru ke sidebar per role:

| Menu Item | Icon (Lucide) | Roles yang Bisa Akses |
|---|---|---|
| Settings | Settings | Owner |
| Audit Log | ScrollText | Owner, Manager |
| Reports | BarChart3 | Owner, Manager, Finance_Staff |
| Quotations | FileText | Owner, Manager, Sales |

---

## 🆕 Bagian 9: Halaman Baru — Prompt Detail

### 9.1 🔑 Forgot Password Page (`/forgot-password`)

```text
Generate a Forgot Password page for MK Printing.

PAGE LAYOUT: full-screen centered, bg-slate-50, same visual style as the Login page.

CARD: `max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100 relative`

CONTENT:

1. BACK LINK:
   - `absolute top-6 left-6` — ArrowLeft icon + "Back to Login" (text-sm font-medium text-slate-400 hover:text-indigo-600)
   - Links to "/login"

2. HEADER (centered, mb-8):
   - Lock icon inside circle: `w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4` with Lock icon (28px)
   - Title: "Forgot your password?" (text-2xl font-extrabold text-slate-800 tracking-tight)
   - Subtitle: "Enter your email address and we'll send you a link to reset your password." (text-sm text-slate-500)

3. FORM:
   a. Email field:
      - Label: "Email Address" (block text-sm font-semibold text-slate-700 mb-1)
      - Input: `w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`
      - Placeholder: "you@example.com"
      - Required, type="email"

4. SUBMIT BUTTON:
   - `w-full bg-indigo-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`
   - Default text: "Send Reset Link" with Send icon (18px)
   - Loading text: "Sending..." with spinner

5. ERROR STATE (conditional):
   - `bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm p-3 mb-4`
   - Examples: "No account found with this email address", "Too many requests. Please try again later."

6. SUCCESS STATE (replaces form after submission):
   - Mail icon inside circle: `w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4` with Mail icon (28px)
   - Title: "Check your email" (text-2xl font-extrabold text-slate-800)
   - Message: "We've sent a password reset link to {email}. The link will expire in 30 minutes." (text-sm text-slate-500)
   - "Didn't receive the email?" section:
     - `mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600`
     - Bullet points: "Check your spam folder", "Make sure the email address is correct"
     - "Resend Email" button (text-indigo-600 font-semibold hover:text-indigo-700) with cooldown timer
       - After click: "Resend in 59s" (disabled, countdown decrements)
       - After cooldown: "Resend Email" active again
   - "Back to Login" link at bottom (text-sm text-slate-500)

7. RATE LIMITING UI:
   - If user sends too many requests: show amber alert
   - `bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800`
   - Clock icon + "Please wait 5 minutes before requesting another reset link."

Export as `export const ForgotPasswordPage`.
```

### 9.2 🔐 Reset Password Page (`/reset-password/:token`)

```text
Generate a Reset Password page for MK Printing.

PAGE LAYOUT: full-screen centered, bg-slate-50, same card style as Login.

CARD: `max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100`

THREE STATES:

=== STATE 1: VALIDATING TOKEN (initial) ===
- Centered in card:
  - Spinner: `animate-spin h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto`
  - "Verifying reset link..." (text-lg font-semibold text-slate-700 mt-4)
  - "Please wait" (text-sm text-slate-400)

=== STATE 2: RESET FORM (token valid) ===
1. HEADER:
   - Key icon in circle: `w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4` with Key icon (28px)
   - Title: "Set new password" (text-2xl font-extrabold text-slate-800)
   - Subtitle: "Your new password must be different from previously used passwords." (text-sm text-slate-500)

2. FORM:
   a. New Password:
      - Label: "New Password" (text-sm font-semibold text-slate-700)
      - Input: password type with show/hide toggle (Eye/EyeOff icon button, absolute right-3)
      - `w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500`
   b. PASSWORD STRENGTH INDICATOR:
      - 4 bars: `h-1.5 rounded-full flex gap-1`
      - Weak (1 bar filled): bg-red-500, rest bg-slate-200
      - Fair (2 bars): bg-amber-500
      - Good (3 bars): bg-blue-500
      - Strong (4 bars): bg-emerald-500
      - Label: strength text with matching color (text-xs font-semibold mt-1)
      - Requirements checklist (NEW):
        - `mt-3 space-y-1.5`
        - Each requirement: `flex items-center gap-2 text-xs`
        - Met: CheckCircle icon (14px, text-emerald-500) + text-slate-600
        - Unmet: Circle icon (14px, text-slate-300) + text-slate-400
        - Requirements: "At least 8 characters", "One uppercase letter", "One lowercase letter", "One number"
   c. Confirm Password:
      - Label: "Confirm New Password"
      - Same input style
      - If mismatch: red border + "Passwords do not match" (text-xs text-red-600 mt-1)

3. SUBMIT BUTTON:
   - "Reset Password" with ShieldCheck icon (18px)
   - `w-full bg-indigo-600 text-white p-3 rounded-lg font-bold` + hover/active states
   - Loading: "Resetting..." with spinner

4. ERROR ALERT (form-level):
   - `bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm p-3 mb-4`

=== STATE 3: SUCCESS (after reset) ===
- CheckCircle icon: `w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-4` (28px)
- Title: "Password reset successful!" (text-2xl font-extrabold text-slate-800)
- Message: "Your password has been updated. You can now log in with your new password." (text-sm text-slate-500)
- "Go to Login" button: primary, full width, with ArrowRight icon
- Auto-redirect countdown: "Redirecting to login in 5s..." (text-xs text-slate-400)

=== STATE 4: INVALID/EXPIRED TOKEN ===
- XCircle icon: `w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto mb-4` (28px)
- Title: "Invalid or expired link" (text-2xl font-extrabold text-slate-800)
- Message: "This password reset link is invalid or has expired. Please request a new one." (text-sm text-slate-500)
- "Request New Link" button: primary, Link to /forgot-password
- "Back to Login" link: text-sm text-slate-500

Calls GET /api/v1/auth/validate-reset-token/:token on mount.
On submit: POST /api/v1/auth/reset-password with { token, newPassword }.

Export as `export const ResetPasswordPage`.
```

### 9.3 ❓ FAQ Page (`/faq`)

```text
Generate a FAQ (Frequently Asked Questions) page for MK Printing.

PAGE LAYOUT: within PublicLayout, max-w-4xl centered

SECTIONS:

1. HERO HEADER:
   - `bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 rounded-3xl mb-12 text-center relative overflow-hidden`
   - Decorative circle: `absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full`
   - HelpCircle icon (48px, text-white/80) centered above title
   - Title: "Frequently Asked Questions" (text-4xl font-extrabold tracking-tight)
   - Subtitle: "Find answers to common questions about our printing services" (text-indigo-100 text-lg)

2. SEARCH BAR:
   - `max-w-xl mx-auto mb-12 relative`
   - Search icon (left, text-slate-400)
   - Input: `w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`
   - Placeholder: "Search for a question..."
   - Filters results as user types (client-side filter on question text)
   - Clear button (X icon) when text is present

3. FAQ CATEGORIES (horizontal pills):
   - Categories: "All", "Orders & Pricing", "Production & Delivery", "Payment", "Account", "Technical"
   - Active: `bg-indigo-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm`
   - Inactive: `bg-white text-slate-600 rounded-full px-5 py-2.5 text-sm font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors`

4. ACCORDION FAQ LIST:
   - Each FAQ item: `bg-white rounded-xl border border-slate-200 overflow-hidden mb-3 transition-all`
   - Collapsed state:
     - `px-6 py-5 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors`
     - Question text: `text-base font-semibold text-slate-900 flex-1 pr-4`
     - ChevronDown icon (20px, text-slate-400) — rotates 180deg when open with `transition-transform duration-200`
     - Category badge (small): `text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-500 mr-3`
   - Expanded state:
     - Question row gets `bg-slate-50` background
     - ChevronDown rotated to ChevronUp
     - Answer area: `px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100`
     - Answer can contain paragraphs, bullet lists, bold text, and links (text-indigo-600)
     - Animation: max-height transition or `animate-accordion-open` (200ms ease-out)
   - Only one accordion open at a time (optional: allow multiple)

5. FAQ MOCK DATA (15+ questions across categories):

   Orders & Pricing:
   - "What is the minimum order quantity?" → "Our minimum order varies by product..."
   - "How are prices calculated?" → "Pricing depends on paper type, finishing, quantity..."
   - "Can I get a custom quotation for bulk orders?" → "Yes, contact our Sales team..."
   - "What file formats do you accept?" → "We accept PDF (preferred), AI, PSD, EPS..."
   - "Can I modify my order after placing it?" → "Orders can be modified only while in Pending status..."

   Production & Delivery:
   - "How long does production take?" → "Standard production is 3-5 business days..."
   - "Do you offer express/rush printing?" → "Yes, select Urgent priority at checkout..."
   - "What delivery options are available?" → "Self Pickup, Standard Delivery (3-5 days), Express (1-2 days)..."
   - "Do you ship outside Jakarta?" → "Yes, we deliver nationwide via JNE, JNT, SiCepat..."

   Payment:
   - "What payment methods do you accept?" → "Bank Transfer (BCA, BNI, Mandiri), Cash, Credit Card..."
   - "When is payment due?" → "Payment must be completed within 24 hours of order placement..."
   - "Do you offer credit terms for corporate clients?" → "Yes, Gold and Platinum tier clients..."
   - "Can I get a refund?" → "Refunds are available for defective prints. See our Terms..."

   Account:
   - "How do I create an account?" → "Click Register, fill in your details, verify your email..."
   - "What are the loyalty tiers?" → "Standard, Silver (>Rp 10M), Gold (>Rp 50M), Platinum (>Rp 100M)..."
   - "I forgot my password, how do I reset it?" → "Click 'Forgot Password' on the login page..."

   Technical:
   - "What resolution should my files be?" → "Minimum 300 DPI for offset printing..."
   - "Do you provide design services?" → "We offer basic layout adjustments. For full design, contact our team..."

6. STILL NEED HELP SECTION (bottom):
   - `bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 mt-12`
   - MessageCircle icon (32px, text-indigo-600) centered
   - Title: "Still have questions?" (text-xl font-bold text-slate-900)
   - Subtitle: "Can't find what you're looking for? Our team is here to help." (text-slate-500)
   - Two CTA buttons:
     - "Contact Us" (primary, indigo-600, Link to /contact) with Mail icon
     - "WhatsApp" (secondary, emerald-600, external link) with Phone icon

7. NO SEARCH RESULTS:
   - SearchX icon (48px, text-slate-300) centered
   - "No questions match your search" (text-lg font-bold text-slate-900)
   - "Try different keywords or browse by category" (text-slate-500)
   - "Clear Search" button

Export as `export const FaqPage`.
```

### 9.4 ⚙️ Settings Page (`/dashboard/settings`) — Owner Only

```text
Generate an Application Settings page for MK Printing, accessible only by the Owner role.

PAGE LAYOUT: max-w-5xl centered, space-y-8

1. HEADER:
   - Title: "Settings" (text-2xl font-extrabold text-slate-900 tracking-tight)
   - Subtitle: "Manage your application configuration" (text-sm text-slate-500)
   - Right: "Save All Changes" button (primary, disabled until changes detected)

2. LEFT SIDEBAR NAVIGATION (optional) or TAB NAVIGATION:
   - Tabs: "General", "Business Info", "Payment", "Notifications", "Branding", "Integrations"
   - Vertical list on desktop (lg:w-64), horizontal tabs on mobile
   - Active: `bg-indigo-50 text-indigo-700 font-semibold rounded-lg px-4 py-2.5`
   - Inactive: `text-slate-600 hover:bg-slate-50 rounded-lg px-4 py-2.5`

3. TAB: GENERAL SETTINGS
   Card: `bg-white rounded-xl shadow-sm border border-slate-200 p-8`
   - Application Name: text input (default: "Multi Kreasi Printing")
   - Timezone: dropdown (Asia/Jakarta, etc.)
   - Default Language: dropdown (Bahasa Indonesia, English)
   - Currency: dropdown (IDR — locked, display only)
   - Date Format: dropdown (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
   - Tax Rate (%): number input (default: 11)
   - Auto-approve orders under: currency input (e.g., Rp 2.000.000) — orders below this value skip approval
   - Order number prefix: text input (default: "ORD")
   - Invoice number prefix: text input (default: "INV")

4. TAB: BUSINESS INFORMATION
   Card with form fields:
   - Company Legal Name: "PT Multi Kreasi Printing"
   - NPWP (Tax ID): text input
   - Address: textarea
   - City, Province, Postal Code: 3-column grid
   - Phone: tel input
   - Email: email input
   - Website: url input
   - Logo Upload: dropzone for company logo (current logo preview + "Change Logo" button)
     - Preview: `w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50`
     - Accepted: PNG, SVG, JPG (Max 2MB)

5. TAB: PAYMENT SETTINGS
   Card:
   - Section: "Bank Accounts" (for payment instructions)
     - List of bank accounts: Bank Name, Account Name, Account Number, Branch
     - Each row: editable with Edit/Delete buttons
     - "Add Bank Account" button (Plus icon)
   - Section: "Payment Terms"
     - Payment deadline (hours): number input (default: 24)
     - Partial payment allowed: toggle switch
     - Minimum partial payment (%): number input (shown only if partial enabled)
   - Section: "Payment Methods"
     - Toggles for: Bank Transfer, Cash, Credit Card, Giro
     - Each with on/off toggle switch

6. TAB: NOTIFICATION SETTINGS
   Card:
   - "Email Notifications" section with toggle switches:
     - New order received → Owner, Manager
     - Order approved → Customer
     - Payment received → Finance_Staff, Customer
     - Production started → Customer
     - Order ready for delivery → Customer, Warehouse_Staff
     - Low stock alert → Owner, Manager, Warehouse_Staff
     - Overdue invoice reminder → Finance_Staff
   - Each toggle: `w-11 h-6 rounded-full` with sliding circle
     - On: `bg-indigo-600`
     - Off: `bg-slate-200`
   - "Email Templates" link: "Customize email templates →" (text-indigo-600, future feature, disabled with "Coming Soon" badge)

7. TAB: BRANDING
   Card:
   - Primary Color picker: color input with hex code
   - Logo (repeated from Business Info for convenience)
   - Favicon upload
   - Invoice Header/Footer customization: textarea
   - "Preview Invoice" button to see branding in action

8. TAB: INTEGRATIONS (NEW)
   Card:
   - WhatsApp Business API: toggle + API key input (masked password field)
   - Email Provider: dropdown (SMTP, SendGrid, Mailgun) + config fields
   - Each integration: `bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between`
     - Left: icon + name + description + status badge ("Connected" emerald / "Not Connected" slate)
     - Right: "Configure" button or toggle

9. UNSAVED CHANGES WARNING:
   - If user navigates away with unsaved changes: show ConfirmDialog (warning variant)
   - "You have unsaved changes. Are you sure you want to leave?"
   - Yellow dot indicator next to tabs with unsaved changes

10. SAVE CONFIRMATION:
    - On save: toast success "Settings saved successfully"
    - On error: toast error with API message

Export as default function `Settings`.
```

### 9.5 📜 Audit Log Page (`/dashboard/audit-log`) — Owner/Manager

```text
Generate an Audit Log / Activity History page for MK Printing, accessible by Owner and Manager roles.

PAGE LAYOUT: max-w-6xl centered

1. HEADER:
   - Title: "Audit Log" (text-2xl font-extrabold text-slate-900 tracking-tight)
   - Subtitle: "Complete activity history across the platform" (text-sm text-slate-500)
   - Right: "Export CSV" button (Download icon, outlined) and "Export PDF" button

2. FILTER BAR (comprehensive):
   - Search: `w-80` "Search by user, action, or resource..." with Search icon
   - Date range picker: "Today", "Last 7 Days", "Last 30 Days", "Custom Range" (with calendar date inputs)
   - User filter: searchable dropdown of all users (avatar + name)
   - Action type filter: dropdown with options:
     - All, Created, Updated, Deleted, Approved, Rejected, Login, Logout, Password_Changed, Payment_Recorded, Status_Changed, File_Uploaded, Settings_Changed
   - Resource filter: dropdown — All, Order, Invoice, Customer, User, Material, Design, Production, Settings
   - "Clear All Filters" text button (text-indigo-600, visible when any filter active)

3. AUDIT LOG TABLE:
   - Columns: Timestamp, User (avatar + name), Action (badge), Resource Type, Resource ID, Description, IP Address
   - Timestamp: `font-mono text-sm text-slate-500` — format: "2026-08-08 14:30:22 WIB"
   - User column: `w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold` avatar + name + role badge (small)
   - Action badges:
     - Created: `bg-emerald-100 text-emerald-700`
     - Updated: `bg-blue-100 text-blue-700`
     - Deleted: `bg-red-100 text-red-700`
     - Approved: `bg-emerald-100 text-emerald-700`
     - Rejected: `bg-red-100 text-red-700`
     - Login: `bg-indigo-100 text-indigo-700`
     - Logout: `bg-slate-100 text-slate-600`
     - Password_Changed: `bg-amber-100 text-amber-700`
     - Status_Changed: `bg-purple-100 text-purple-700`
   - Resource ID: monospace, clickable link to the resource (e.g., Order #ORD-2026-0089 links to order detail)
   - Description: truncated to 1 line, full text on hover tooltip
   - EXPANDABLE ROW DETAIL:
     - Click a row to expand and see:
     - "Changes" section: show before/after diff for updates
       - `bg-slate-50 rounded-lg p-4 font-mono text-sm`
       - Changed fields: `text-red-600 line-through` (old value) → `text-emerald-600` (new value)
     - "Metadata" section: full IP address, user agent/browser, session ID
     - "Related Events" section: other audit entries for the same resource (linked timeline)

4. TIMELINE VIEW (alternative toggle, NEW):
   - Toggle between "Table" and "Timeline" views (Table/Activity icons)
   - Timeline: vertical line on the left with dots per event
   - Each event card:
     - `ml-8 relative before:absolute before:left-[-17px] before:w-2 before:h-2 before:rounded-full before:bg-indigo-600 before:top-3`
     - Connector line: `before:absolute before:left-[-13px] before:top-5 before:bottom-0 before:w-0.5 before:bg-slate-200`
     - Content: `bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4`
     - Header: user avatar + name + action text + timestamp
     - Body: description, affected resource link
   - Group by date: "Today", "Yesterday", "August 6, 2026", etc. — group headers as sticky date labels

5. STATISTICS BAR (top, above filters):
   - 4 mini-stats: "Total Events Today" (count), "Active Users Today" (count), "Most Active User" (name), "Last Activity" (timestamp)
   - `bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-4 gap-4`

6. PAGINATION: standard pattern with "Showing 1-50 of 1,234 events" — higher per-page count (50 default)

7. EMPTY STATE:
   - ScrollText icon (48px, text-slate-300)
   - "No activity recorded" or "No events match your filters"
   - "Clear Filters" button

8. MOCK DATA (20+ entries):
   - "admin@mkprinting.com approved Order #ORD-2026-0089"
   - "sales@mkprinting.com created Customer PT Sukses Makmur"
   - "finance@mkprinting.com recorded payment for Invoice #INV-2026-0045"
   - "designer@mkprinting.com uploaded design file for Order #ORD-2026-0087"
   - "production@mkprinting.com changed Order #ORD-2026-0085 status from In_Production to Quality_Check"
   - "admin@mkprinting.com updated Settings: tax_rate from 10% to 11%"
   - "admin@mkprinting.com deactivated User warehouse@mkprinting.com"
   - "customer@company.com logged in from 103.28.xx.xx"
   - Various timestamps throughout the day

Export as default function `AuditLog`.
```

### 9.6 📊 Reports Page (`/dashboard/reports`) — Owner/Manager/Finance

```text
Generate a Reports & Analytics dashboard page for MK Printing.

PAGE LAYOUT: max-w-7xl, space-y-8

1. HEADER:
   - Title: "Reports & Analytics" (text-2xl font-extrabold text-slate-900 tracking-tight)
   - Subtitle: "Insights into your business performance"
   - Right side controls:
     - Date range selector: "This Week" / "This Month" / "Last 3 Months" / "This Year" / "Custom"
       - Active: `bg-indigo-600 text-white rounded-full px-4 py-2 text-sm font-semibold`
       - Inactive: `bg-white text-slate-600 border border-slate-200 rounded-full px-4 py-2 text-sm`
     - "Export Report" dropdown button (Download icon): options "Export as PDF", "Export as CSV", "Export as Excel"

2. TOP METRIC CARDS (4 cards, full width grid):
   - "Total Revenue": DollarSign icon, emerald variant, large IDR amount (e.g., Rp 1.250.000.000), trend +15.3% vs prev period
   - "Total Orders": ShoppingBag icon, default variant, count (e.g., 342), trend +8.2%
   - "Average Order Value": TrendingUp icon, blue variant, IDR amount, trend
   - "Customer Retention Rate": Users icon, purple variant, percentage (e.g., 87.5%), trend

3. REVENUE CHART SECTION:
   - Card: "Revenue Overview" (text-lg font-bold)
   - Tabs inside card: "Daily" / "Weekly" / "Monthly"
   - Chart area: `h-80 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center`
   - Placeholder text: "Revenue chart (implement with Recharts/Chart.js)"
   - Below chart: legend showing "Revenue" (indigo line) and "Expenses" (slate line, if applicable)
   - NOTE: Generate the placeholder layout. For Stitch, show a mock bar/line chart SVG or placeholder area.

4. ORDERS ANALYTICS (2-column):
   LEFT: "Orders by Status" — donut/pie chart placeholder
   - `h-64` chart area
   - Legend below: colored dots + status name + count + percentage
   - Statuses: Pending (amber), Approved (blue), In Production (indigo), Completed (emerald), Cancelled (red)

   RIGHT: "Orders by Product Category" — horizontal bar chart placeholder
   - Categories ranked by order count: Business Cards, Flyers, Banners, Packaging, etc.
   - Each bar: `h-8 rounded-full bg-indigo-600` proportional to count
   - Show count and percentage next to each bar

5. TOP CUSTOMERS TABLE:
   - Card: "Top 10 Customers by Revenue"
   - Table: Rank (#), Customer/Company, Total Orders, Total Revenue, Avg Order Value, Last Order
   - Rank 1-3: gold/silver/bronze medal icons or colored rank badges
   - Revenue: right-aligned, font-mono, IDR format
   - "View All Customers →" link at bottom

6. PRODUCTION METRICS (2-column):
   LEFT: "Production Efficiency"
   - Avg production time: `text-3xl font-extrabold text-slate-900` + "days" suffix
   - On-time delivery rate: percentage in emerald
   - Quality pass rate: percentage
   - Rework rate: percentage in red

   RIGHT: "Machine Utilization"
   - List of machines with utilization bar
   - Machine name + `h-3 rounded-full bg-slate-200` with inner `bg-indigo-600` fill
   - Percentage text
   - Mock: Offset Press 1 (85%), Digital Press 2 (72%), Large Format (45%)

7. FINANCIAL SUMMARY (full-width card):
   - "Financial Overview" title
   - 3-column grid:
     - "Accounts Receivable": outstanding IDR amount, overdue count
     - "Payments This Month": received IDR, count of payments
     - "Overdue Rate": percentage, trending indicator
   - Below: mini table of recent overdue invoices (top 5)

8. MATERIAL/INVENTORY INSIGHTS:
   - Card: "Inventory Summary"
   - Low stock items list (top 5 critical)
   - Material cost trend placeholder
   - "Total Materials": count, "Low Stock": count (amber), "Out of Stock": count (red)

9. EXPORT SECTION:
   - "Generate Full Report" button (primary, large)
   - Report type selector: Revenue Report, Order Report, Customer Report, Production Report, Inventory Report
   - Date range (pre-filled from header selection)
   - Format: PDF / CSV / Excel

10. PRINT BUTTON (NEW):
    - "Print Report" icon button (Printer icon, outlined)
    - Opens browser print dialog with print-optimized CSS

MOCK DATA: all numbers should be realistic for a mid-sized Indonesian printing company. Revenue in hundreds of millions IDR.

Export as default function `Reports`.
```

### 9.7 📝 Quotations Page (`/dashboard/quotations`) — Sales/Manager/Owner

```text
Generate a Quotation Management page for MK Printing.

PAGE LAYOUT: max-w-6xl, standard page structure

1. HEADER:
   - Title: "Quotations" (text-2xl font-extrabold text-slate-900 tracking-tight)
   - Subtitle: "Create and manage price quotations for clients"
   - Right: "Create Quotation" button (Plus icon, primary indigo-600) — opens CreateQuotationModal

2. METRIC CARDS (3):
   - "Pending Quotations": FileText icon, warning variant, count
   - "Accepted This Month": CheckCircle icon, success variant, count + total IDR value
   - "Conversion Rate": TrendingUp icon, default variant, percentage (e.g., "68%")

3. FILTER BAR:
   - Search: "Search by quotation number, customer, or reference..."
   - Status filter: All, Draft, Sent, Viewed, Accepted, Declined, Expired
   - Date range filter
   - Sales Person filter (for Manager/Owner only — see quotations from all staff)

4. QUOTATIONS TABLE:
   - Columns: Quotation #, Customer/Company, Items Summary, Total Amount, Valid Until, Status, Created By, Actions
   - Quotation number format: `QUO-2026-0001` (monospace font)
   - Status badges:
     - Draft: `bg-slate-100 text-slate-600` (Pencil icon)
     - Sent: `bg-blue-100 text-blue-700` (Send icon)
     - Viewed: `bg-indigo-100 text-indigo-700` (Eye icon)
     - Accepted: `bg-emerald-100 text-emerald-700` (CheckCircle icon)
     - Declined: `bg-red-100 text-red-700` (XCircle icon)
     - Expired: `bg-slate-100 text-slate-500` (Clock icon) — grayed out with strikethrough on amount
   - Valid Until column: show "Expires in 5 days" (amber text if < 7 days), "Expired" (red text if past)
   - Total Amount: right-aligned, font-mono, IDR format
   - Items Summary: truncated list "Business Cards × 5000, Flyers × 2000, +1 more"
   - Actions:
     - "View" (Eye icon) — opens QuotationDetailModal
     - "Edit" (Pencil icon) — only for Draft status, opens CreateQuotationModal in edit mode
     - "Send to Customer" (Send icon) — only for Draft, opens confirm dialog
     - "Convert to Order" (ShoppingBag icon, emerald) — only for Accepted status
     - "Duplicate" (Copy icon) — creates a copy in Draft status
     - "Download PDF" (Download icon)
     - "Delete" (Trash2 icon) — only for Draft, opens ConfirmDialog

5. CreateQuotationModal (size="xl"):
   a. Customer Selection:
      - Searchable combobox: search existing customers by name/company
      - Show company name + contact person in dropdown
      - "Add New Customer" link at bottom → opens CustomerFormModal

   b. Quotation Items (repeatable rows):
      - Product/Service dropdown (from product catalog)
      - Description: text input (override product description if needed)
      - Specifications: text input (e.g., "A4, Art Paper 260gsm, Glossy Lamination")
      - Quantity: number input
      - Unit Price: currency input (pre-filled from catalog, editable for custom pricing)
      - Discount (%): number input (0-100, optional)
      - Line Total: calculated (quantity × unit_price × (1 - discount/100)), read-only, IDR format
      - "Add Item" button (Plus icon, text-indigo-600)
      - Remove button per row (Trash2 icon, text-red-400 hover:text-red-600)

   c. ADDITIONAL SECTIONS:
      - Terms & Conditions: textarea (pre-filled with default terms, editable)
        - Default: "1. Prices valid for 30 days\n2. 50% downpayment required\n3. Balance due before delivery\n4. Production starts after design approval"
      - Internal Notes (not visible to customer): textarea
      - Valid Until: date picker (default: 30 days from now)
      - Discount on Total: percentage input (optional)

   d. PRICING SUMMARY:
      - `bg-slate-50 rounded-xl p-4 border border-slate-100`
      - Subtotal: sum of all line totals
      - Discount: if total discount applied
      - Tax (11%): calculated
      - Grand Total: `text-2xl font-extrabold text-indigo-600`

   e. Footer:
      - "Cancel" (outlined)
      - "Save as Draft" (secondary/outlined, FileText icon)
      - "Save & Send" (primary, Send icon) — saves and immediately sends to customer email

6. QuotationDetailModal (size="2xl"):
   - QUOTATION HEADER:
     - `bg-slate-50 p-6 rounded-t-xl border-b border-slate-200`
     - Left: Company logo + "Multi Kreasi Printing" + address
     - Right: "QUOTATION" title + quotation number + date + status badge
   - CUSTOMER INFO:
     - Bill To section: company name, contact person, email, phone, address
   - ITEMS TABLE:
     - Professional invoice-style table
     - Columns: #, Description, Specifications, Qty, Unit Price, Discount, Amount
     - Subtotal, Discount, Tax, Grand Total
     - Alternating row backgrounds for readability
   - TERMS & CONDITIONS:
     - `text-sm text-slate-600 leading-relaxed`
   - QUOTATION TIMELINE (bottom):
     - History of events: Created → Sent → Viewed → Accepted/Declined
     - Each event: timestamp + user + action
   - FOOTER ACTIONS:
     - "Download PDF" (primary)
     - "Send to Customer" (if Draft/Viewed, secondary)
     - "Convert to Order" (if Accepted, emerald button)
     - "Edit" (if Draft)
     - "Print" (Printer icon)

7. CONVERT TO ORDER FLOW:
   - When clicking "Convert to Order" on an Accepted quotation:
   - ConfirmDialog: "This will create a new order based on Quotation #QUO-2026-0001 for PT Sukses Makmur. Total: Rp 12.500.000. Proceed?"
   - On confirm: auto-creates an order with all quotation items, links quotation to order
   - On success: toast "Order #ORD-2026-0089 created from quotation" + navigate to order detail

8. SEND TO CUSTOMER FLOW:
   - Modal form: "Send Quotation to Customer"
   - Pre-filled recipient email (from customer record)
   - Subject: "Quotation #QUO-2026-0001 from Multi Kreasi Printing"
   - Message body: textarea with template text
   - CC (optional): additional email input
   - "Send" button (primary, Send icon) with loading state
   - On success: status changes from Draft to Sent, toast confirmation

9. PAGINATION: standard

10. EMPTY STATE:
    - FileText icon (48px, text-slate-300)
    - "No quotations yet"
    - "Create your first quotation to send professional pricing to clients"
    - "Create Quotation" button (primary)

MOCK DATA: 8-10 quotations with varied statuses, Indonesian corporate clients, printing products, IDR amounts (Rp 1.000.000 - Rp 50.000.000).

Export as default function `Quotations`.
```

---

### Updated Mapping Table — New Pages

| Stitch Output Component | Target File Path |
|---|---|
| `ForgotPasswordPage` | `frontend/src/pages/public/ForgotPassword.tsx` |
| `ResetPasswordPage` | `frontend/src/pages/public/ResetPassword.tsx` |
| `FaqPage` | `frontend/src/pages/public/FaqPage.tsx` |
| `Settings` | `frontend/src/pages/Settings.tsx` |
| `AuditLog` | `frontend/src/pages/AuditLog.tsx` |
| `Reports` | `frontend/src/pages/Reports.tsx` |
| `Quotations` | `frontend/src/pages/Quotations.tsx` |
| `CreateQuotationModal` | `frontend/src/components/modals/CreateQuotationModal.tsx` |
| `QuotationDetailModal` | `frontend/src/components/modals/QuotationDetailModal.tsx` |

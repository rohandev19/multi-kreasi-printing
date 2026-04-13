# Implementation Plan: Role-Based Pages

## Overview

This implementation plan breaks down the role-based pages feature into discrete coding tasks. The feature implements role-specific dashboards, page access controls, dynamic navigation, and customized views for seven user roles (Owner, Manager, Designer, Production_Staff, Warehouse_Staff, Finance_Staff, and Customer) in the Multi Kreasi Printing platform.

Additionally, this plan includes implementation of a **Public Storefront Shell** for unauthenticated visitors to browse products and manage a guest cart, **Email Verification** for customer registration, and **Cart Merge** functionality to combine guest cart with user cart after login.

The implementation follows an incremental approach: first establishing core infrastructure (role context, access controls, routing guards), then building role-specific dashboards with metrics, followed by role-filtered page views, then public storefront pages, email verification, cart management, and finally specialized functionality for each role.

## Tasks

- [x] 1. Set up core role-based infrastructure
  - [x] 1.1 Create RoleContext provider and custom hook
    - Create `frontend/src/contexts/RoleContext.tsx` with RoleContextType interface
    - Implement context provider with role state management
    - Add `hasAccess()` and `hasPermission()` methods
    - Implement `refreshRole()` method to sync from backend
    - Handle invalid role context by redirecting to login
    - _Requirements: 10.1, 10.2, 15.1, 15.2, 15.3_
  
  - [x] 1.2 Create useRoleAccess custom hook
    - Create `frontend/src/hooks/useRoleAccess.ts`
    - Implement `canAccess(page)` method for page-level checks
    - Implement `canPerformAction(action)` method for action-level checks
    - Implement `getVisibleMenuItems()` method returning filtered menu items
    - Add loading state management
    - _Requirements: 10.1, 10.2, 11.1, 11.2, 11.3_
  
  - [x] 1.3 Create enhanced ProtectedRoute component
    - Create `frontend/src/components/ProtectedRoute.tsx`
    - Add authentication token validation
    - Add role-based access control with `allowedRoles` prop
    - Implement redirect to login if not authenticated
    - Implement redirect to dashboard with error toast if role unauthorized
    - Log unauthorized access attempts to console
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 1.4 Update router with role-based route protection
    - Modify `frontend/src/router.tsx` to wrap routes with ProtectedRoute
    - Add `allowedRoles` configuration for each route
    - Implement role-based redirects (Customer → My Orders, Staff → Orders)
    - Add error boundaries for role access failures
    - _Requirements: 3.5, 9.4, 12.1, 12.2_

- [ ] 2. Checkpoint - Verify role infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create database migrations for new features
  - [x] 3.1 Create email_verification_tokens table migration
    - Create Prisma migration file for email_verification_tokens table
    - Add columns: id (UUID), user_id (UUID FK), token (VARCHAR 255 unique), expires_at (TIMESTAMPTZ), used_at (TIMESTAMPTZ nullable), created_at (TIMESTAMPTZ)
    - Add indexes on token and user_id columns
    - Add foreign key constraint to users table with CASCADE delete
    - _Requirements: 18.1, 18.2_
  
  - [x] 3.2 Update User model with email verification status
    - Update Prisma schema to add emailVerified Boolean field (default false) to User model
    - Update Prisma schema to add verificationToken relation to User model
    - Generate Prisma migration
    - _Requirements: 18.1, 18.6_
  
  - [x] 3.3 Create cart and cart_items tables migration
    - Create Prisma migration for cart table with columns: id (UUID), user_id (UUID FK unique), created_at, updated_at
    - Create Prisma migration for cart_items table with columns: id (UUID), cart_id (UUID FK), product_id (UUID FK), quantity (INT), unit_price (DECIMAL), subtotal (DECIMAL), created_at, updated_at
    - Add indexes on user_id, cart_id, and product_id
    - Add foreign key constraints with CASCADE delete
    - _Requirements: 17.1, 17.2, 17.4, 17.5_
  
  - [x] 3.4 Run all migrations
    - Execute `npx prisma migrate dev` to apply all migrations
    - Verify migration success
    - Generate updated Prisma client
    - Test database connectivity after migrations

- [ ] 4. Checkpoint - Verify database migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Email Verification Service
  - [x] 5.1 Create email verification DTOs and types
    - Create `backend/src/auth/dto/verify-email.dto.ts` with VerifyEmailDto and VerifyEmailResponse
    - Create `backend/src/auth/dto/resend-verification.dto.ts` with ResendVerificationDto
    - Create email verification token entity/type
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 5.2 Implement EmailVerificationService
    - Create `backend/src/auth/services/email-verification.service.ts`
    - Implement `sendVerificationEmail(userId, email)` method using crypto.randomBytes for token
    - Implement `verifyEmail(token)` method to validate token and update user status
    - Implement `resendVerificationEmail(email)` method
    - Implement `isTokenExpired(createdAt)` private method (24 hour expiration)
    - Store tokens in email_verification_tokens table
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  
  - [x] 5.3 Integrate email service for sending verification emails
    - Create email template for verification email in HTML format
    - Configure email service (SMTP or email provider) in environment variables
    - Implement email sending logic in EmailVerificationService
    - Test email delivery with verification link
    - _Requirements: 18.1_
  
  - [x] 5.4 Enhance Auth Controller with registration and verification endpoints
    - Update `backend/src/auth/auth.controller.ts`
    - Add `POST /api/v1/auth/register` endpoint with @Public() decorator
    - Add `GET /api/v1/auth/verify-email/:token` endpoint with @Public() decorator
    - Add `POST /api/v1/auth/resend-verification` endpoint with @Public() decorator
    - Implement registration logic: hash password, create user with status 'Unverified', send verification email
    - Implement verification logic: validate token, update user status to 'Verified'
    - Return appropriate error messages for invalid/expired tokens
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.6_
  
  - [x] 5.5 Add checkout verification guard
    - Create guard to block checkout for unverified users
    - Update checkout endpoint with verification status check
    - Return error message with resend option if user is unverified
    - Allow login and cart management for unverified users
    - _Requirements: 18.5, 18.6_

- [ ] 6. Checkpoint - Verify email verification functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Public Products API
  - [x] 7.1 Create public products DTOs
    - Create `backend/src/products/dto/get-public-products.dto.ts` with query params: search, categoryId, sortBy, page, limit
    - Create `backend/src/products/dto/public-product.dto.ts` with safe product fields (no internal data)
    - Create `backend/src/products/dto/product-list-response.dto.ts` with data, pagination, categories
    - Create `backend/src/products/dto/product-detail-response.dto.ts` with product, pricing tiers, images
    - _Requirements: 16.1, 16.2_
  
  - [x] 7.2 Create PublicProductsController
    - Create `backend/src/products/public-products.controller.ts`
    - Add `@Controller('api/v1/public/products')` decorator
    - Add `GET /` endpoint with @Public() decorator for product catalog
    - Add `GET /:id` endpoint with @Public() decorator for product detail
    - Add `GET /categories` endpoint with @Public() decorator for category list
    - Implement query filters: search (ILIKE on name/description), categoryId, sortBy
    - Only return products with status 'Active'
    - Implement pagination (default 20 per page)
    - _Requirements: 16.1, 16.2, 16.4_
  
  - [x] 7.3 Implement product caching for public endpoints
    - Add cache decorator to public product endpoints (5-minute TTL)
    - Configure cache key strategy based on query parameters
    - Implement cache invalidation on product updates
    - Test cache performance and hit rates
    - _Requirements: 16.1, 16.2_

- [x] 8. Implement Cart Merge Service
  - [x] 8.1 Create cart DTOs and types
    - Create `backend/src/cart/dto/guest-cart-item.dto.ts` with productId, quantity
    - Create `backend/src/cart/dto/merge-cart.dto.ts` with guestCartItems array
    - Create `backend/src/cart/dto/cart-response.dto.ts` with cart items, subtotal, tax, shipping, total
    - Define CartItem and Cart types
    - _Requirements: 17.1, 17.2, 17.4, 17.5_
  
  - [x] 8.2 Create CartMergeService
    - Create `backend/src/cart/cart-merge.service.ts`
    - Implement `mergeGuestCart(userId, guestCartItems)` method
    - Get or create user cart in database
    - For each guest item: if exists in user cart, combine quantities; if new, add to cart
    - Calculate subtotal, tax, shipping, and total
    - Return merged cart with all items
    - _Requirements: 17.4, 17.5_
  
  - [x] 8.3 Create Cart Controller with merge endpoint
    - Create `backend/src/cart/cart.controller.ts`
    - Add `@Controller('api/v1/cart')` decorator
    - Add `POST /merge` endpoint with @Roles('Customer') decorator
    - Extract userId from JWT token
    - Call CartMergeService to merge guest cart
    - Return merged cart response
    - _Requirements: 17.4_

- [x] 9. Checkpoint - Verify cart merge functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement frontend Public Storefront Shell
  - [x] 10.1 Create PublicLayout component
    - Create `frontend/src/components/layout/PublicLayout.tsx`
    - Create PublicNavbar with Logo, Search, Categories dropdown, Cart icon with badge, Login/Register buttons
    - Create PublicFooter with company info and links
    - Use Outlet for child routes
    - Apply responsive design with Tailwind CSS
    - _Requirements: 16.1, 16.2, 16.5_
  
  - [x] 10.2 Create CatalogPage component
    - Create `frontend/src/pages/public/Catalog.tsx`
    - Fetch products from `GET /api/v1/public/products` with query params
    - Display product grid with images, names, base prices
    - Implement category filter sidebar
    - Implement text search input
    - Implement sort dropdown (price low to high, high to low, name)
    - Implement pagination controls
    - Add click handler to navigate to Product Detail Page
    - Handle loading and error states
    - _Requirements: 16.1, 16.4_
  
  - [x] 10.3 Create ProductDetailPage component
    - Create `frontend/src/pages/public/ProductDetail.tsx`
    - Fetch product detail from `GET /api/v1/public/products/:id`
    - Display large primary image and thumbnails gallery
    - Display product name, description, and category
    - Display base price and bulk pricing tiers in a table
    - Add quantity input and "Add to Cart" button connecting to CartContext
    - Handle loading and error states
    - _Requirements: 16.2, 16.4, 17.2_
  
  - [x] 10.4 Create useGuestCart custom hook
    - Create `frontend/src/hooks/useGuestCart.ts`
    - Implement `addItem(productId, quantity)` method writing to localStorage
    - Implement `updateQuantity(productId, quantity)` method
    - Implement `removeItem(productId)` method
    - Implement `clearCart()` method
    - Calculate subtotal, tax, shipping, total automatically
    - Validate product data before adding
    - Handle localStorage quota exceeded errors
    - Provide `cart` state and `itemCount` computed value
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [x] 10.5 Create GuestCartPage component
    - Create `frontend/src/pages/public/Cart.tsx`
    - Use useGuestCart hook to get cart state
    - Display cart items list with images, names, quantities, prices
    - Add quantity adjustment (+/- buttons) for each item
    - Add remove item button for each item
    - Display subtotal, tax, shipping, total at bottom
    - Add "Continue Shopping" button redirecting to Catalog
    - Add "Checkout" button redirecting to Login/Register page
    - Preserve Guest_Cart in localStorage on checkout click
    - Handle empty cart state
    - _Requirements: 17.2, 17.3_
  
  - [x] 10.6 Create VerifyEmailPage component
    - Create `frontend/src/pages/public/VerifyEmail.tsx`
    - Extract token from URL params `:token`
    - Make API call to `GET /api/v1/auth/verify-email/:token` on mount
    - Display loading spinner during verification
    - Display success message with countdown and auto-redirect to login (5 seconds)
    - Display error message if token invalid/expired
    - Add "Resend Verification Email" button on error
    - Add "Go to Login" button
    - _Requirements: 18.2, 18.3_

- [x] 11. Update frontend routing for Public Storefront
  - [x] 11.1 Add public routes to router
    - Update `frontend/src/router.tsx`
    - Add public routes OUTSIDE ProtectedRoute: `/catalog`, `/products/:id`, `/cart`, `/register`, `/verify-email/:token`
    - Wrap public routes with PublicLayout component
    - Keep existing protected routes inside ProtectedRoute with AppLayout
    - Add redirect from `/` to `/catalog` for unauthenticated users, to Dashboard for authenticated users
    - _Requirements: 16.1, 16.2, 16.3, 16.5_
  
  - [x] 11.2 Create Register page component
    - Create `frontend/src/pages/public/Register.tsx`
    - Create registration form with email, password, confirm password, full name, phone (optional)
    - Implement password validation (min 8 chars, uppercase, lowercase, number)
    - Call `POST /api/v1/auth/register` on form submit
    - Display success message: "Registration successful. Please check your email to verify your account."
    - Add link to login page
    - Handle validation errors and API errors
    - _Requirements: 18.1_
  
  - [x] 11.3 Update Login page with cart merge
    - Update `frontend/src/pages/Login.tsx`
    - After successful login, check if Guest_Cart exists in localStorage
    - If Guest_Cart exists, call `POST /api/v1/cart/merge` with guest cart items
    - Clear Guest_Cart from localStorage after successful merge
    - Redirect to Dashboard or Checkout page based on context
    - Display success notification for cart merge
    - _Requirements: 17.4, 17.6_

- [x] 12. Checkpoint - Verify public storefront and cart functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement backend dashboard metrics infrastructure
  - [x] 13.1 Create base dashboard types and DTOs
    - Create `backend/src/dashboard/dto/dashboard-metrics-response.dto.ts`
    - Create `backend/src/dashboard/dto/widget.dto.ts`
    - Create `backend/src/dashboard/dto/update-widget-preference.dto.ts`
    - Define interfaces for DashboardMetrics, Widget, and WidgetPreference
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 13.2 Create dashboard controller with role-specific endpoint
    - Create or update `backend/src/dashboard/dashboard.controller.ts`
    - Add `GET /v1/dashboard/metrics/:role` endpoint with @Roles() decorator
    - Add `GET /v1/dashboard/preferences` endpoint
    - Add `PATCH /v1/dashboard/preferences` endpoint
    - Implement role validation and request handling
    - _Requirements: 2.2, 13.1, 13.3_
  
  - [x] 13.3 Implement GetOwnerMetricsUseCase
    - Create `backend/src/dashboard/use-cases/get-owner-metrics.usecase.ts`
    - Calculate total revenue from orders
    - Count orders created today
    - Count pending approvals (orders in Pending_Approval status)
    - Count low stock alerts (inventory below reorder point)
    - Count active production jobs (jobs in In_Progress status)
    - Count total customers
    - Return formatted widget data
    - _Requirements: 1.1_
  
  - [x] 13.4 Implement GetManagerMetricsUseCase
    - Create `backend/src/dashboard/use-cases/get-manager-metrics.usecase.ts`
    - Count orders created today
    - Count pending approvals
    - Calculate production status summary (queue, in progress, completed)
    - Count inventory alerts (low stock items)
    - Calculate team performance metrics
    - Return formatted widget data
    - _Requirements: 1.2_
  
  - [x] 13.5 Implement GetDesignerMetricsUseCase
    - Create `backend/src/dashboard/use-cases/get-designer-metrics.usecase.ts`
    - Count pending design reviews (design_files with Manual_Review status)
    - Count approved designs today
    - Count revision requests (design_files with Rejected status)
    - Count active design projects (orders in design stages)
    - Return formatted widget data
    - _Requirements: 1.3_
  
  - [x] 13.6 Implement GetProductionStaffMetricsUseCase
    - Create `backend/src/dashboard/use-cases/get-production-staff-metrics.usecase.ts`
    - Count jobs in queue (Pending status)
    - Count jobs in progress (In_Progress status, assigned to current user)
    - Count completed jobs today
    - Calculate machine availability
    - Calculate material requirements
    - Return formatted widget data
    - _Requirements: 1.4_
  
  - [x] 13.7 Implement GetWarehouseStaffMetricsUseCase
    - Create `backend/src/dashboard/use-cases/get-warehouse-staff-metrics.usecase.ts`
    - Count low stock items (current_stock <= reorder_point)
    - Count incoming materials (pending purchase orders)
    - Count outgoing shipments (shipments in transit)
    - Calculate total inventory value
    - Return formatted widget data
    - _Requirements: 1.5_
  
  - [x] 13.8 Implement GetFinanceStaffMetricsUseCase
    - Create `backend/src/dashboard/use-cases/get-finance-staff-metrics.usecase.ts`
    - Count pending invoices (status = Pending)
    - Sum payments received today
    - Count overdue invoices (due_date < today AND status != Paid)
    - Calculate revenue for current month
    - Return formatted widget data
    - _Requirements: 1.6_
  
  - [x] 13.9 Implement GetCustomerMetricsUseCase
    - Create `backend/src/dashboard/use-cases/get-customer-metrics.usecase.ts`
    - Count active orders (customer_id = current user, status in active states)
    - Generate order history summary
    - Calculate pending payments
    - List recent invoices
    - Return formatted widget data
    - _Requirements: 1.7_

- [ ] 14. Checkpoint - Verify backend metrics calculation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement frontend dashboard UI
  - [x] 15.1 Create MetricCard component
    - Create `frontend/src/components/MetricCard.tsx`
    - Accept props: title, value, change, icon, color, loading
    - Implement loading skeleton state
    - Display value with formatting (numbers, currency)
    - Display change percentage with up/down indicator
    - Apply color-coded styling (emerald, blue, amber, red, purple, indigo)
    - _Requirements: 1.1, 2.4_
  
  - [x] 15.2 Refactor Dashboard component with role-based rendering
    - Update `frontend/src/pages/Dashboard.tsx`
    - Use RoleContext to get current user role
    - Fetch role-specific metrics from `GET /v1/dashboard/metrics/:role`
    - Implement loading state with skeleton cards
    - Render MetricCard components for each widget
    - Display appropriate widgets based on user role using ROLE_WIDGETS configuration
    - Handle API errors with cached data fallback
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 15.3 Implement dashboard customization modal
    - Create `frontend/src/components/DashboardCustomization.tsx`
    - Add "Customize Dashboard" button to Dashboard page
    - Display modal with checkboxes for available widgets
    - Fetch current preferences from `GET /v1/dashboard/preferences`
    - Allow enabling/disabling widgets with checkboxes
    - Save preferences to `PATCH /v1/dashboard/preferences`
    - Show success/error feedback
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 15.4 Add responsive dashboard layout
    - Update Dashboard.tsx with responsive grid layout
    - Use Tailwind CSS grid classes for desktop (3 columns)
    - Stack widgets vertically on mobile (< 768px viewport)
    - Ensure MetricCard components are mobile-friendly
    - Test on various viewport sizes
    - _Requirements: 14.1, 14.2, 14.4_

- [ ] 16. Checkpoint - Verify dashboard functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Add Role Seeding to Prisma Seeder
  - [x] 6.1 Update `backend/prisma/seed.ts` to include standard roles
    - Owner, Manager, Sales, Designer, Production, Warehouse, Finance, Customer
  - [x] 6.2 Execute seed script
  - [x] 6.3 Test user authentication with newly seeded roles

- [x] 17. Implement role-filtered Orders page
  - [x] 17.1 Create OrdersTable component with role-based columns
    - Create `frontend/src/components/tables/OrdersTable.tsx`
    - Accept props: orders array, userRole, loading
    - Define column configurations for each role (Owner, Manager, Designer, Production_Staff, Finance_Staff)
    - Implement conditional column rendering based on userRole
    - Add role-specific action buttons (edit, delete, view details)
    - Add loading skeleton for table rows
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.1, 11.2_
  
  - [x] 17.2 Update Orders page with role filtering
    - Update `frontend/src/pages/Orders.tsx`
    - Use RoleContext to get current user role
    - Redirect Customer role to My Orders page
    - Fetch orders from `GET /api/v1/orders` with role context
    - Pass role to OrdersTable component
    - Implement pagination and filtering
    - Handle empty states and errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 17.3 Enhance backend Orders controller with role filtering
    - Update `backend/src/orders/orders.controller.ts`
    - Modify `GET /api/v1/orders` endpoint to filter by user role
    - For Designer: return only orders in design stages (Draft, Pending_Approval, Design_In_Progress)
    - For Production_Staff: return only orders in production stages (Approved, In_Production, Quality_Check)
    - For Finance_Staff: return all orders with payment/invoice details
    - For Owner/Manager: return all orders
    - Add role-specific field selection in query
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 18. Implement My Orders page for customers
  - [x] 18.1 Create My Orders page component
    - Create `frontend/src/pages/MyOrders.tsx`
    - Fetch customer orders from `GET /api/v1/orders`
    - Display orders in card layout on mobile, table on desktop
    - Show order number, status, total amount, estimated delivery, creation date
    - Add "View Details" and "Download Invoice" action buttons
    - Implement pagination
    - _Requirements: 9.1, 9.2, 14.3_
  
  - [x] 18.2 Create order details modal for customers
    - Create `frontend/src/components/OrderDetailsModal.tsx`
    - Fetch order details from `GET /api/v1/orders/:id`
    - Display order timeline, items, and total amount
    - Add "Download Invoice" action if order is paid
    - Display order items with product name, quantity, unit price, subtotal
    - Display order timeline with status updates
    - Display design file previews with thumbnails
    - Show customer-appropriate information only
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 18.3 Implement backend `CustomerOrdersController`
    - Create `backend/src/orders/customer-orders.controller.ts`
    - Implement `GET /api/v1/my-orders` and `GET /api/v1/my-orders/:id` with ownership validation
    - Implement `GET /api/v1/my-orders/:id/invoice` for download
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 19. Verify orders and my-orders functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Implement role-filtered Production page
  - [x] 20.1 Create ProductionTable component
    - Create `frontend/src/components/tables/ProductionTable.tsx`
    - Display columns: job ID, order ID, product, quantity, status, deadline, assigned machine
    - Add role-specific action buttons (start job, complete job, report issue)
    - Hide delete and reassign buttons for Production_Staff
    - _Requirements: 4.1, 4.2, 4.3, 11.2_
  
  - [x] 20.2 Update Production page with role filtering
    - Update `frontend/src/pages/Production.tsx`
    - Use ProtectedRoute with allowedRoles: Owner, Manager, Production_Staff
    - Fetch production jobs from `GET /api/v1/production`
    - Display appropriate action buttons based on role
    - Handle unauthorized access attempts
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [x] 20.3 Enhance backend Production controller with role filtering
    - Update `backend/src/production/production.controller.ts`
    - Modify `GET /api/v1/production/jobs` endpoint
    - For Production_Staff: return only jobs assigned to current user OR unassigned jobs
    - For Owner/Manager: return all production jobs
    - Add @Roles('Owner', 'Manager', 'Production_Staff') decorator
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 21. Implement role-filtered Design Files page
  - [x] 21.1 Create DesignFilesTable component
    - Create `frontend/src/components/tables/DesignFilesTable.tsx`
    - Display columns: thumbnail, order number, status, uploaded date
    - Add role-specific action buttons (approve, reject, request revision)
    - Implement image preview on thumbnail click
    - Hide delete button for Designer role
    - _Requirements: 5.1, 5.2, 11.2_
  
  - [x] 21.2 Update Design Files page with role filtering
    - Update `frontend/src/pages/DesignFiles.tsx`
    - Use ProtectedRoute with allowedRoles: Owner, Manager, Designer
    - Fetch design files from `GET /api/v1/design-files`
    - Display role-filtered design files
    - Handle unauthorized access attempts
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [x] 21.3 Enhance backend Design Files controller with role filtering
    - Update `backend/src/orders/design-files.controller.ts`
    - Modify `GET /api/v1/design-files` endpoint
    - For Designer: return only files with Manual_Review status
    - For Owner/Manager: return all design files with additional fields
    - Add approval endpoint `PATCH /api/v1/design-files/:id/approve`
    - Implement notification sending on approval
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 22. Checkpoint - Verify production and design files functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Implement role-filtered Warehouse page
  - [x] 23.1 Create WarehouseTable component
    - Create `frontend/src/components/tables/WarehouseTable.tsx`
    - Display columns: product name, SKU, current stock, reorder point, unit of measure
    - Highlight low stock items in red
    - Add role-specific action buttons (adjust stock, record shipment)
    - Hide delete and create product buttons for Warehouse_Staff
    - _Requirements: 6.1, 6.2, 6.3, 11.4_
  
  - [x] 23.2 Update Warehouse page with role filtering
    - Update `frontend/src/pages/Warehouse.tsx`
    - Use ProtectedRoute with allowedRoles: Owner, Manager, Warehouse_Staff
    - Fetch inventory from `GET /api/v1/inventory`
    - Display appropriate action buttons based on role
    - Handle unauthorized access attempts
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [x] 23.3 Enhance backend Inventory controller with role filtering
    - Update `backend/src/inventory/inventory.controller.ts`
    - Modify `GET /api/v1/inventory` endpoint
    - For Warehouse_Staff: return stock management fields only
    - For Owner/Manager: return all fields including supplier info
    - Add @Roles('Owner', 'Manager', 'Warehouse_Staff') decorator
    - _Requirements: 6.1, 6.2_

- [x] 24. Implement role-filtered Customers page
  - [x] 24.1 Create CustomersTable component
    - Create `frontend/src/components/tables/CustomersTable.tsx`
    - Display columns: company name, email, phone, loyalty tier, total revenue
    - Add payment history and outstanding balance columns for Finance_Staff
    - Add role-specific action buttons
    - _Requirements: 7.1, 7.2_
  
  - [x] 24.2 Update Customers page with role filtering
    - Update `frontend/src/pages/Customers.tsx`
    - Use ProtectedRoute with allowedRoles: Owner, Manager, Finance_Staff
    - Fetch customers from `GET /api/v1/customers`
    - Display role-specific columns
    - Handle unauthorized access attempts
    - _Requirements: 7.1, 7.3_
  
  - [x] 24.3 Enhance backend Customers controller with role filtering
    - Update `backend/src/customers/customers.controller.ts`
    - Modify `GET /api/v1/customers` endpoint
    - For Finance_Staff: include payment history and outstanding balance
    - For Owner/Manager: include all fields
    - Add @Roles('Owner', 'Manager', 'Finance_Staff') decorator
    - _Requirements: 7.1, 7.2_

- [x] 25. Implement role-filtered Invoices page
  - [x] 25.1 Create InvoicesTable component
    - Create `frontend/src/components/tables/InvoicesTable.tsx`
    - Display columns: invoice number, customer name, order number, amount, status, due date
    - Add payment action buttons for Finance_Staff (record payment, send reminder)
    - Hide delete button for non-Owner roles
    - For Customer role: display simplified view with download button only
    - _Requirements: 8.1, 8.2, 11.5_
  
  - [x] 25.2 Update Invoices page with role filtering
    - Update `frontend/src/pages/Invoices.tsx`
    - Use ProtectedRoute with allowedRoles: Owner, Manager, Finance_Staff, Customer
    - Fetch invoices from `GET /api/v1/invoices`
    - Display role-appropriate columns and actions
    - Handle unauthorized access attempts
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 25.3 Enhance backend Invoices controller with role filtering
    - Update `backend/src/invoices/invoices.controller.ts`
    - Modify `GET /api/v1/invoices` endpoint
    - For Customer: return only invoices for that customer_id
    - For Finance_Staff/Owner/Manager: return all invoices
    - Add payment endpoint `POST /api/v1/invoices/:id/payment` with @Roles('Finance_Staff', 'Owner', 'Manager')
    - Implement notification sending on payment recorded
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 26. Checkpoint - Verify all role-specific pages
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 27. Implement responsive table layouts
  - [ ] 27.1 Add mobile card layout for all table components
    - Update OrdersTable, ProductionTable, DesignFilesTable, WarehouseTable, CustomersTable, InvoicesTable
    - Add conditional rendering: table on desktop (>= 768px), cards on mobile (< 768px)
    - Ensure all data fields are visible in card layout
    - Maintain action buttons in mobile view
    - Test on various mobile devices
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 28. Implement role context synchronization
  - [ ] 28.1 Add role context refresh mechanism
    - Update RoleContext.tsx to add polling for role changes
    - Implement `refreshRole()` method that fetches current user from backend
    - Update local storage with latest role information
    - Trigger re-render when role changes
    - _Requirements: 15.1, 15.2_
  
  - [ ] 28.2 Add role switching for multi-role users
    - Add role switcher dropdown in Header component
    - Fetch associated roles from `GET /api/v1/users/me/roles`
    - Allow switching between Customer and Staff roles
    - Update Role_Context and refresh all role-dependent UI
    - Store selected role in local storage
    - _Requirements: 15.4_
  
  - [ ] 28.3 Add session validation and role expiration handling
    - Implement token expiration check in RoleContext
    - Redirect to login when token expires or role becomes invalid
    - Show session expired message to user
    - Clear local storage on logout or invalid session
    - _Requirements: 15.3_

- [ ] 29. Final checkpoint and integration testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- This implementation plan focuses on **coding tasks only** - no deployment, user acceptance testing, or business process tasks
- **New database tables required**: `email_verification_tokens`, `cart`, `cart_items` - migrations are included in tasks
- **Existing database tables** (users, roles, widget_preferences) already exist - no additional migrations needed for role-based pages
- The existing `RolesGuard` in the backend **already supports** role-based authorization and requires no changes
- TypeScript is used throughout both frontend (React) and backend (NestJS)
- Each task builds incrementally on previous tasks, with checkpoints to validate progress
- Tasks reference specific requirement clause numbers for traceability
- **Two-shell architecture**: Public Storefront Shell (unauthenticated) + Authenticated App Shell (role-based)
- Role-specific filtering happens on the backend to ensure security
- Frontend uses React Context for role management and custom hooks for access control
- **Guest cart** stored in localStorage only until user registers/logs in
- **Email verification** required before checkout completion for customers
- **Cart merge** automatically combines guest cart with user cart after login
- All endpoints use existing JWT authentication and role guards
- Responsive design ensures all functionality works on mobile and desktop
- The sidebar navigation filtering is **already partially implemented** and will be enhanced
- **Public routes** (catalog, product detail, cart, register, verify email) are outside the Protected Route Guard
- **Email service** integration required for verification emails (SMTP or email provider)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "13.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "3.2", "5.1", "7.1", "8.1", "13.2"] },
    { "id": 2, "tasks": ["1.4", "3.3", "3.4", "5.2", "5.4", "7.2", "8.2", "10.1", "13.3", "13.4", "13.5", "13.6", "13.7", "13.8", "13.9"] },
    { "id": 3, "tasks": ["5.3", "7.3", "8.3", "10.2", "10.4", "15.1"] },
    { "id": 4, "tasks": ["10.3", "10.5", "10.6", "15.2", "15.3", "15.4"] },
    { "id": 5, "tasks": ["11.1", "11.2", "17.1", "18.1", "20.1", "21.1", "23.1", "24.1", "25.1"] },
    { "id": 6, "tasks": ["11.3", "17.2", "17.3", "18.2", "18.3", "20.2", "20.3", "21.2", "21.3", "23.2", "23.3", "24.2", "24.3", "25.2", "25.3"] },
    { "id": 7, "tasks": ["27.1", "28.1", "28.2"] },
    { "id": 8, "tasks": ["28.3"] }
  ]
}
```

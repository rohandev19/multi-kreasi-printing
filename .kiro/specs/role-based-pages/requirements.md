# Requirements Document

## Introduction

This document specifies the requirements for implementing role-specific pages and dashboards in the Multi Kreasi Printing platform. Currently, the system has a generic Dashboard page that displays the same information for all user roles. This feature will create tailored page experiences for each of the seven system roles (Owner, Manager, Designer, Production_Staff, Warehouse_Staff, Finance_Staff, and Customer), ensuring that each role sees relevant information and has access to appropriate actions based on their responsibilities.

Additionally, this document specifies requirements for a public storefront that allows unauthenticated visitors to browse products, manage a guest cart, and register with email verification before completing checkout.

## Glossary

- **System**: The Multi Kreasi Printing web application frontend
- **User**: An authenticated person using the system
- **Role**: A defined set of permissions and access rights assigned to a User (Owner, Manager, Designer, Production_Staff, Warehouse_Staff, Finance_Staff, or Customer)
- **Dashboard**: The main landing page displayed after login that shows role-specific metrics and quick actions
- **Widget**: A discrete UI component on the Dashboard that displays specific metrics or information
- **Orders_Page**: The page displaying order listings and management interface
- **Production_Page**: The page displaying production jobs and manufacturing queue
- **Design_Files_Page**: The page for managing design assets and file approvals
- **Warehouse_Page**: The page for inventory and material stock management
- **Customers_Page**: The page for managing customer information and relationships
- **Invoices_Page**: The page for financial transactions and invoice management
- **My_Orders_Page**: The customer-facing page for viewing personal order history
- **Metric_Card**: A visual component displaying a single key performance indicator
- **Access_Control**: The mechanism that determines which pages and actions a User can access based on their Role
- **Role_Context**: The stored User Role information retrieved from local storage
- **Visitor**: An unauthenticated person browsing the system without an account or active session
- **Catalog_Page**: The public, unauthenticated page displaying browsable products
- **Product_Detail_Page**: The public, unauthenticated page displaying full specifications for a single product
- **Guest_Cart**: A cart stored in browser local storage for an unauthenticated Visitor, not yet persisted to the backend
- **Cart_Page**: The page displaying cart contents, accessible to both Visitor (Guest_Cart) and authenticated User (persisted cart)
- **Verification_Link**: A unique, time-limited URL sent to a User's email to confirm address ownership

## Requirements

### Requirement 1: Role-Based Dashboard Display

**User Story:** As a system user, I want to see a dashboard customized for my role, so that I can quickly access the most relevant information for my work.

#### Acceptance Criteria

1. WHEN a User with Role "Owner" accesses the Dashboard, THE System SHALL display Metric_Cards for total revenue, orders today, pending approvals, low stock alerts, active production jobs, and customer count
2. WHEN a User with Role "Manager" accesses the Dashboard, THE System SHALL display Metric_Cards for orders today, pending approvals, production status, inventory alerts, and team performance
3. WHEN a User with Role "Designer" accesses the Dashboard, THE System SHALL display Metric_Cards for pending design reviews, approved designs today, revision requests, and active design projects
4. WHEN a User with Role "Production_Staff" accesses the Dashboard, THE System SHALL display Metric_Cards for jobs in queue, jobs in progress, completed jobs today, machine availability, and material requirements
5. WHEN a User with Role "Warehouse_Staff" accesses the Dashboard, THE System SHALL display Metric_Cards for low stock items, incoming materials, outgoing shipments, and inventory value
6. WHEN a User with Role "Finance_Staff" accesses the Dashboard, THE System SHALL display Metric_Cards for pending invoices, payments received today, overdue invoices, and revenue this month
7. WHEN a User with Role "Customer" accesses the Dashboard, THE System SHALL display Metric_Cards for active orders, order history summary, pending payments, and recent invoices

### Requirement 2: Dashboard Data Retrieval

**User Story:** As a system user, I want my dashboard to display real-time data, so that I can make informed decisions based on current information.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE System SHALL retrieve the Role_Context from local storage within 100 milliseconds
2. WHEN the Role_Context is retrieved, THE System SHALL make an API request to the backend endpoint specific to the User Role
3. WHEN the API request is in progress, THE System SHALL display a loading spinner on each Metric_Card
4. IF the API request fails, THEN THE System SHALL display cached data with a warning message indicating the data may be stale
5. WHEN the API request succeeds, THE System SHALL update all Metric_Cards with the retrieved data within 500 milliseconds

### Requirement 3: Orders Page Role-Specific Views

**User Story:** As a user viewing orders, I want to see only the order information relevant to my role, so that I can focus on my responsibilities.

**Note:** This requirement applies only within the Authenticated App Shell. It does not govern Catalog_Page or Product_Detail_Page, which exist outside the Protected Route Guard per Requirement 16.

#### Acceptance Criteria

1. WHEN a User with Role "Owner" or "Manager" accesses the Orders_Page, THE System SHALL display all orders with columns for order number, customer, status, total amount, date, and action buttons
2. WHEN a User with Role "Designer" accesses the Orders_Page, THE System SHALL display only orders requiring design work with columns for order number, customer, design status, deadline, and design action buttons
3. WHEN a User with Role "Production_Staff" accesses the Orders_Page, THE System SHALL display only orders in production stages with columns for order number, job number, production status, priority, and production action buttons
4. WHEN a User with Role "Finance_Staff" accesses the Orders_Page, THE System SHALL display all orders with columns for order number, customer, payment status, invoice status, total amount, and payment action buttons
5. WHEN a User with Role "Customer" accesses the Orders_Page within the Authenticated App Shell, THE System SHALL redirect to My_Orders_Page

### Requirement 4: Production Page Access Control

**User Story:** As a production user, I want dedicated production management tools, so that I can efficiently manage manufacturing workflows.

#### Acceptance Criteria

1. WHEN a User with Role "Owner", "Manager", or "Production_Staff" accesses the Production_Page, THE System SHALL display the production job queue with filtering and sorting controls
2. WHEN a User with Role "Production_Staff" views the Production_Page, THE System SHALL display only jobs assigned to that specific User or unassigned jobs
3. WHEN a User with Role "Owner" or "Manager" views the Production_Page, THE System SHALL display all production jobs across all staff members
4. IF a User with Role "Designer", "Warehouse_Staff", "Finance_Staff", or "Customer" attempts to access the Production_Page, THEN THE System SHALL redirect to the Dashboard with an access denied message

### Requirement 5: Design Files Page Role-Specific Functions

**User Story:** As a design team member, I want tools specific to my design workflow, so that I can efficiently review and approve design files.

#### Acceptance Criteria

1. WHEN a User with Role "Designer" accesses the Design_Files_Page, THE System SHALL display pending design reviews with preview thumbnails, approval buttons, and revision request forms
2. WHEN a User with Role "Owner" or "Manager" accesses the Design_Files_Page, THE System SHALL display all design files with status indicators, designer assignments, and override approval controls
3. WHEN a User with Role "Designer" approves a design file, THE System SHALL update the design status and send a notification to relevant stakeholders within 2 seconds
4. IF a User with any other Role attempts to access the Design_Files_Page, THEN THE System SHALL redirect to the Dashboard with an access denied message

### Requirement 6: Warehouse Page Inventory Management

**User Story:** As a warehouse staff member, I want inventory-focused tools, so that I can efficiently manage stock and materials.

#### Acceptance Criteria

1. WHEN a User with Role "Warehouse_Staff" accesses the Warehouse_Page, THE System SHALL display inventory items with stock levels, reorder points, and stock adjustment controls
2. WHEN a User with Role "Owner" or "Manager" accesses the Warehouse_Page, THE System SHALL display all inventory items with additional supplier information and purchase order creation controls
3. WHEN a stock level falls below the reorder point, THE System SHALL highlight the inventory item in red on the Warehouse_Page
4. IF a User with Role "Designer", "Production_Staff", "Finance_Staff", or "Customer" attempts to access the Warehouse_Page, THEN THE System SHALL redirect to the Dashboard with an access denied message

### Requirement 7: Customers Page Access Restrictions

**User Story:** As a staff member managing customer relationships, I want access to customer information, so that I can provide excellent service.

#### Acceptance Criteria

1. WHEN a User with Role "Owner", "Manager", or "Finance_Staff" accesses the Customers_Page, THE System SHALL display the customer list with company names, contact information, loyalty tiers, and total revenue
2. WHEN a User with Role "Finance_Staff" views the Customers_Page, THE System SHALL display payment history and outstanding balances for each customer
3. IF a User with Role "Designer", "Production_Staff", "Warehouse_Staff", or "Customer" attempts to access the Customers_Page, THEN THE System SHALL redirect to the Dashboard with an access denied message

### Requirement 8: Invoices Page Role-Specific Data

**User Story:** As a user managing finances, I want to see invoice information relevant to my role, so that I can track payments and billing.

#### Acceptance Criteria

1. WHEN a User with Role "Owner", "Manager", or "Finance_Staff" accesses the Invoices_Page, THE System SHALL display all invoices with columns for invoice number, customer, order number, amount, status, due date, and payment action buttons
2. WHEN a User with Role "Customer" accesses the Invoices_Page, THE System SHALL display only invoices associated with that Customer User with columns for invoice number, order number, amount, status, due date, and download button
3. WHEN a User with Role "Finance_Staff" marks an invoice as paid on the Invoices_Page, THE System SHALL update the invoice status and send a payment confirmation notification within 2 seconds
4. IF a User with Role "Designer", "Production_Staff", or "Warehouse_Staff" attempts to access the Invoices_Page, THEN THE System SHALL redirect to the Dashboard with an access denied message

### Requirement 9: My Orders Page Customer Experience

**User Story:** As a customer, I want a simple interface to view my order history, so that I can track my orders and access invoices.

#### Acceptance Criteria

1. WHEN a User with Role "Customer" accesses the My_Orders_Page, THE System SHALL display only orders created by or associated with that Customer User
2. THE System SHALL display orders on My_Orders_Page with order number, status, total amount, estimated delivery date, and action buttons for viewing details and downloading invoices
3. WHEN a User with Role "Customer" clicks "View Details" on an order, THE System SHALL display order items, timeline, and design file previews
4. IF a User with any Role other than "Customer" attempts to access the My_Orders_Page, THEN THE System SHALL redirect to the Orders_Page

### Requirement 10: Navigation Menu Role Filtering

**User Story:** As a user, I want to see only navigation menu items I have access to, so that I am not confused by inaccessible pages.

#### Acceptance Criteria

1. WHEN the System renders the navigation sidebar, THE System SHALL retrieve the Role_Context from local storage
2. WHEN the Role_Context indicates "Owner", THE System SHALL display navigation items for Dashboard, Orders, Production, Design Files, Warehouse, Customers, and Invoices
3. WHEN the Role_Context indicates "Manager", THE System SHALL display navigation items for Dashboard, Orders, Production, Design Files, Warehouse, Customers, and Invoices
4. WHEN the Role_Context indicates "Designer", THE System SHALL display navigation items for Dashboard, Orders, and Design Files
5. WHEN the Role_Context indicates "Production_Staff", THE System SHALL display navigation items for Dashboard, Orders, and Production
6. WHEN the Role_Context indicates "Warehouse_Staff", THE System SHALL display navigation items for Dashboard and Warehouse
7. WHEN the Role_Context indicates "Finance_Staff", THE System SHALL display navigation items for Dashboard, Orders, Customers, and Invoices
8. WHEN the Role_Context indicates "Customer", THE System SHALL display navigation items for Dashboard, My Orders, and Invoices

### Requirement 11: Role-Based Action Button Display

**User Story:** As a user, I want to see only action buttons appropriate for my role, so that I can perform authorized actions efficiently.

#### Acceptance Criteria

1. WHEN a User with Role "Owner" or "Manager" views any page, THE System SHALL display all available action buttons including create, edit, delete, and approve buttons
2. WHEN a User with Role "Designer" views the Design_Files_Page, THE System SHALL display approve, reject, and request revision buttons but SHALL NOT display delete buttons
3. WHEN a User with Role "Production_Staff" views the Production_Page, THE System SHALL display start job, complete job, and report issue buttons but SHALL NOT display delete or reassign buttons
4. WHEN a User with Role "Warehouse_Staff" views the Warehouse_Page, THE System SHALL display adjust stock and record shipment buttons but SHALL NOT display delete or create product buttons
5. WHEN a User with Role "Finance_Staff" views the Invoices_Page, THE System SHALL display record payment and send reminder buttons but SHALL NOT display delete invoice buttons
6. WHEN a User with Role "Customer" views the My_Orders_Page, THE System SHALL display view details and download invoice buttons but SHALL NOT display edit or cancel order buttons

### Requirement 12: Unauthorized Access Handling

**User Story:** As a system administrator, I want unauthorized access attempts to be handled gracefully, so that users understand their access limitations.

#### Acceptance Criteria

1. WHEN a User attempts to access a page not permitted for their Role, THE System SHALL prevent navigation to that page
2. IF a User navigates directly to a URL for an unauthorized page, THEN THE System SHALL redirect to the Dashboard within 200 milliseconds
3. WHEN the System redirects due to unauthorized access, THE System SHALL display a notification message stating "You do not have permission to access this page"
4. THE System SHALL log unauthorized access attempts to the browser console with the User Role and attempted page path

### Requirement 13: Dashboard Widget Customization

**User Story:** As a user, I want to customize which widgets appear on my dashboard, so that I can focus on the metrics most important to me.

#### Acceptance Criteria

1. WHEN a User accesses the Dashboard, THE System SHALL load widget preferences from the backend based on User ID
2. WHEN a User clicks a "Customize Dashboard" button, THE System SHALL display a modal with checkboxes for each available Widget for their Role
3. WHEN a User enables or disables a Widget, THE System SHALL save the preference to the backend within 1 second
4. WHEN a User refreshes the Dashboard, THE System SHALL display only the enabled Widgets in the saved layout order
5. WHERE widget customization is not yet configured for a User, THE System SHALL display a default set of Widgets based on the User Role

### Requirement 14: Responsive Role-Based Layouts

**User Story:** As a user on a mobile device, I want role-specific pages to be responsive, so that I can work efficiently on any device.

#### Acceptance Criteria

1. WHEN a User accesses any role-specific page on a viewport width below 768 pixels, THE System SHALL display content in a single-column layout
2. WHEN a User accesses the Dashboard on a mobile device, THE System SHALL stack Metric_Cards vertically with full width
3. WHEN a User accesses table-based pages on a mobile device, THE System SHALL display data in card format instead of table format
4. THE System SHALL maintain all role-specific functionality and Access_Control rules on mobile layouts

### Requirement 15: Role Context Synchronization

**User Story:** As a user, I want my role information to stay synchronized, so that the interface remains consistent with my permissions.

**Security Note:** The Role_Context in local storage is used solely for UI display purposes within the Authenticated App Shell. Backend authorization is independently verified through JWT tokens and Roles Guard on every request. Local storage is not a source of actual authorization.

#### Acceptance Criteria

1. WHEN a User logs in, THE System SHALL store the Role_Context in local storage
2. WHEN the Role_Context is updated on the backend, THE System SHALL refresh the Role_Context in local storage within 5 seconds
3. IF the Role_Context in local storage becomes invalid or missing, THEN THE System SHALL redirect the User to the login page
4. WHEN a User with Role_Context "Customer" is also associated with a staff User account, THE System SHALL allow role switching through a dropdown menu in the header

### Requirement 16: Public Product Catalog Access

**User Story:** As a visitor, I want to browse the product catalog without creating an account, so that I can evaluate products before committing to registration.

#### Acceptance Criteria

1. WHEN an unauthenticated Visitor accesses the Catalog_Page, THE System SHALL display all active products with images, names, base pricing, and category without requiring login
2. WHEN an unauthenticated Visitor accesses a Product_Detail_Page, THE System SHALL display full product specifications, pricing tiers, and available customization options without requiring login
3. THE System SHALL implement Catalog_Page and Product_Detail_Page as routes outside the Protected Route Guard, so that the pages are crawlable by search engines
4. WHEN an unauthenticated Visitor searches or filters the Catalog_Page, THE System SHALL return results without requiring login
5. WHEN an unauthenticated Visitor accesses the Catalog_Page or Product_Detail_Page, THE System SHALL display a "Login" and "Register" call-to-action in the navigation, distinct from the sidebar navigation used in the authenticated App Shell

### Requirement 17: Guest Cart

**User Story:** As a visitor, I want to add products to a cart before logging in, so that I can decide what to order without committing to an account first.

#### Acceptance Criteria

1. WHEN an unauthenticated Visitor clicks "Add to Cart" on a Product_Detail_Page, THE System SHALL store the item in a Guest_Cart in browser local storage
2. WHEN an unauthenticated Visitor accesses the Cart_Page, THE System SHALL display all items in Guest_Cart with quantity adjustment and removal controls, without requiring login
3. WHEN an unauthenticated Visitor clicks "Checkout" on the Cart_Page, THE System SHALL redirect to the Login_Page or Register_Page while preserving the Guest_Cart contents
4. WHEN a Visitor successfully logs in or registers after being redirected from Checkout, THE System SHALL merge the Guest_Cart contents into the User's persisted cart, then proceed to Checkout
5. IF the User's persisted cart already contains an item with matching product configuration at merge time, THEN THE System SHALL combine quantities rather than create a duplicate entry
6. WHEN the Guest_Cart is successfully merged, THE System SHALL clear the Guest_Cart from local storage

### Requirement 18: Email Verification for Customer Registration

**User Story:** As a business owner, I want customer email addresses verified before an order can be completed, so that order notifications and invoices reach a real, reachable address.

#### Acceptance Criteria

1. WHEN a Visitor submits the Registration form, THE System SHALL create a User account with status "Unverified" and send an email containing a Verification_Link
2. WHEN a User clicks a valid, unexpired Verification_Link, THE System SHALL update the account status to "Verified" and display a confirmation message
3. IF a Verification_Link is expired or already used, THEN THE System SHALL display an error message and offer to resend a new verification email
4. THE System SHALL expire an unused Verification_Link after 24 hours
5. IF a User with status "Unverified" attempts to complete Checkout, THEN THE System SHALL block the action and display a message prompting email verification, with a resend option
6. WHERE a User with status "Unverified" logs in, THE System SHALL allow login and cart management but SHALL restrict Checkout completion until the account is Verified

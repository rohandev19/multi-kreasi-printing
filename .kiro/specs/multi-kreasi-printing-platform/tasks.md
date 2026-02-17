# Implementation Plan: Multi Kreasi Printing Enterprise Digital Platform

## Overview

This implementation plan breaks down the MVP scope into incremental, manageable tasks using TypeScript, NestJS for backend, and React for frontend. The architecture follows Clean Architecture principles with strict layer separation (Domain → Application → Infrastructure → Presentation). 

**CRITICAL STRATEGY:** Deploy infrastructure skeleton FIRST, then build features on a live, monitored foundation.

**Implementation Language:** TypeScript (NestJS backend + React frontend)

**Architecture Pattern:** Modular Monolith with Clean Architecture

**Key Technologies:**
- Backend: NestJS, Prisma ORM, PostgreSQL, Redis, BullMQ, Socket.IO
- Frontend: React 18+, TanStack Query, Zustand, React Hook Form + Zod, TailwindCSS, Vite
- Infrastructure: PM2 native process manager, Nginx reverse proxy, Cloudflare R2 (S3-compatible storage), GitHub Actions CI/CD
- Auth: Hand-rolled JWT + RBAC from scratch (NO third-party auth libraries)
- Redis: Memurai (Windows dev) / redis-server (Linux prod) - NO Docker
- Storage: Cloudflare R2 (cloud-managed, S3-compatible)

**Testing Strategy:**
- Unit tests for business logic and use cases
- Integration tests for API endpoints and database operations
- End-to-end tests for critical user workflows
- Test tasks are marked with `*` (optional) to allow faster MVP iteration

**Deployment Strategy:**
- **DEPLOY INFRASTRUCTURE FIRST**: Phase 0 sets up VPS with operational safety nets before any business features
- **Security Built-In**: Security checks integrated into each phase (not separate checklist)
- **No Containers**: Native deployment with PM2 + Nginx (no Docker)
- **Cloud Storage**: Cloudflare R2 for all file storage (S3-compatible, cloud-managed)
- **Redis**: Memurai Developer Edition (Windows dev) / redis-server native (Linux prod)

## Tasks

### Phase 0: Infrastructure Foundation and Operational Safety Nets

**PHILOSOPHY:** Deploy skeleton to VPS FIRST with health checks, backups, monitoring, and CI/CD. Build business features on top of a live, protected infrastructure.

- [ ] 0. Set up VPS infrastructure and operational safety nets
  - [ ] 0.1 Configure VPS security basics
    - Create non-root user with sudo privileges
    - Configure UFW firewall: allow SSH (22), HTTP (80), HTTPS (443), deny all others
    - Install and configure fail2ban for SSH brute-force protection
    - Set up SSH key authentication and disable password login
    - Configure automatic security updates (unattended-upgrades)
    - _Requirements: 28, 37, 38_

  - [ ] 0.2 Install production stack on VPS
    - Install PostgreSQL 15+ with secure configuration (peer authentication, password hash)
    - Install redis-server native (NOT Docker, NOT Memurai - production uses native redis-server on Linux)
    - Install Nginx with security headers (X-Frame-Options, X-Content-Type-Options, CSP)
    - Install PM2 globally for Node.js process management
    - Install Node.js 20.x LTS via nvm
    - Configure PostgreSQL with dedicated application user and database
    - Configure redis.conf: bind 127.0.0.1, maxmemory policy, requirepass
    - _Requirements: 28, 35, 38_

  - [ ] 0.3 Deploy skeleton NestJS + React to VPS
    - Create minimal NestJS app with health check endpoint (GET /health → 200 OK)
    - Create minimal React app with "Coming Soon" landing page
    - Build backend and frontend for production
    - Deploy backend using PM2 cluster mode (4 instances)
    - Configure Nginx reverse proxy for backend API (/api → localhost:3000)
    - Configure Nginx to serve React build as static files
    - Set up SSL certificate with Let's Encrypt (certbot)
    - Verify HTTPS working with automatic HTTP → HTTPS redirect
    - _Requirements: 28, 38, 42_

  - [ ] 0.4 Configure operational safety nets
    - Set up PostgreSQL automated backups with WAL-G or pg_dump (daily full backup, retain 7 days)
    - Create backup verification script (restore test to /tmp every week)
    - Configure PM2 startup script for automatic app restart on server reboot
    - Set up log rotation for Nginx, PM2, and application logs (rotate weekly, keep 4 weeks)
    - Create health check monitoring script (ping /health every 5 minutes, alert on failure)
    - Configure disk space monitoring (alert at 80% usage)
    - Set up basic uptime monitoring (external service like UptimeRobot or cron-based)
    - **Security:** Set up Sentry error tracking (free tier, 5,000 errors/month) for backend + frontend
      - Different from uptime monitoring: UptimeRobot detects "site down", Sentry identifies "which line of code caused the error"
      - Install SDK from Phase 0 start, not later when bugs are hard to trace
    - **Security:** Store backup encryption keys SEPARATELY from VPS that stores the backup itself (use personal password manager, not config file on same server)
    - _Requirements: 28, 47, 48_

  - [ ] 0.5 Configure CI/CD pipeline with GitHub Actions
    - Create GitHub Actions workflow for automated testing on push
    - Configure automated deployment to VPS on merge to main branch
    - Set up SSH key authentication for GitHub Actions → VPS deployment
    - Implement deployment script: git pull → npm install → build → PM2 reload (zero-downtime)
    - Add deployment notifications (success/failure) via webhook or email
    - Create rollback script for quick recovery (PM2 revert + git reset)
    - _Requirements: 28, 42_

  - [ ] 0.6 Configure Cloudflare R2 storage
    - Create Cloudflare R2 bucket via Cloudflare dashboard
    - Generate R2 API tokens with read/write permissions
    - Store R2 credentials in environment variables (.env file, secured with 0600 permissions)
    - Test R2 connectivity using AWS SDK for JavaScript v3 with sample file upload/download
    - Configure CORS policy for frontend access if needed
    - _Requirements: 36_

- [ ] 1. Checkpoint - Verify infrastructure deployment
  - Verify VPS accessible via HTTPS with valid SSL certificate
  - Test health check endpoint returning 200 OK
  - Test automated backup running and verification working
  - Test PM2 auto-restart on process crash
  - Test GitHub Actions deployment pipeline
  - Verify Cloudflare R2 connectivity and file operations
  - Ensure all tests pass, ask the user if questions arise

### Phase 1: Project Foundation and Local Development Setup

- [ ] 2. Initialize local development environment
  - [ ] 2.1 Set up monorepo structure with NestJS backend and React frontend
    - Create root package.json with workspace configuration
    - Initialize backend with NestJS CLI in `backend/` directory
    - Initialize frontend with Vite + React + TypeScript in `frontend/` directory
    - Configure TypeScript strict mode for both projects
    - Set up ESLint and Prettier with shared configuration
    - Create `.nvmrc` for Node.js version pinning (v20.x)
    - **Security:** Install `gitleaks` as pre-commit hook (husky) BEFORE first commit — prevent `.env`/API keys from being committed accidentally
    - **Security:** Ensure `.env` is in `.gitignore` BEFORE `git init`
    - **Security:** Confirm Prisma version **7+** in `package.json` (Rust-free, much smaller bundle than older versions)
    - **Testing:** Use **Vitest** for all unit/integration tests in backend and frontend (not Jest) — NestJS 11+ defaults to Vitest, faster execution
    - _Requirements: 28, 42_

  - [ ] 2.2 Configure database and ORM
    - Install and configure Prisma ORM in backend
    - Create initial Prisma schema with User and Role tables
    - Set up PostgreSQL connection configuration using environment variables (separate dev/prod configs)
    - Create database migration scripts directory structure
    - Configure Prisma Client generation in build process
    - _Requirements: 28, 35_

  - [ ] 2.3 Set up Redis and caching infrastructure for development
    - Install Memurai Developer Edition on Windows for local development (Redis-compatible)
    - Install Redis client library (ioredis) in backend
    - Create CacheService with Redis connection management (support both Memurai dev and redis-server prod)
    - Implement cache methods: get, set, delete, invalidate pattern
    - Configure cache TTL strategy and key naming conventions
    - Create health check endpoint for Redis connection
    - _Requirements: 35, 47_

  - [ ]* 2.4 Write unit tests for CacheService
    - Test cache get/set/delete operations
    - Test TTL expiration behavior
    - Test connection error handling
    - _Requirements: 35_

- [ ] 3. Checkpoint - Verify local development setup
  - Ensure all dependencies installed successfully
  - Verify database connection working (local PostgreSQL)
  - Verify Redis connection working (Memurai Developer Edition on Windows)
  - Run initial tests and build process
  - Deploy updated skeleton to VPS via CI/CD
  - Ask the user if questions arise

### Phase 2: Authentication and Authorization System (Hand-Rolled JWT + RBAC)

**SECURITY BUILT-IN:** This phase implements security from scratch with rate limiting, token management, and audit logging.

- [ ] 4. Implement core authentication module (NO third-party auth libraries)
  - [ ] 4.1 Create Role and User domain entities
    - Define Role entity with permissions JSONB field
    - Define User entity with role relationship
    - Implement password hashing using bcrypt (minimum 10 salt rounds for security)
    - Create domain events: UserCreatedEvent, UserLoggedInEvent, UserLoggedOutEvent
    - _Requirements: 1, 2, 37_

  - [ ] 4.2 Create database schema and migrations for auth
    - Create Prisma schema for roles table with seed data (7 roles: Owner, Manager, Designer, Production_Staff, Warehouse_Staff, Finance_Staff, Customer)
    - Create Prisma schema for users table with indexes on email, role_id, status
    - Generate and run migration for auth tables
    - Create seed script to populate default roles with permissions
    - _Requirements: 1, 2_

  - [ ] 4.3 Implement JWT authentication from scratch (hand-rolled)
    - Install jsonwebtoken library for signing/verifying JWT tokens
    - Implement JWT signing function: generate access token (24-hour validity) with payload (userId, email, role)
    - Implement JWT verification function: validate signature, expiration, and payload structure
    - Implement refresh token generation: create 7-day refresh token stored in Redis
    - Create LoginUseCase: validate credentials, hash password comparison, generate tokens
    - Create RefreshTokenUseCase: validate refresh token from Redis, generate new access token
    - Create LogoutUseCase: invalidate refresh token in Redis
    - **Security:** Use strong JWT secret (minimum 32 characters, stored in environment variable)
    - **Security:** Implement rate limiting for login attempts (5 attempts per 15 minutes per IP)
    - **Security:** Send refresh token via **httpOnly cookie** (`Secure`, `SameSite=Strict`), NOT in response body JSON
    - **Security:** Access token sent in response body (used as Bearer token), but frontend stores in **memory** (React state), NOT in `localStorage`
    - **Security Note:** Consider reducing access token lifetime from 24 hours to 15-30 minutes once refresh token is secured in cookie
    - _Requirements: 1, 37_

  - [ ] 4.4 Implement RBAC (Role-Based Access Control) from scratch
    - Create JwtAuthGuard: extract and verify JWT token from Authorization header
    - Create RolesGuard: check user permissions from role's JSONB permissions field
    - Implement @Roles() decorator for controller methods requiring specific permissions
    - Create @Public() decorator for endpoints that bypass authentication
    - Implement permission validation logic: parse JSONB permissions, match against required permission
    - Return HTTP 403 Forbidden when user lacks required permission
    - **Security:** Validate JWT signature before trusting any claims
    - **Security:** Implement token blacklist using Redis for revoked tokens
    - _Requirements: 1, 37_

  - [ ] 4.5 Create authentication DTOs and validation
    - Create LoginRequestDto with email validation (must be valid email format) and password validation
    - Create RefreshTokenRequestDto with token validation
    - Create AuthResponseDto with access_token and user info (exclude password_hash)
    - **Security:** Remove `refresh_token` from AuthResponseDto response body — refresh token only sent via `Set-Cookie` header (httpOnly cookie)
    - Implement password strength validation: minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
    - **Security:** Implement input sanitization to prevent injection attacks
    - _Requirements: 1, 37_

  - [ ] 4.6 Build authentication controllers and routes
    - Create POST /api/v1/auth/login endpoint with rate limiting (5 requests/15 min per IP)
    - Create POST /api/v1/auth/refresh endpoint
    - Create POST /api/v1/auth/logout endpoint with token invalidation
    - Add OpenAPI documentation for all auth endpoints
    - **Security:** Set secure HTTP headers (Helmet.js): X-Frame-Options, X-Content-Type-Options, CSP
    - **Security:** Implement CORS configuration: whitelist allowed origins only
    - **Security:** Return generic error messages for login failures (don't reveal if email exists)
    - _Requirements: 1, 28, 37_

  - [ ]* 4.7 Write integration tests for authentication flow
    - Test successful login with valid credentials (expect tokens in <200ms)
    - Test failed login with invalid credentials (expect 401, generic error message)
    - Test token refresh flow (valid refresh token → new access token)
    - Test logout with session invalidation in Redis
    - Test rate limiting behavior (6th attempt within 15 min → 429 Too Many Requests)
    - Test JWT expiration (expired token → 401 Unauthorized)
    - _Requirements: 1, 37_

- [ ] 5. Implement audit logging and security monitoring
  - [ ] 5.1 Create audit logging service
    - Create AuditService with structured logging
    - Create audit_logs table schema with user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, timestamp
    - Implement audit log recording for authentication events (login success/failure, logout, token refresh)
    - Create LoggerService with request ID tracking and user context
    - Configure log levels: DEBUG, INFO, WARN, ERROR, CRITICAL
    - **Security:** Log all authentication attempts with IP address and timestamp
    - **Security:** Log all permission denied events (HTTP 403) with attempted action
    - **Security:** Implement log integrity (append-only, immutable logs)
    - _Requirements: 1, 48_

  - [ ]* 5.2 Write unit tests for audit logging
    - Test audit log creation for authentication events
    - Test sensitive data masking in logs (passwords, tokens)
    - Test log immutability (verify logs cannot be modified)
    - _Requirements: 48_

- [ ] 6. Checkpoint - Verify authentication system with security checks
  - Test login flow end-to-end with valid credentials
  - Test JWT token validation working (valid token → access granted)
  - Test RBAC guards blocking unauthorized access (expect HTTP 403)
  - Verify audit logs being created for all auth events
  - **Security Check:** Verify rate limiting working (6th login attempt → 429)
  - **Security Check:** Verify JWT expiration enforced (expired token → 401)
  - **Security Check:** Verify secure HTTP headers present in responses
  - **Security Check:** Verify CORS configuration restricts origins
  - **Security Check:** Verify password strength validation working
  - Deploy to VPS and verify auth working in production
  - Ensure all tests pass, ask the user if questions arise

### Phase 3: User and Customer Management

- [ ] 7. Implement user management module
  - [ ] 7.1 Create user management use cases
    - Implement CreateUserUseCase with email uniqueness validation
    - Implement UpdateUserUseCase with change tracking
    - Implement AssignRoleUseCase with permission recalculation
    - Implement DeactivateUserUseCase with session revocation via Redis
    - Implement SearchUsersUseCase with pagination (10/25/50/100 items per page)
    - _Requirements: 2_

  - [ ] 7.2 Create user DTOs and validation
    - Create CreateUserDto with email, password, full_name, role_id, phone validation
    - Create UpdateUserDto with partial update support
    - Create AssignRoleDto with role_id validation
    - Create UserResponseDto excluding password_hash
    - Create SearchUsersDto with filters: name, email, role, status
    - _Requirements: 2_

  - [ ] 7.3 Build user management controllers
    - Create POST /api/v1/users endpoint (Owner/Manager only)
    - Create GET /api/v1/users endpoint with search and pagination
    - Create GET /api/v1/users/:id endpoint
    - Create PATCH /api/v1/users/:id endpoint
    - Create DELETE /api/v1/users/:id endpoint (soft delete, prevent if active orders/tasks)
    - Add bulk operations: POST /api/v1/users/bulk/activate, /bulk/deactivate
    - _Requirements: 2_

  - [ ]* 7.4 Write integration tests for user management
    - Test user creation with unique email constraint
    - Test user search and pagination
    - Test role assignment and permission changes
    - Test user deactivation with session revocation
    - Test bulk operations
    - _Requirements: 2_

- [ ] 8. Implement customer management module
  - [ ] 8.1 Create Customer domain entities and value objects
    - Define Customer entity with loyalty tier calculation logic
    - Create LoyaltyTier value object (Bronze <10M, Silver 10M-50M, Gold 50M-100M, Platinum >100M IDR)
    - Create NPWPValueObject with 15-digit validation
    - Implement CustomerMetrics calculation: total_revenue, total_orders, average_order_value, lifetime_value
    - Create domain events: CustomerCreatedEvent, LoyaltyTierChangedEvent, CustomerMetricsUpdatedEvent
    - _Requirements: 3_

  - [~] 8.2 Create database schema for customers
    - Create Prisma schema for customers table with indexes on email, npwp, loyalty_tier
    - Create Prisma schema for contacts table (customer contact persons)
    - Add full-text search index on company_name
    - Generate and run migrations
    - _Requirements: 3_

  - [ ] 8.3 Implement customer management use cases
    - Implement CreateCustomerUseCase with email/NPWP duplicate prevention
    - Implement UpdateCustomerUseCase
    - Implement CalculateCustomerMetricsUseCase (triggered by order events)
    - Implement RecordCommunicationUseCase for interaction history
    - Implement SearchCustomersUseCase with filters: name, email, loyalty tier, tags
    - _Requirements: 3_

  - [ ] 8.4 Create customer DTOs and controllers
    - Create CreateCustomerDto with company_name, npwp, email, phone, address validation
    - Create UpdateCustomerDto with partial update support
    - Create CustomerResponseDto with calculated metrics
    - Create POST /api/v1/customers endpoint
    - Create GET /api/v1/customers endpoint with search
    - Create GET /api/v1/customers/:id endpoint with full metrics
    - Create PATCH /api/v1/customers/:id endpoint
    - _Requirements: 3_

  - [ ]* 8.5 Write unit tests for customer metrics calculation
    - Test loyalty tier calculation logic
    - Test NPWP validation (15-digit format)
    - Test metrics recalculation after order changes
    - Test duplicate prevention on email and NPWP
    - _Requirements: 3_

- [ ] 9. Checkpoint - Verify user and customer management
  - Test user CRUD operations with RBAC
  - Test customer creation with loyalty tier assignment
  - Verify metrics calculation working correctly
  - Ensure all tests pass, ask the user if questions arise

### Phase 4: Product Catalog and Pricing

- [x] 10. Implement product catalog module
  - [x] 10.1 Create Product and Category domain entities
    - Define Product entity with SKU uniqueness validation
    - Define Category entity with hierarchical parent-child relationship
    - Create ProductStatus enum (Active, Inactive, Discontinued)
    - Create PricingTier value object for quantity-based pricing
    - Create domain events: ProductCreatedEvent, ProductPriceChangedEvent, ProductDiscontinuedEvent
    - _Requirements: 9_

  - [x] 10.2 Create database schema for products
    - Create Prisma schema for categories table with parent_id self-reference
    - Create Prisma schema for products table with indexes on sku, category_id, status
    - Create Prisma schema for pricing_tiers table
    - Add full-text search index on product name
    - Generate and run migrations
    - _Requirements: 9_

  - [x] 10.3 Implement product management use cases
    - Implement CreateProductUseCase with SKU uniqueness validation
    - Implement UpdateProductUseCase with price change event emission
    - Implement ManageProductImagesUseCase (upload/delete up to 5 images per product)
    - Implement SetPricingTiersUseCase for quantity-based pricing configuration
    - Implement SearchProductsUseCase with filters: name, SKU, category, status, price range
    - Prevent product selection in new orders when status is Inactive/Discontinued
    - _Requirements: 9_

  - [x] 10.4 Create product DTOs and controllers
    - Create CreateProductDto with sku, name, category_id, base_price, unit_of_measure validation
    - Create UpdateProductDto with partial update support
    - Create SetPricingTiersDto with min_quantity, max_quantity, unit_price array
    - Create ProductResponseDto with pricing tiers and usage statistics
    - Create POST /api/v1/products endpoint
    - Create GET /api/v1/products endpoint with search and filters
    - Create PATCH /api/v1/products/:id endpoint
    - Create POST /api/v1/products/:id/images endpoint for image upload
    - _Requirements: 9_

  - [x] 10.5 Implement Cloudflare R2 storage service for product images
    - Create StorageService abstraction using AWS SDK for JavaScript v3 (S3-compatible)
    - Configure R2 credentials: endpoint, access_key_id, secret_access_key, bucket_name
    - Implement file upload with validation (file type, size limits, malware scanning)
    - Create organized path structure in R2: products/{productId}/
    - Implement secure file access with signed URL generation
    - Generate and store image metadata in database
    - **Security:** Validate file types (whitelist: JPG, PNG, WebP) and scan for malware
    - _Requirements: 9, 36_

  - [ ]* 10.6 Write integration tests for product catalog
    - Test product creation with SKU uniqueness
    - Test pricing tier calculation based on quantity
    - Test product search and filtering
    - Test status changes and order creation prevention
    - Test image upload and storage
    - _Requirements: 9_

- [x] 11. Checkpoint - Verify product catalog
  - Test product CRUD with pricing tiers
  - Test category hierarchy working
  - Verify image upload and storage
  - Verify SKU uniqueness enforcement
  - Ensure all tests pass, ask the user if questions arise

### Phase 5: Order Management System

- [x] 11. Implement order module with workflow engine
  - [x] 11.1 Create Order domain entities and workflow
    - Define Order entity with status workflow (Draft → Pending_Approval → Approved → In_Production → Quality_Check → Completed → Delivered → [Cancelled])
    - Define OrderItem entity with quantity and pricing
    - Create OrderNumber value object with format ORD-YYYY-9999
    - Implement order total calculation: subtotal + tax (11%) + shipping
    - Create domain events: OrderCreatedEvent, OrderApprovedEvent, OrderCompletedEvent, OrderCancelledEvent
    - _Requirements: 8_

  - [x] 11.2 Create database schema for orders
    - Create Prisma schema for orders table with indexes on order_number, customer_id, status, created_at
    - Create Prisma schema for order_items table with order_id and product_id foreign keys
    - Create Prisma schema for order_timeline table for status change tracking
    - Generate and run migrations
    - _Requirements: 8_

  - [x] 11.3 Implement order management use cases
    - Implement CreateOrderUseCase with automatic order number generation
    - Implement UpdateOrderStatusUseCase with workflow validation (prevent invalid transitions)
    - Implement CalculateOrderTotalUseCase with pricing tier selection
    - Implement ApproveOrderUseCase with automatic production job creation
    - Implement CancelOrderUseCase with cancellation reason requirement
    - Validate order has at least one line item before submission
    - _Requirements: 8_

  - [x] 11.4 Implement approval workflow engine
    - Create WorkflowService with configurable approval rules
    - Implement automatic approval for orders < 2M IDR
    - Implement Manager approval requirement for 2M-10M IDR
    - Implement Owner approval requirement for > 10M IDR
    - Send approval notifications within 60 seconds
    - Store approval decisions in audit log with timestamp and approver
    - _Requirements: 7, 8_

  - [x] 11.5 Create order DTOs and controllers
    - Create CreateOrderDto with customer_id, order_items array, priority, estimated_delivery_date
    - Create UpdateOrderStatusDto with status and notes
    - Create OrderResponseDto with items, timeline, approval status
    - Create POST /api/v1/orders endpoint
    - Create GET /api/v1/orders endpoint with filters: status, customer, date range, priority
    - Create GET /api/v1/orders/:id endpoint with full details and timeline
    - **Security (IDOR Prevention):** Implement object-level authorization — query MUST be scoped to owner: `WHERE id = ? AND customer_id = ?` for Customer role, not just `WHERE id = ?`
    - Create PATCH /api/v1/orders/:id/status endpoint for workflow transitions
    - **Security (IDOR Prevention):** Apply same scoping pattern to approve/cancel endpoints — Customer role cannot approve/cancel orders not owned by them
    - Create POST /api/v1/orders/:id/approve endpoint
    - Create POST /api/v1/orders/:id/cancel endpoint
    - _Requirements: 8_

  - [ ]* 11.6 Write integration tests for order workflow
    - Test order creation with automatic numbering
    - Test order total calculation with tax and shipping
    - Test workflow transitions (valid and invalid)
    - Test approval workflow based on order amount
    - Test production job creation after approval
    - Test order cancellation with reason
    - **Security Test:** Customer A requesting `GET /orders/:id` for order owned by Customer B → must return 403/404, not 200
    - _Requirements: 7, 8_

- [x] 12. Checkpoint - Verify order management
  - Test order creation and total calculation
  - Test order workflow transitions
  - Test approval logic thresholds
  - Verify audit logs for approvals and cancellations
  - Ensure all tests pass, ask the user if questions arise

### Phase 6: Design File Management

- [x] 13. Implement design file module with version control
  - [x] 13.1 Create DesignFile domain entity
    - Define DesignFile entity with version tracking
    - Create DesignFileStatus enum (Uploaded, AI_Check, Manual_Review, Approved, Rejected, Revision_Required)
    - Implement file metadata tracking: filename, size, mime_type, version
    - Create domain events: DesignFileUploadedEvent, DesignFileApprovedEvent, DesignFileRejectedEvent
    - _Requirements: 10_

  - [x] 13.2 Create database schema for design files
    - Create Prisma schema for design_files table with indexes on order_id, status, uploaded_by
    - Store file path, original filename, file size, mime type, version number
    - Generate and run migrations
    - _Requirements: 10_

  - [x] 13.3 Implement design file use cases
    - Implement UploadDesignFileUseCase with file validation (PSD, AI, PDF, JPG, PNG max 100MB)
    - **Security (SVG Handling):** SVG files require special handling — choose one:
      - Option A: Remove SVG from allowed file types, OR
      - Option B: If SVG needed: sanitize content (strip `<script>`, `<foreignObject>`, event handlers `on*`) before saving, AND serve files from separate subdomain (`files.yourdomain.com`) or force `Content-Disposition: attachment` — don't render directly from main domain (SVG can contain embedded scripts → stored XSS)
    - Implement malware scanning using ClamAV or external service (complete within 30 seconds)
    - **Dev Note:** ClamAV on Windows laptop is complex (requires ClamWin or WSL). For local dev, skip malware scan (run only in CI/CD and production VPS via native Linux ClamAV) — don't struggle installing ClamAV on Windows for local testing
    - Implement CreateNewVersionUseCase preserving all previous versions
    - Implement ApproveDesignUseCase with customer notification within 60 seconds
    - Implement RejectDesignUseCase with feedback comments
    - Implement GenerateThumbnailUseCase for image formats (JPG, PNG)
    - _Requirements: 10_

  - [x] 13.4 Enhance Cloudflare R2 storage service for design files
    - Organize design files in R2: designs/{orderId}/{fileId}-v{version}.{ext}
    - Implement file versioning with version number increment
    - Store thumbnails in R2: thumbnails/ path
    - Implement secure file download with signed URL generation (expiry: 1 hour)
    - Maintain design file history for minimum 2 years
    - **Security:** Implement malware scanning before upload (complete within 30 seconds)
    - **Security:** Validate file types (PSD, AI, PDF, JPG, PNG) and size (max 100MB) — note SVG handling decision from task 13.3
    - **Security (IDOR Prevention):** `GET /design-files/:id` and `GET /orders/:orderId/design-files` must be scoped to customer owning the order, same pattern as Order endpoints
    - _Requirements: 10, 36_

  - [x] 13.5 Create design file DTOs and controllers
    - Create UploadDesignFileDto with order_id and file validation
    - Create ApproveDesignFileDto with review notes
    - Create RejectDesignFileDto with rejection reason
    - Create POST /api/v1/design-files/upload endpoint with multipart/form-data
    - Create GET /api/v1/design-files/:id endpoint
    - Create GET /api/v1/orders/:orderId/design-files endpoint
    - Create PATCH /api/v1/design-files/:id/approve endpoint
    - Create PATCH /api/v1/design-files/:id/reject endpoint
    - Create GET /api/v1/design-files/:id/download endpoint
    - _Requirements: 10_

  - [ ]* 13.6 Write integration tests for design file management
    - Test file upload with size and format validation
    - Test malware scanning integration
    - Test version creation and retrieval
    - Test thumbnail generation for images
    - Test approve/reject workflow with notifications
    - _Requirements: 10_

- [x] 14. Checkpoint - Verify design file system
  - Test file upload with various formats
  - Verify version control working correctly
  - Test thumbnail generation
  - Verify malware scanning integrated
  - Ensure all tests pass, ask the user if questions arise

### Phase 7: Production Workflow & Job Tracking

- [x] 15. Implement production module
  - [x] 15.1 Create `Machine` & `ProductionJob` schemas and enums (Queue, Assigned, In_Progress, Quality_Check, Completed)
  - [x] 15.2 Create database schema for production
    - Create Prisma schema for machines table with indexes on status
    - Create Prisma schema for production_jobs table with indexes on status, order_id, machine_id
    - Create Prisma schema for material_consumption table linking jobs to materials
    - Track machine utilization: total_production_time, total_idle_time
    - Generate and run migrations
    - _Requirements: 11, 12_
  - [x] 15.3 Implement production use cases
    - Implement CreateProductionJobUseCase (auto-triggered by OrderApprovedEvent)
    - Implement AssignProductionJobUseCase with machine availability checking
    - Implement StartProductionUseCase with automatic time tracking
    - Implement CompleteProductionUseCase with quality check requirement
    - Implement RecordMaterialConsumptionUseCase for inventory tracking
    - Implement CreateReworkJobUseCase when quality check fails
    - Send notification to assigned staff within 60 seconds
    - _Requirements: 11_
  - [x] 15.4 Implement machine management use cases
    - Implement CreateMachineUseCase
    - Implement UpdateMachineStatusUseCase (prevent assignment when Maintenance/Broken)
    - Implement CalculateMachineUtilizationUseCase (production_time / total_available_time × 100)
    - Implement ScheduleMaintenanceUseCase with notification 3 days before due date
    - Display active production jobs per machine in real-time
    - _Requirements: 12_

  - [x] 15.5 Create production DTOs and controllers
    - Create CreateProductionJobDto with order_id and machine_id
    - Create AssignProductionJobDto with machine_id and staff_id
    - Create CompleteProductionJobDto with quality check result
    - Create ProductionJobResponseDto with timeline and material consumption
    - Create POST /api/v1/production/jobs endpoint
    - Create GET /api/v1/production/jobs endpoint with filters: status, machine, staff, date
    - Create PATCH /api/v1/production/jobs/:id/assign endpoint
    - Create PATCH /api/v1/production/jobs/:id/start endpoint
    - Create PATCH /api/v1/production/jobs/:id/complete endpoint
    - Create GET /api/v1/machines endpoint with utilization metrics
    - Create PATCH /api/v1/machines/:id/status endpoint
    - _Requirements: 11, 12_

  - [x]* 15.6 Write integration tests for production workflow
    - Test production job auto-creation from approved order
    - Test machine assignment based on availability
    - Test production time tracking
    - Test quality check failure triggers rework
    - Test machine utilization calculation
    - _Requirements: 11, 12_

- [x] 16. Checkpoint - Verify production system
  - Test production job creation from orders
  - Verify machine assignment logic
  - Test time tracking and duration calculation
  - Verify quality check and rework flow
  - Ensure all tests pass, ask the user if questions arise

### Phase 8: Financial Management and Invoicing

- [x] 17. Implement finance module
  - [x] 17.1 Define `Invoice` and `Payment` models
    - Create Invoice entity (order, customer, amount, status, due date, pdf_url)
    - Create Payment entity (invoice, amount, method, reference_number, date)
    - _Requirements: 15_

  - [x] 17.2 Database schema updates
    - Add models to Prisma schema
    - Run `prisma db push` (or generate migration)
    - _Requirements: 15_

  - [x] 17.3 Implement core finance use cases
    - `GenerateInvoiceUseCase`: Auto-create on order completion
    - `RecordPaymentUseCase`: Support partial and full payments
    - `CalculateOutstandingBalanceUseCase`: Total amount minus payments
    - `SendInvoiceUseCase`: Trigger PDF generation and email
    - `SendPaymentReminderUseCase`: Trigger for upcoming/overdue invoices
    - _Requirements: 15_

  - [x] 17.4 Implement PDF generation
    - Create invoice PDF template with company logo, invoice details, line items
    - Store generated PDFs in Cloudflare R2: invoices/ path
    - Implement PDF generation as background job via BullMQ
    - Support PDF download via signed URL (expiry: 24 hours)
    - _Requirements: 15, 36_

  - [x] 17.5 Create finance DTOs and controllers
    - Create RecordPaymentDto with invoice_id, amount, payment_method, reference_number
    - Create InvoiceResponseDto with payments and outstanding balance
    - Create GET /api/v1/invoices endpoint with filters: customer, status, date range
    - Create GET /api/v1/invoices/:id endpoint with payment history
    - **Security (IDOR Prevention):** `GET /invoices/:id` and `GET /invoices/:id/pdf` must be scoped to customer owning the invoice
    - Create POST /api/v1/invoices/:id/payments endpoint
    - Create GET /api/v1/invoices/:id/pdf endpoint for download
    - Create POST /api/v1/invoices/:id/send endpoint for email delivery
    - **Future Security Note:** When integrating automatic payment gateway (Midtrans/Xendit) later, MUST verify HMAC signature of webhook before updating status to "Fully_Paid" — without this, anyone knowing webhook URL can send fake requests
    - _Requirements: 15_

  - [x]* 17.6 Write integration tests for finance module
    - Test invoice auto-generation from completed order
    - Test partial payment recording and balance calculation
    - Test invoice status transitions (Sent → Partially_Paid → Fully_Paid)
    - Test overdue invoice detection
    - Test PDF generation and download
    - _Requirements: 15_

- [x] 18. Checkpoint - Verify financial system
  - Test invoice auto-generation workflow
  - Verify payment recording and balance calculation
  - Test PDF generation and email delivery
  - Verify overdue detection working
  - Ensure all tests pass, ask the user if questions arise


### Phase 9: Event-Driven Communication and Notifications

- [ ] 19. Implement event bus and notification system
  - [ ] 19.1 Create event bus infrastructure
    - Implement EventBusService with in-process event emitter for MVP
    - Create event persistence table for audit trail
    - Implement async event handlers using BullMQ for heavy operations
    - Register event listeners for all domain events
    - Track event processing success/failure with retry mechanism
    - _Requirements: 20, 36, 42_

  - [ ] 19.2 Implement notification service
    - Create NotificationService with multi-channel support (In_App, Email, SMS, Push, Real_Time)
    - Implement notification queue with BullMQ (high priority for critical notifications)
    - Configure SMTP for email notifications
    - Store user notification preferences in database
    - Implement notification templates for each event type
    - Deliver notifications within 60 seconds of event
    - _Requirements: 20_

  - [ ] 19.3 Create notification use cases
    - Implement SendNotificationUseCase with channel routing based on user preferences
    - Implement MarkNotificationAsReadUseCase
    - Implement GetUnreadNotificationsCountUseCase for dashboard badge
    - Implement retry logic with exponential backoff (up to 3 attempts)
    - Support notification types: Order_Update, Payment_Received, Approval_Required, Task_Assigned, Ticket_Created, Stock_Alert, Production_Complete
    - _Requirements: 20_

  - [ ] 19.4 Implement real-time notifications with Socket.IO
    - Set up Socket.IO server with Redis adapter for scalability
    - Implement authentication middleware for WebSocket connections
    - Create notification rooms per user
    - Emit real-time notifications when events occur
    - Handle client connection/disconnection gracefully
    - _Requirements: 20, 35_

  - [ ] 19.5 Create notification DTOs and controllers
    - Create NotificationResponseDto with id, type, title, message, read status, timestamp
    - Create GET /api/v1/notifications endpoint with pagination
    - Create PATCH /api/v1/notifications/:id/read endpoint
    - Create GET /api/v1/notifications/unread/count endpoint
    - Implement WebSocket event: 'notification:new' for real-time delivery
    - _Requirements: 20_

  - [ ]* 19.6 Write integration tests for event and notification system
    - Test event emission and listener execution
    - Test notification creation from domain events
    - Test multi-channel notification delivery
    - Test notification retry mechanism on failure
    - Test real-time WebSocket delivery
    - _Requirements: 20_

- [ ] 20. Checkpoint - Verify event-driven architecture
  - Test event emission from domain operations
  - Verify notifications sent via email and in-app
  - Test real-time WebSocket notifications
  - Verify retry mechanism for failed deliveries
  - Ensure all tests pass, ask the user if questions arise

### Phase 10: Dashboard and Business Intelligence

- [ ] 21. Implement dashboard and KPI module
  - [ ] 21.1 Create dashboard use cases with caching
    - Implement GetDashboardMetricsUseCase with 5-minute cache TTL
    - Implement CalculateKPIsUseCase with 15-minute cache TTL: Total_Revenue, Gross_Profit, Net_Profit, Conversion_Rate, Retention_Rate, Average_Production_Time, Customer_Satisfaction_Score
    - Implement GetRevenueChartDataUseCase with 30-minute cache TTL
    - Implement GetProductionStatusUseCase for real-time production queue
    - Invalidate cache on relevant domain events (OrderCreatedEvent, PaymentReceivedEvent, etc.)
    - _Requirements: 21_

  - [ ] 21.2 Create dashboard widgets
    - Implement Revenue_Today widget with comparison to yesterday
    - Implement Orders_Today widget with status breakdown
    - Implement Production_Status widget with machine utilization
    - Implement Low_Stock_Alerts widget (materials below minimum threshold)
    - Implement Pending_Approvals widget showing count and total value
    - Implement Machine_Utilization widget with bar chart
    - Implement Customer_Growth widget with trend line
    - Implement Top_Products widget by revenue
    - _Requirements: 21_

  - [ ] 21.3 Implement widget configuration service
    - Create user widget preferences table for personalization
    - Allow users to rearrange widgets via drag-and-drop (store layout order)
    - Support widget enable/disable per user
    - Implement default widget layout for new users
    - _Requirements: 21_

  - [ ] 21.4 Create dashboard DTOs and controllers
    - Create DashboardMetricsResponseDto with all widget data
    - Create KPIResponseDto with current and previous period comparison
    - Create GET /api/v1/dashboard/metrics endpoint
    - Create GET /api/v1/dashboard/kpis endpoint with date range filter
    - Create GET /api/v1/dashboard/revenue-chart endpoint
    - Create PATCH /api/v1/dashboard/widgets/layout endpoint for saving user preferences
    - _Requirements: 21_

  - [ ]* 21.5 Write integration tests for dashboard
    - Test metrics calculation accuracy
    - Test KPI calculations with comparison
    - Test cache TTL and invalidation
    - Test widget personalization
    - _Requirements: 21_

- [ ] 22. Final checkpoint - Verify complete MVP system
  - Run full integration test suite
  - Verify all core workflows end-to-end
  - Test system performance under load
  - Review security configurations
  - Ensure all documentation complete
  - Ask the user if questions arise

### Phase 11: Security & Legal Hardening

- [ ] 23. Security audit and legal compliance
  - [ ] 23.1 Audit Git secrets and rotate compromised credentials
    - Run comprehensive Git history scan for leaked secrets (use gitleaks or git-secrets)
    - Search for `.env` files, API keys, connection strings, JWT secrets in entire Git history
    - If any secrets found in history, rotate ALL related secrets immediately:
      - Database passwords
      - JWT signing keys
      - R2 API credentials
      - SMTP credentials
      - Any third-party API keys
    - Document rotation process and verify new secrets not in Git history
    - _Requirements: 37, 38_

  - [ ] 23.2 Implement UU PDP (Indonesian Personal Data Protection Law) compliance
    - **Legal Context:** UU No. 27 Tahun 2022, fully effective since October 2024
    - System stores personal data: customer NPWP, address, phone, email — falls under UU PDP scope
    - **Sanctions:** Administrative (warnings, processing suspension, fines up to 2% annual revenue) and criminal penalties for serious violations — not just technical issue
    - Create privacy policy page (simple, clear language)
    - Add explicit consent mechanism during customer registration (checkbox, not implicit/silent)
    - Implement data deletion request mechanism (can be manual process initially)
    - Document data processing purposes and retention periods
    - Ensure customer data access controls working (from IDOR prevention tasks)
    - _Requirements: 3, 37_

  - [ ] 23.3 Full backup restore test before go-live
    - Perform complete manual backup restore (not just weekly automated verification)
    - Restore to separate test environment or /tmp directory
    - Verify all tables restored correctly
    - Verify file storage (R2 backups if implemented) restorable
    - Test application can connect to restored database
    - Document restore procedure with step-by-step instructions
    - Time the restore process (know RTO - Recovery Time Objective)
    - _Requirements: 47, 48_

  - [ ] 23.4 Final CORS and security headers audit
    - Verify CORS configuration: NO wildcard origins (`*`) with credentials
    - Audit security headers present in all responses:
      - `X-Frame-Options: DENY`
      - `X-Content-Type-Options: nosniff`
      - `Content-Security-Policy` configured
      - `Strict-Transport-Security` for HTTPS
    - Test CORS preflight requests working correctly
    - Verify no sensitive data in error responses (stack traces, internal paths)
    - Confirm rate limiting active on all authentication endpoints
    - _Requirements: 37, 38_

- [ ] 24. Final checkpoint - Security audit complete and go-live ready
  - Verify all secrets rotated if needed
  - Confirm UU PDP compliance mechanisms in place
  - Verify full backup restore tested successfully
  - Confirm all security headers and CORS configuration correct
  - System ready for production deployment
  - Ask the user if questions arise

## Notes

- **Optional Test Tasks**: Tasks marked with `*` are optional and can be skipped for faster MVP delivery. These include unit tests, integration tests, and property-based tests. However, implementing these tests is highly recommended for production-quality code.

- **Incremental Implementation**: Each task builds upon previous tasks. The order is designed to validate core functionality early and integrate components progressively.

- **Requirements Traceability**: Every task explicitly references the requirements it satisfies (e.g., _Requirements: 1, 2_). This ensures complete requirements coverage.

- **Checkpoint Tasks**: Regular checkpoint tasks are included to validate system integrity before proceeding to the next phase. Use these to pause, test, and ask questions.

- **Clean Architecture Compliance**: All implementation follows Clean Architecture principles with strict layer separation: Domain → Application → Infrastructure → Presentation.

- **Event-Driven Design**: Modules communicate through domain events for loose coupling. The event bus is established early in Phase 9 but events are defined throughout earlier phases.

- **Security First**: Authentication and authorization are implemented in Phase 2, establishing RBAC foundation for all subsequent features.

- **Background Processing**: Heavy operations (email, PDF generation, image processing) use BullMQ for async processing to maintain API responsiveness.

- **Caching Strategy**: Dashboard and frequently-accessed data use Redis caching with appropriate TTL values and event-based invalidation.

- **File Storage**: All file uploads (design files, product images, generated documents) are stored in an organized local file system structure with secure access controls.

- **Database Performance**: All database tables include appropriate indexes for query optimization. Full-text search uses PostgreSQL's built-in capabilities.

- **Testing Coverage**: While test tasks are optional, the architecture supports high test coverage through dependency injection and clear layer separation.

- **Modular Structure**: Each module (auth, users, customers, orders, etc.) is self-contained with its own domain, use cases, repositories, DTOs, and controllers.

- **API Documentation**: OpenAPI/Swagger documentation is generated automatically from NestJS decorators and DTOs.

- **TypeScript Advantages**: Type safety throughout the stack reduces runtime errors and improves developer experience with autocomplete and refactoring support.

- **Scalability Considerations**: The modular monolith architecture allows individual modules to be extracted into microservices if scaling requires it in the future.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["0.1"]
    },
    {
      "id": 1,
      "tasks": ["0.2"]
    },
    {
      "id": 2,
      "tasks": ["0.3", "0.6"]
    },
    {
      "id": 3,
      "tasks": ["0.4"]
    },
    {
      "id": 4,
      "tasks": ["0.5"]
    },
    {
      "id": 5,
      "tasks": ["2.1"]
    },
    {
      "id": 6,
      "tasks": ["2.2", "2.3"]
    },
    {
      "id": 7,
      "tasks": ["2.4", "4.1"]
    },
    {
      "id": 8,
      "tasks": ["4.2"]
    },
    {
      "id": 9,
      "tasks": ["4.3", "4.4"]
    },
    {
      "id": 10,
      "tasks": ["4.5"]
    },
    {
      "id": 11,
      "tasks": ["4.6"]
    },
    {
      "id": 12,
      "tasks": ["4.7", "5.1"]
    },
    {
      "id": 13,
      "tasks": ["5.2"]
    },
    {
      "id": 14,
      "tasks": ["7.1"]
    },
    {
      "id": 15,
      "tasks": ["7.2"]
    },
    {
      "id": 16,
      "tasks": ["7.3"]
    },
    {
      "id": 17,
      "tasks": ["7.4", "8.1"]
    },
    {
      "id": 18,
      "tasks": ["8.2"]
    },
    {
      "id": 19,
      "tasks": ["8.3"]
    },
    {
      "id": 20,
      "tasks": ["8.4"]
    },
    {
      "id": 21,
      "tasks": ["8.5", "10.1"]
    },
    {
      "id": 22,
      "tasks": ["10.2"]
    },
    {
      "id": 23,
      "tasks": ["10.3", "10.5"]
    },
    {
      "id": 24,
      "tasks": ["10.4"]
    },
    {
      "id": 25,
      "tasks": ["10.6", "11.1"]
    },
    {
      "id": 26,
      "tasks": ["11.2"]
    },
    {
      "id": 27,
      "tasks": ["11.3", "11.4"]
    },
    {
      "id": 28,
      "tasks": ["11.5"]
    },
    {
      "id": 29,
      "tasks": ["11.6", "13.1"]
    },
    {
      "id": 30,
      "tasks": ["13.2"]
    },
    {
      "id": 31,
      "tasks": ["13.3"]
    },
    {
      "id": 32,
      "tasks": ["13.4"]
    },
    {
      "id": 33,
      "tasks": ["13.5"]
    },
    {
      "id": 34,
      "tasks": ["13.6", "15.1"]
    },
    {
      "id": 35,
      "tasks": ["15.2"]
    },
    {
      "id": 36,
      "tasks": ["15.3", "15.4"]
    },
    {
      "id": 37,
      "tasks": ["15.5"]
    },
    {
      "id": 38,
      "tasks": ["15.6", "17.1"]
    },
    {
      "id": 39,
      "tasks": ["17.2"]
    },
    {
      "id": 40,
      "tasks": ["17.3", "17.4"]
    },
    {
      "id": 41,
      "tasks": ["17.5"]
    },
    {
      "id": 42,
      "tasks": ["17.6", "19.1"]
    },
    {
      "id": 43,
      "tasks": ["19.2"]
    },
    {
      "id": 44,
      "tasks": ["19.3", "19.4"]
    },
    {
      "id": 45,
      "tasks": ["19.5"]
    },
    {
      "id": 46,
      "tasks": ["19.6", "21.1"]
    },
    {
      "id": 47,
      "tasks": ["21.2", "21.3"]
    },
    {
      "id": 48,
      "tasks": ["21.4"]
    },
    {
      "id": 49,
      "tasks": ["21.5"]
    },
    {
      "id": 50,
      "tasks": ["23.1", "23.2", "23.3"]
    },
    {
      "id": 51,
      "tasks": ["23.4"]
    }
  ]
}
```

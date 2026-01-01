# Design Document

## Overview

### System Purpose

The Multi Kreasi Printing Enterprise Digital Platform is a comprehensive digital business transformation solution that modernizes PT Multi Kreasi Printing from traditional operations into a scalable, maintainable enterprise digital platform. The system manages the complete business lifecycle from customer acquisition through quotation, order management, production tracking, inventory management, delivery, and financial operations.

### MVP Scope (Version 1.0)

The MVP focuses on core business operations that deliver immediate value:

**Core Authentication and Security (Requirements 1, 37, 38)**
- JWT-based authentication with role-based access control (RBAC)
- OWASP-compliant security implementation
- User management with 7 roles: Owner, Manager, Designer, Production_Staff, Warehouse_Staff, Finance_Staff, Customer

**Essential Business Operations (Requirements 2, 8, 9, 10, 11, 15)**
- User management and role assignment
- Order management with complete workflow tracking
- Product catalog with pricing and specifications
- Design file management with version control
- Production workflow and job tracking
- Financial management with automated invoicing

**Customer Experience (Requirement 16)**
- Customer portal for self-service operations
- Order tracking and history
- Design file upload
- Invoice download

**Critical Infrastructure (Requirements 28, 35, 36, 42, 47, 48)**
- API-first architecture with OpenAPI documentation
- Performance optimization with Redis caching
- Background job processing with BullMQ
- Clean Architecture implementation
- Native deployment with PM2 process manager
- Automated backup and disaster recovery

**Basic Reporting (Requirement 21)**
- Executive dashboard with real-time metrics
- KPI visualization and monitoring


### Design Principles

1. **Clean Architecture**: Strict separation of Domain, Application, Infrastructure, and Presentation layers
2. **Domain-Driven Design**: Business logic encapsulated in domain entities and use cases
3. **API-First**: All functionality exposed through well-documented REST APIs
4. **Event-Driven Foundation**: Modules communicate through domain events for loose coupling
5. **Modular Monolith**: Self-contained modules that can evolve into microservices if needed
6. **Scalability by Design**: Architecture supports growth from 100 to 10,000+ orders/day
7. **Security by Default**: OWASP compliance, encryption, and audit logging built-in
8. **Testability**: High test coverage through clean separation and dependency injection
9. **Observability**: Comprehensive logging, monitoring, and health checks

### Technology Decisions

**Frontend**
- **React 18+**: Modern UI with hooks and concurrent features
- **TypeScript**: Type safety and better developer experience
- **Atomic Design**: Component hierarchy (Atoms > Molecules > Organisms > Templates > Pages)
- **TanStack Query**: Server state management and caching
- **Zustand**: Client state management (lightweight alternative to Redux)
- **React Hook Form + Zod**: Form handling and validation
- **TailwindCSS**: Utility-first styling with design token system
- **Vite**: Fast build tool with HMR

**Backend**
- **NestJS**: Enterprise-grade Node.js framework with TypeScript
- **Prisma ORM**: Type-safe database access with migrations
- **PostgreSQL 15+**: Robust relational database with JSONB support
- **Redis**: Caching, session storage, and queue backend
  - **Development (Windows)**: Memurai Developer Edition
  - **Production (Linux VPS)**: redis-server native installation
  - No Docker or virtualization
- **BullMQ**: Background job processing
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: Hand-rolled JWT authentication + RBAC from scratch (no third-party auth libraries)
  - Not using Better Auth, Auth.js, Passport.js, or similar libraries
  - Built from zero for deep fullstack learning
- **bcrypt**: Password hashing


**Infrastructure**
- **Storage**: Cloudflare R2 (S3-compatible, cloud-managed object storage)
  - Replacing MinIO Community Edition (archived April 2026)
  - S3-compatible API for seamless integration
  - Zero self-hosting complexity, fully managed
- **Process Manager**: PM2 cluster mode for zero-downtime deployments
  - Native Node.js process management and monitoring
  - Auto-restart, load balancing, log management
- **Reverse Proxy**: Nginx for load balancing, SSL termination, and static file serving
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Backup**: PostgreSQL WAL-G for incremental database backups
- **Deployment**: Native installation only (no Docker, no containerization)

---

## Architecture

### Clean Architecture Layers

The system follows Clean Architecture with 4 distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│  Controllers, DTOs, Validation, HTTP Response Formatting │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│     Use Cases, Business Workflows, Event Handlers        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    DOMAIN LAYER                          │
│  Entities, Value Objects, Domain Events, Business Rules  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                INFRASTRUCTURE LAYER                      │
│  Repositories, External Services, Database, File Storage │
└─────────────────────────────────────────────────────────┘
```

**Dependency Rule**: Dependencies flow inward only. Domain layer has no dependencies on outer layers.


### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[React Web App]
        CustomerPortal[Customer Portal]
    end

    subgraph "API Gateway Layer"
        Nginx[Nginx Reverse Proxy]
    end

    subgraph "Application Layer"
        NestJS[NestJS Backend]
        SocketIO[Socket.IO Server]
    end

    subgraph "Background Processing"
        BullMQ[BullMQ Workers]
        Scheduler[Cron Jobs]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis)]
        R2[(Cloudflare R2 Storage)]
    end

    subgraph "External Services"
        SMTP[Email Service]
        SMS[SMS Gateway]
    end

    WebApp --> Nginx
    CustomerPortal --> Nginx
    Nginx --> NestJS
    Nginx --> SocketIO
    
    NestJS --> PostgreSQL
    NestJS --> Redis
    NestJS --> R2
    NestJS --> BullMQ
    
    BullMQ --> PostgreSQL
    BullMQ --> R2
    BullMQ --> SMTP
    BullMQ --> SMS
    
    Scheduler --> NestJS
    SocketIO --> Redis
```


### High-Level Component Architecture

```mermaid
graph TB
    subgraph "Frontend Modules"
        AuthUI[Authentication UI]
        DashboardUI[Dashboard UI]
        OrderUI[Order Management UI]
        ProductUI[Product Catalog UI]
        DesignUI[Design File Management UI]
        ProductionUI[Production Tracking UI]
        FinanceUI[Financial Management UI]
        PortalUI[Customer Portal UI]
    end

    subgraph "Backend Modules"
        AuthModule[Auth Module]
        UserModule[User Module]
        CustomerModule[Customer Module]
        ProductModule[Product Module]
        OrderModule[Order Module]
        DesignModule[Design File Module]
        ProductionModule[Production Module]
        InventoryModule[Inventory Module]
        FinanceModule[Finance Module]
        NotificationModule[Notification Module]
        DashboardModule[Dashboard Module]
    end

    subgraph "Shared Services"
        EventBus[Event Bus]
        CacheService[Cache Service]
        StorageService[Storage Service]
        QueueService[Queue Service]
        LoggerService[Logger Service]
        AuditService[Audit Service]
    end

    AuthUI --> AuthModule
    DashboardUI --> DashboardModule
    OrderUI --> OrderModule
    ProductUI --> ProductModule
    DesignUI --> DesignModule
    ProductionUI --> ProductionModule
    FinanceUI --> FinanceModule
    PortalUI --> OrderModule
    PortalUI --> DesignModule
    
    OrderModule --> EventBus
    ProductionModule --> EventBus
    FinanceModule --> EventBus
    
    OrderModule --> QueueService
    DesignModule --> StorageService
    DashboardModule --> CacheService
```


---

## Components and Interfaces

### Backend Module Structure (Modular Monolith)

Each module follows a consistent internal structure:

```
src/modules/{module-name}/
├── controllers/          # HTTP request handlers
│   └── {module}.controller.ts
├── services/             # Business logic orchestration
│   └── {module}.service.ts
├── use-cases/            # Application layer - specific operations
│   ├── create-{entity}.use-case.ts
│   ├── update-{entity}.use-case.ts
│   └── delete-{entity}.use-case.ts
├── domain/               # Domain layer
│   ├── entities/
│   │   └── {entity}.entity.ts
│   ├── value-objects/
│   │   └── {value-object}.vo.ts
│   └── events/
│       └── {event}.event.ts
├── repositories/         # Data access interfaces
│   ├── {module}.repository.interface.ts
│   └── {module}.repository.ts
├── dto/                  # Data transfer objects
│   ├── request/
│   │   ├── create-{entity}.dto.ts
│   │   └── update-{entity}.dto.ts
│   └── response/
│       └── {entity}.response.dto.ts
├── validators/           # Custom validation logic
├── constants/            # Module-specific constants
├── interfaces/           # TypeScript interfaces
├── tests/                # Unit and integration tests
│   ├── unit/
│   └── integration/
├── {module}.module.ts    # NestJS module definition
└── README.md             # Module documentation
```


### Core Modules (MVP)

#### 1. Authentication Module (`auth`)

**Responsibilities:**
- JWT token generation and validation (hand-rolled from scratch)
- Password hashing and verification using bcrypt
- Refresh token management with Redis storage
- Login attempt tracking and rate limiting

**Implementation Note:**
- This module implements JWT authentication and RBAC completely from scratch
- No third-party authentication libraries (Better Auth, Auth.js, Passport.js, etc.)
- Built from zero for deep fullstack learning and complete control
- All JWT signing, verification, token refresh, and RBAC logic written manually

**Key Use Cases:**
- `LoginUseCase`: Authenticate user with credentials
- `RefreshTokenUseCase`: Generate new access token from refresh token
- `LogoutUseCase`: Invalidate refresh token
- `ValidateTokenUseCase`: Verify JWT token validity

**Domain Events:**
- `UserLoggedInEvent`: Triggers audit logging
- `UserLoggedOutEvent`: Triggers session cleanup
- `LoginFailedEvent`: Triggers security monitoring

#### 2. User Module (`users`)

**Responsibilities:**
- User account management
- Role and permission assignment
- User profile management
- User search and filtering

**Key Use Cases:**
- `CreateUserUseCase`: Create new user account with email verification
- `UpdateUserUseCase`: Modify user information
- `AssignRoleUseCase`: Assign roles to user (RBAC)
- `DeactivateUserUseCase`: Deactivate user account and revoke sessions
- `SearchUsersUseCase`: Search and filter users

**Domain Events:**
- `UserCreatedEvent`: Triggers welcome email
- `UserDeactivatedEvent`: Triggers session revocation
- `RoleAssignedEvent`: Triggers permission recalculation


#### 3. Customer Module (`customers`)

**Responsibilities:**
- Customer profile management
- Customer metrics calculation (lifetime value, order count)
- Loyalty tier management
- Customer communication history

**Key Use Cases:**
- `CreateCustomerUseCase`: Create customer profile with validation
- `UpdateCustomerUseCase`: Update customer information
- `CalculateCustomerMetricsUseCase`: Recalculate revenue and loyalty tier
- `RecordCommunicationUseCase`: Log customer interaction

**Domain Events:**
- `CustomerCreatedEvent`: Triggers CRM workflow
- `LoyaltyTierChangedEvent`: Triggers discount recalculation
- `CustomerMetricsUpdatedEvent`: Triggers dashboard refresh

#### 4. Product Module (`products`)

**Responsibilities:**
- Product catalog management
- SKU management and uniqueness
- Category hierarchy
- Pricing tier management
- Product image storage

**Key Use Cases:**
- `CreateProductUseCase`: Create product with SKU validation
- `UpdateProductUseCase`: Update product details
- `ManageProductImagesUseCase`: Upload/delete product images
- `SetPricingTiersUseCase`: Configure quantity-based pricing
- `SearchProductsUseCase`: Search with filters

**Domain Events:**
- `ProductCreatedEvent`: Triggers catalog indexing
- `ProductPriceChangedEvent`: Triggers quotation recalculation warning
- `ProductDiscontinuedEvent`: Triggers stock clearance workflow


#### 5. Order Module (`orders`)

**Responsibilities:**
- Order lifecycle management (Draft → Completed → Delivered)
- Order numbering (ORD-YYYY-9999)
- Order calculation (subtotal, tax, shipping)
- Order timeline tracking
- Order approval workflow integration

**Key Use Cases:**
- `CreateOrderUseCase`: Create order with validation and numbering
- `UpdateOrderStatusUseCase`: Transition order through workflow states
- `CalculateOrderTotalUseCase`: Calculate order amounts
- `ApproveOrderUseCase`: Approve order triggering production job creation
- `CancelOrderUseCase`: Cancel order with reason tracking

**Domain Events:**
- `OrderCreatedEvent`: Triggers notification to customer
- `OrderApprovedEvent`: Triggers production job creation
- `OrderCompletedEvent`: Triggers invoice generation
- `OrderCancelledEvent`: Triggers refund workflow (future)

**Workflow States:**
```
Draft → Pending_Approval → Approved → In_Production → 
Quality_Check → Completed → Delivered → [Cancelled]
```

#### 6. Design File Module (`design-files`)

**Responsibilities:**
- File upload and validation (PSD, AI, PDF, images)
- Malware scanning
- Version control
- Thumbnail generation
- Design review workflow

**Key Use Cases:**
- `UploadDesignFileUseCase`: Upload file with malware scan and validation
- `CreateNewVersionUseCase`: Create new design version
- `ApproveDesignUseCase`: Approve design for production
- `RejectDesignUseCase`: Reject design with feedback
- `GenerateThumbnailUseCase`: Create preview thumbnail

**Domain Events:**
- `DesignFileUploadedEvent`: Triggers AI check (future) and notification
- `DesignFileApprovedEvent`: Triggers production readiness check
- `DesignFileRejectedEvent`: Triggers customer notification


#### 7. Production Module (`production`)

**Responsibilities:**
- Production job creation from approved orders
- Job assignment to machines and staff
- Production status tracking
- Material consumption tracking
- Quality check workflow
- Production time monitoring

**Key Use Cases:**
- `CreateProductionJobUseCase`: Create job from approved order
- `AssignProductionJobUseCase`: Assign to machine and staff
- `StartProductionUseCase`: Mark production as started
- `CompleteProductionUseCase`: Complete production with quality check
- `RecordMaterialConsumptionUseCase`: Track material usage
- `CreateReworkJobUseCase`: Create rework for failed quality check

**Domain Events:**
- `ProductionJobCreatedEvent`: Triggers staff notification
- `ProductionJobStartedEvent`: Triggers time tracking
- `ProductionJobCompletedEvent`: Triggers order status update
- `QualityCheckFailedEvent`: Triggers rework job creation

**Workflow States:**
```
Queue → Assigned → In_Progress → Quality_Check → 
Completed → [Failed → Rework]
```

#### 8. Finance Module (`finance`)

**Responsibilities:**
- Automatic invoice generation from completed orders
- Payment recording and tracking
- Invoice numbering (INV-YYYY-9999)
- Payment reminder automation
- Outstanding balance calculation

**Key Use Cases:**
- `GenerateInvoiceUseCase`: Auto-generate invoice from completed order
- `RecordPaymentUseCase`: Record customer payment
- `SendInvoiceUseCase`: Email invoice to customer
- `SendPaymentReminderUseCase`: Send automated reminders
- `CalculateOutstandingBalanceUseCase`: Calculate amount due

**Domain Events:**
- `InvoiceGeneratedEvent`: Triggers email to customer
- `PaymentReceivedEvent`: Triggers receipt generation and order completion
- `InvoiceOverdueEvent`: Triggers reminder workflow


#### 9. Dashboard Module (`dashboard`)

**Responsibilities:**
- Real-time metrics calculation
- KPI aggregation
- Widget data preparation
- Performance monitoring
- Trend analysis

**Key Use Cases:**
- `GetDashboardMetricsUseCase`: Fetch real-time dashboard data
- `CalculateKPIsUseCase`: Calculate business KPIs
- `GetRevenueChartDataUseCase`: Prepare chart data
- `GetProductionStatusUseCase`: Fetch production queue and status

**Caching Strategy:**
- Dashboard metrics: 5-minute TTL
- KPI calculations: 15-minute TTL
- Charts data: 30-minute TTL
- Invalidate on relevant domain events

### Shared Services

#### Event Bus Service

**Purpose:** Decouple modules through domain events

**Implementation:**
- In-process event emitter for MVP
- Event persistence for audit trail
- Async event handlers using BullMQ for heavy operations

```typescript
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}
```


#### Cache Service

**Purpose:** Redis-based caching for performance optimization

**Implementation:**
- **Development (Windows)**: Memurai Developer Edition (Redis-compatible)
- **Production (Linux VPS)**: redis-server native installation
- No Docker or virtualization required

**Features:**
- Key-value caching with TTL
- Cache invalidation patterns
- Cache warming for frequently accessed data
- Cache-aside pattern implementation

**Caching Strategy:**
```typescript
// Pattern: {module}:{entity}:{id}
'products:catalog:all'          // 30 min TTL
'dashboard:metrics:today'       // 5 min TTL
'users:{userId}:permissions'    // 1 hour TTL
'orders:{orderId}'              // 10 min TTL
```

#### Storage Service

**Purpose:** Cloudflare R2 cloud-managed object storage abstraction

**Why Cloudflare R2:**
- MinIO Community Edition archived in April 2026
- S3-compatible API for drop-in replacement
- Cloud-managed, eliminating self-hosting operational overhead
- Cost-effective with zero egress fees
- High durability and availability

**Features:**
- S3-compatible API using AWS SDK for JavaScript v3
- File upload with malware scanning integration
- Automatic path organization by entity type
- Secure file access with signed URL generation
- Thumbnail generation for images
- File versioning support
- Cloud-native with no infrastructure management

**Storage Structure:**
```
r2://bucket-name/
├── designs/              # Customer design files
│   ├── {orderId}/
│   │   └── {fileId}-v{version}.{ext}
├── invoices/             # Generated invoices (PDF)
├── quotations/           # Generated quotations (PDF)
├── products/             # Product images
└── thumbnails/           # Generated thumbnails
```

**Configuration:**
```typescript
{
  endpoint: process.env.R2_ENDPOINT,          // Cloudflare R2 endpoint
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',                             // R2 uses 'auto' region
  bucketName: process.env.R2_BUCKET_NAME
}
```

#### Queue Service

**Purpose:** Background job processing with BullMQ

**Job Types:**
- Email sending
- PDF generation
- Image processing (thumbnails)
- Report generation
- Data export
- Scheduled tasks

**Queue Configuration:**
```typescript
{
  email: { priority: 'high', attempts: 3 },
  pdf: { priority: 'normal', attempts: 2 },
  thumbnail: { priority: 'low', attempts: 1 },
  report: { priority: 'low', attempts: 1, timeout: 300000 }
}
```


#### Logger Service

**Purpose:** Structured logging with context

**Features:**
- Log levels: DEBUG, INFO, WARN, ERROR, CRITICAL
- Request ID tracking
- User context in logs
- Sensitive data masking
- Log aggregation ready (JSON format)

**Log Structure:**
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "requestId": "req-abc-123",
  "userId": "user-456",
  "module": "orders",
  "function": "createOrder",
  "message": "Order created successfully",
  "meta": {
    "orderId": "ORD-2024-0001",
    "customerId": "cust-789"
  }
}
```

#### Audit Service

**Purpose:** Immutable audit trail for compliance

**Features:**
- Automatic audit logging for critical operations
- Change tracking (old value → new value)
- IP address and user agent capture
- Tamper-proof storage
- Searchable audit logs

**Audited Operations:**
- User creation/modification/deletion
- Role assignment changes
- Order approval/cancellation
- Payment recording
- Configuration changes
- Data export operations

---

## Data Models

### Entity Relationship Diagram (Core MVP Entities)

```mermaid
erDiagram
    User ||--o{ Order : creates
    User ||--o{ AuditLog : performs
    User }|--|| Role : has
    
    Customer ||--o{ Order : places
    Customer ||--o{ Contact : has
    
    Order ||--o{ OrderItem : contains
    Order ||--|| Invoice : generates
    Order ||--|| ProductionJob : triggers
    Order ||--o{ DesignFile : has
    Order ||--o{ Timeline : tracks
    
    Product ||--o{ OrderItem : "ordered in"
    Product ||--o{ PricingTier : has
    Product }|--|| Category : belongs_to
    
    ProductionJob }|--|| Machine : assigned_to
    ProductionJob }|--|| User : assigned_to
    ProductionJob ||--o{ MaterialConsumption : consumes
    
    Invoice ||--o{ Payment : has
    
    Material ||--o{ MaterialConsumption : consumed_in
    Material ||--o{ InventoryTransaction : tracked_in
```


### Database Schema (PostgreSQL)

#### Core Tables

**users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
    phone VARCHAR(50),
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
```

**roles**
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data for 7 roles
INSERT INTO roles (name, display_name, permissions) VALUES
('owner', 'Owner', '["all"]'),
('manager', 'Manager', '["orders.*", "production.*", "reports.*"]'),
('designer', 'Designer', '["designs.*", "orders.read"]'),
('production_staff', 'Production Staff', '["production.*", "machines.*"]'),
('warehouse_staff', 'Warehouse Staff', '["inventory.*", "materials.*"]'),
('finance_staff', 'Finance Staff', '["invoices.*", "payments.*"]'),
('customer', 'Customer', '["portal.*", "orders.own"]');
```


**customers**
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    npwp VARCHAR(15) UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    industry VARCHAR(100),
    tags JSONB DEFAULT '[]',
    loyalty_tier VARCHAR(20) NOT NULL DEFAULT 'bronze' 
        CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    average_order_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    lifetime_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    customer_since DATE NOT NULL DEFAULT CURRENT_DATE,
    last_order_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_npwp ON customers(npwp) WHERE npwp IS NOT NULL;
CREATE INDEX idx_customers_loyalty_tier ON customers(loyalty_tier);
CREATE INDEX idx_customers_company_name ON customers USING gin(to_tsvector('english', company_name));
```

**contacts** (Customer contact persons)
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_customer_id ON contacts(customer_id);
```


**products**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    base_price DECIMAL(15,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'pcs',
    status VARCHAR(20) NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'discontinued')),
    specifications JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    total_orders INTEGER DEFAULT 0,
    total_quantity INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
```

**categories**
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

**pricing_tiers** (Quantity-based pricing)
```sql
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    unit_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pricing_tiers_product_id ON pricing_tiers(product_id);
```


**orders**
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    created_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'pending_approval', 'approved', 'in_production', 
                         'quality_check', 'completed', 'delivered', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' 
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    notes TEXT,
    cancellation_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_created_by ON orders(created_by);
```

**order_items**
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    specifications JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```


**design_files**
```sql
CREATE TABLE design_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'uploaded' 
        CHECK (status IN ('uploaded', 'ai_check', 'manual_review', 'approved', 
                         'rejected', 'revision_required')),
    thumbnail_path TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_design_files_order_id ON design_files(order_id);
CREATE INDEX idx_design_files_status ON design_files(status);
CREATE INDEX idx_design_files_uploaded_by ON design_files(uploaded_by);
```

**machines**
```sql
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'available' 
        CHECK (status IN ('available', 'in_use', 'maintenance', 'broken', 'offline')),
    location VARCHAR(100),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_production_time INTEGER DEFAULT 0,
    total_idle_time INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_machines_status ON machines(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_machines_type ON machines(type);
```


**production_jobs**
```sql
CREATE TABLE production_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    machine_id UUID REFERENCES machines(id),
    assigned_to UUID REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'queue' 
        CHECK (status IN ('queue', 'assigned', 'in_progress', 'quality_check', 
                         'completed', 'failed')),
    estimated_duration INTEGER,
    actual_duration INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    quality_check_passed BOOLEAN,
    quality_notes TEXT,
    parent_job_id UUID REFERENCES production_jobs(id),
    is_rework BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_production_jobs_job_number ON production_jobs(job_number);
CREATE INDEX idx_production_jobs_order_id ON production_jobs(order_id);
CREATE INDEX idx_production_jobs_status ON production_jobs(status);
CREATE INDEX idx_production_jobs_machine_id ON production_jobs(machine_id);
CREATE INDEX idx_production_jobs_assigned_to ON production_jobs(assigned_to);
```

**materials**
```sql
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL,
    current_stock DECIMAL(15,3) NOT NULL DEFAULT 0,
    minimum_stock DECIMAL(15,3) NOT NULL DEFAULT 0,
    maximum_stock DECIMAL(15,3),
    unit_cost DECIMAL(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_materials_sku ON materials(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_materials_low_stock ON materials(current_stock) 
    WHERE current_stock <= minimum_stock AND deleted_at IS NULL;
```


**material_consumptions**
```sql
CREATE TABLE material_consumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_job_id UUID NOT NULL REFERENCES production_jobs(id),
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity_consumed DECIMAL(15,3) NOT NULL,
    recorded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_material_consumptions_production_job_id 
    ON material_consumptions(production_job_id);
CREATE INDEX idx_material_consumptions_material_id 
    ON material_consumptions(material_id);
```

**inventory_transactions**
```sql
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id),
    transaction_type VARCHAR(20) NOT NULL 
        CHECK (transaction_type IN ('receipt', 'consumption', 'adjustment', 
                                     'transfer', 'return')),
    quantity DECIMAL(15,3) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    performed_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_material_id 
    ON inventory_transactions(material_id);
CREATE INDEX idx_inventory_transactions_created_at 
    ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inventory_transactions_reference 
    ON inventory_transactions(reference_type, reference_id);
```


**invoices**
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'sent', 'partially_paid', 'fully_paid', 
                         'overdue', 'cancelled')),
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    outstanding_balance DECIMAL(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    pdf_path TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) 
    WHERE status IN ('sent', 'partially_paid', 'overdue');
```

**payments**
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL 
        CHECK (payment_method IN ('bank_transfer', 'cash', 'credit_card', 
                                   'debit_card', 'e_wallet')),
    reference_number VARCHAR(100),
    payment_date DATE NOT NULL,
    recorded_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
```


**timelines**
```sql
CREATE TABLE timelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    performed_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timelines_entity ON timelines(entity_type, entity_id, created_at DESC);
```

**audit_logs**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

**refresh_tokens**
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token) 
    WHERE revoked_at IS NULL;
```


### Database Design Considerations

**Normalization**: All tables are in 3NF (Third Normal Form) to eliminate data redundancy

**Soft Delete**: Key entities use `deleted_at` timestamp for soft delete pattern allowing data recovery

**JSONB Usage**: Flexible fields (specifications, metadata, tags) use PostgreSQL JSONB for schema flexibility

**Indexing Strategy**:
- Primary keys (UUID) with automatic indexing
- Foreign keys indexed for join performance
- Status columns for frequent filtering
- Full-text search indexes (gin) for text columns
- Partial indexes for specific query patterns
- Composite indexes for multi-column queries

**UUID vs Auto-increment**: UUID used for distributed-ready design and security (no sequential guessing)

**Timestamps**: All tables include `created_at` and `updated_at` with automatic triggers

**Check Constraints**: Enum-like fields use CHECK constraints for data integrity

---

## API Design

### API Architecture

**Base URL**: `https://api.multikreasi.com/api/v1`

**Authentication**: Bearer JWT token in Authorization header

**Versioning**: URL path versioning (`/api/v1`, `/api/v2`)

**Response Format**: Consistent JSON structure

```typescript
// Success Response
{
  "success": true,
  "data": {...} | [...],
  "message": "Operation completed successfully",
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "totalRecords": 150,
      "totalPages": 6
    }
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```


### Core API Endpoints (MVP)

#### Authentication APIs

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

**Example: Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "manager@multikreasi.com",
  "password": "SecurePass123"
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "email": "manager@multikreasi.com",
      "fullName": "John Manager",
      "role": "manager",
      "permissions": ["orders.*", "production.*"]
    }
  }
}
```

#### User Management APIs

```
GET    /api/v1/users                    # List users with pagination
POST   /api/v1/users                    # Create user
GET    /api/v1/users/:id                # Get user details
PATCH  /api/v1/users/:id                # Update user
DELETE /api/v1/users/:id                # Soft delete user
POST   /api/v1/users/:id/activate       # Activate user
POST   /api/v1/users/:id/deactivate     # Deactivate user
PATCH  /api/v1/users/:id/role           # Assign role
```


#### Customer APIs

```
GET    /api/v1/customers                # List customers
POST   /api/v1/customers                # Create customer
GET    /api/v1/customers/:id            # Get customer details
PATCH  /api/v1/customers/:id            # Update customer
DELETE /api/v1/customers/:id            # Soft delete customer
GET    /api/v1/customers/:id/orders     # Get customer orders
GET    /api/v1/customers/:id/metrics    # Get customer metrics
POST   /api/v1/customers/:id/contacts   # Add contact person
```

#### Product APIs

```
GET    /api/v1/products                 # List products
POST   /api/v1/products                 # Create product
GET    /api/v1/products/:id             # Get product details
PATCH  /api/v1/products/:id             # Update product
DELETE /api/v1/products/:id             # Soft delete product
POST   /api/v1/products/:id/images      # Upload product image
DELETE /api/v1/products/:id/images/:imageId  # Delete product image
GET    /api/v1/products/:id/pricing     # Get pricing tiers
POST   /api/v1/products/:id/pricing     # Create pricing tier
GET    /api/v1/categories               # List categories
POST   /api/v1/categories               # Create category
```

#### Order APIs

```
GET    /api/v1/orders                   # List orders
POST   /api/v1/orders                   # Create order
GET    /api/v1/orders/:id               # Get order details
PATCH  /api/v1/orders/:id               # Update order
DELETE /api/v1/orders/:id               # Cancel order
POST   /api/v1/orders/:id/approve       # Approve order
POST   /api/v1/orders/:id/items         # Add order item
DELETE /api/v1/orders/:id/items/:itemId # Remove order item
GET    /api/v1/orders/:id/timeline      # Get order timeline
```


#### Design File APIs

```
GET    /api/v1/design-files             # List design files
POST   /api/v1/design-files             # Upload design file
GET    /api/v1/design-files/:id         # Get file details
DELETE /api/v1/design-files/:id         # Delete file
GET    /api/v1/design-files/:id/download # Download file
POST   /api/v1/design-files/:id/approve # Approve design
POST   /api/v1/design-files/:id/reject  # Reject design
GET    /api/v1/orders/:orderId/designs  # Get order design files
```

#### Production APIs

```
GET    /api/v1/production/jobs          # List production jobs
POST   /api/v1/production/jobs          # Create job (auto from order)
GET    /api/v1/production/jobs/:id      # Get job details
PATCH  /api/v1/production/jobs/:id      # Update job
POST   /api/v1/production/jobs/:id/assign    # Assign to machine/staff
POST   /api/v1/production/jobs/:id/start     # Start production
POST   /api/v1/production/jobs/:id/complete  # Complete production
POST   /api/v1/production/jobs/:id/fail      # Fail quality check
POST   /api/v1/production/jobs/:id/materials # Record material consumption
GET    /api/v1/production/queue         # Get production queue
GET    /api/v1/machines                 # List machines
GET    /api/v1/machines/:id             # Get machine details
PATCH  /api/v1/machines/:id             # Update machine
```

#### Finance APIs

```
GET    /api/v1/invoices                 # List invoices
POST   /api/v1/invoices                 # Create invoice (auto from order)
GET    /api/v1/invoices/:id             # Get invoice details
PATCH  /api/v1/invoices/:id             # Update invoice
POST   /api/v1/invoices/:id/send        # Send invoice to customer
GET    /api/v1/invoices/:id/pdf         # Download invoice PDF
POST   /api/v1/invoices/:id/payments    # Record payment
GET    /api/v1/payments                 # List payments
GET    /api/v1/payments/:id             # Get payment details
```


#### Dashboard APIs

```
GET    /api/v1/dashboard/metrics        # Get dashboard metrics
GET    /api/v1/dashboard/revenue-chart  # Get revenue trend data
GET    /api/v1/dashboard/order-stats    # Get order statistics
GET    /api/v1/dashboard/production-status  # Get production status
GET    /api/v1/dashboard/kpis           # Get KPI metrics
```

#### Customer Portal APIs

```
GET    /api/v1/portal/orders            # Customer's orders
GET    /api/v1/portal/orders/:id        # Order details
POST   /api/v1/portal/orders/:id/designs # Upload design
GET    /api/v1/portal/invoices          # Customer's invoices
GET    /api/v1/portal/invoices/:id/pdf  # Download invoice
GET    /api/v1/portal/profile           # Customer profile
PATCH  /api/v1/portal/profile           # Update profile
```

### API Query Parameters

**Pagination**:
```
?page=1&pageSize=25
```

**Filtering**:
```
?status=approved&priority=high&customerId=uuid
```

**Sorting**:
```
?sortBy=createdAt&sortOrder=desc
```

**Search**:
```
?search=banner
```

**Date Range**:
```
?startDate=2024-01-01&endDate=2024-01-31
```

### HTTP Status Codes

- `200 OK`: Successful GET, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `422 Unprocessable Entity`: Business logic error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error


---

## Security Architecture

### OWASP Top 10 Mitigation

#### 1. Injection Prevention

**SQL Injection**:
- Prisma ORM with parameterized queries exclusively
- No raw SQL queries in application code
- Input validation on all user inputs

**NoSQL Injection** (for JSONB fields):
- JSON schema validation
- Type checking on JSONB queries
- Whitelist approach for dynamic queries

#### 2. Broken Authentication

**Implementation**:
- bcrypt password hashing (10+ salt rounds)
- JWT tokens with short expiration (24 hours)
- Refresh token rotation
- Session revocation on logout
- Login attempt rate limiting (5 attempts per 15 minutes)
- Password complexity requirements enforced

**Password Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: 1 special character

#### 3. Sensitive Data Exposure

**Encryption at Rest**:
- PostgreSQL database encryption
- AES-256 encryption for sensitive fields
- Password hashing with bcrypt

**Encryption in Transit**:
- HTTPS/TLS 1.2+ mandatory in production
- Secure cookie flags (HttpOnly, Secure, SameSite)
- HSTS header enabled

**Data Masking**:
- Passwords never returned in API responses
- Sensitive data masked in logs
- PII anonymization in audit logs after retention period


#### 4. XML External Entities (XXE)

**Prevention**:
- XML parsing disabled by default
- JSON used as primary data format
- If XML needed: disable external entity processing

#### 5. Broken Access Control

**RBAC Implementation**:
- Role-based permissions stored in database
- Permission check on every protected endpoint
- Resource ownership validation (users can only access their own data)
- Guard decorators for endpoint protection

**Permission Structure**:
```typescript
{
  "owner": ["all"],
  "manager": [
    "orders.*",
    "production.*", 
    "reports.*",
    "users.read"
  ],
  "designer": [
    "designs.*",
    "orders.read"
  ],
  "customer": [
    "portal.*",
    "orders.own"
  ]
}
```

#### 6. Security Misconfiguration

**Hardening**:
- Security headers via Helmet.js
- CORS configuration with whitelist
- Environment-based configuration
- Secrets in environment variables only
- Error messages sanitized (no stack traces in production)
- Default credentials changed
- Unnecessary features disabled

**Security Headers**:
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```


#### 7. Cross-Site Scripting (XSS)

**Prevention**:
- React automatic escaping of rendered content
- DOMPurify for sanitizing rich text content
- Content-Security-Policy header
- Input validation on all user inputs
- Output encoding for dynamic content

#### 8. Insecure Deserialization

**Prevention**:
- JSON parsing with schema validation
- No eval() or unsafe deserialization
- DTO validation using class-validator
- Type checking on all inputs

#### 9. Using Components with Known Vulnerabilities

**Prevention**:
- npm audit in CI/CD pipeline
- Dependabot automated updates
- Regular dependency updates
- Security patch monitoring

#### 10. Insufficient Logging & Monitoring

**Implementation**:
- Structured logging with Winston
- Security event logging (failed logins, unauthorized access)
- Audit trail for all critical operations
- Error tracking and alerting
- Performance monitoring
- Health check endpoints

### Rate Limiting

**Implementation**: Express Rate Limit with Redis store

**Limits**:
- Global: 1000 requests per 15 minutes per IP
- Authentication: 5 login attempts per 15 minutes per IP
- API per user: 100 requests per minute
- File upload: 10 uploads per hour per user


### File Upload Security

**Validation**:
- File type whitelist (PSD, AI, PDF, JPG, PNG, SVG)
- File size limit: 100 MB per file
- MIME type verification
- File extension validation
- Magic number verification (file signature)

**Malware Scanning**:
- ClamAV integration for virus scanning
- Scan before storage
- Quarantine suspicious files

**Storage Security**:
- Files stored outside web root
- Pre-signed URLs for downloads (time-limited)
- Original filename sanitization
- Random filename generation on storage

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant Redis

    Client->>API: POST /auth/login (email, password)
    API->>DB: Query user by email
    DB-->>API: User data
    API->>API: Verify password (bcrypt)
    API->>API: Generate JWT access token (24h)
    API->>API: Generate refresh token (7d)
    API->>DB: Store refresh token
    API->>Redis: Cache user permissions
    API-->>Client: Return tokens + user data
    
    Client->>API: GET /orders (Authorization: Bearer <token>)
    API->>API: Verify JWT signature
    API->>Redis: Get cached permissions
    API->>API: Check permissions
    API->>DB: Query orders
    DB-->>API: Orders data
    API-->>Client: Return orders
```


---

## Correctness Properties

**Note**: Property-Based Testing (PBT) is not applicable to this system. This section explains why PBT doesn't apply and provides alternative testing recommendations.

### Why Property-Based Testing Is Not Applicable

After analyzing the system requirements and architecture, **Property-Based Testing (PBT) is NOT appropriate for this platform**. PBT works best for pure functions with universal properties across wide input spaces (parsers, serializers, algorithms). This system is fundamentally different:

**1. Infrastructure as Code and Configuration**
- Database schema and migrations (PostgreSQL)
- Caching configuration (Redis)
- Web server setup (Nginx, PM2)
- File storage organization
- **Assessment**: These are declarative configurations, not functions with varying inputs. Use **snapshot tests** and **infrastructure tests** instead.

**2. CRUD-Dominant Business Operations**
- User management (create, update, deactivate)
- Customer profiles (store, search, update metrics)
- Order lifecycle (draft, approval, production, completion)
- Product catalog (add, update, categorize)
- Invoice generation and payment recording
- **Assessment**: CRUD operations have well-defined state transitions. Use **example-based unit tests** and **integration tests** with specific scenarios.

**3. External Service Integrations**
- SMTP email delivery
- Socket.IO real-time notifications
- BullMQ background job processing
- File system I/O operations
- **Assessment**: External service behavior is deterministic and doesn't vary meaningfully with inputs. Use **mock-based unit tests** and **integration tests** with real services.

**4. UI Rendering and User Workflows**
- React component rendering
- Dashboard widgets and charts
- Form submissions and validation
- Multi-step approval workflows
- **Assessment**: UI behavior is better validated visually. Use **snapshot tests**, **visual regression tests**, and **E2E tests** for user journeys.

**5. Side-Effect-Only Operations**
- Sending email notifications
- Recording audit logs
- PDF generation (invoices, quotations)
- Event emission
- **Assessment**: Side-effect operations have no return values to test universal properties on. Use **mock verification** and **integration tests**.

### Recommended Testing Strategy

Since PBT does not apply, use this comprehensive testing approach:

#### 1. Unit Tests (60% of test suite)
- Business logic in use cases and services
- Input validation and data transformation
- Calculation functions (order totals, tax, discounts, metrics)
- Permission checks and authorization logic
- Focus on **specific examples** and **edge cases**

**Example Testable Units**:
```typescript
// Order calculation logic
describe('OrderCalculationService', () => {
  it('should calculate order total with tax and discount', () => {
    const subtotal = 1000000;
    const discount = 10; // 10%
    const taxRate = 11; // 11%
    const result = calculateOrderTotal(subtotal, discount, taxRate);
    expect(result).toBe(999900); // (1000000 * 0.9 * 1.11)
  });
});

// NPWP validation
describe('validateNPWP', () => {
  it('should accept valid 15-digit NPWP', () => {
    expect(validateNPWP('123456789012345')).toBe(true);
  });
  
  it('should reject NPWP with less than 15 digits', () => {
    expect(validateNPWP('12345')).toBe(false);
  });
});

// Loyalty tier assignment
describe('CustomerLoyaltyService', () => {
  it('should assign Bronze tier for revenue < 10M', () => {
    expect(calculateLoyaltyTier(5000000)).toBe('bronze');
  });
  
  it('should assign Silver tier for revenue 10M-50M', () => {
    expect(calculateLoyaltyTier(30000000)).toBe('silver');
  });
});
```

**2. Integration Tests (30% coverage target)**
- API endpoint testing with real database (test instance)
- Database transactions and rollback behavior
- Authentication and authorization flows
- File upload and storage operations
- Background job processing
- Event emission and handling

**Example Integration Tests**:
```typescript
describe('Order API Integration', () => {
  it('POST /api/v1/orders should create order and emit event', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${managerToken}`)
      .send(createOrderDto);
    
    expect(response.status).toBe(201);
    expect(response.body.data.orderNumber).toMatch(/ORD-\d{4}-\d{4}/);
    
    // Verify order in database
    const order = await orderRepo.findByNumber(response.body.data.orderNumber);
    expect(order).toBeDefined();
    
    // Verify event was emitted
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'OrderCreated' })
    );
  });
  
  it('should require approval for order > 2M IDR', async () => {
    const highValueOrder = { ...createOrderDto, total: 3000000 };
    const response = await request(app)
      .post('/api/v1/orders')
      .send(highValueOrder);
    
    expect(response.body.data.status).toBe('pending_approval');
  });
});
```

**3. End-to-End Tests (10% coverage target)**
- Complete user journeys through UI
- Multi-step workflows: Order → Production → Invoice → Payment
- Authentication flows
- File upload and download
- Real-time updates via Socket.IO

**Example E2E Tests**:
```typescript
test('Complete order workflow', async ({ page }) => {
  // Login as manager
  await page.goto('/login');
  await page.fill('[name="email"]', 'manager@multikreasi.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Create order
  await page.goto('/orders/new');
  await page.selectOption('[name="customer"]', customerUUID);
  await page.click('button:text("Add Product")');
  await page.selectOption('[name="product"]', productUUID);
  await page.fill('[name="quantity"]', '100');
  await page.click('button:text("Submit Order")');
  
  // Verify order appears in list
  await page.goto('/orders');
  await expect(page.locator('.order-number').first()).toBeVisible();
  
  // Approve order
  await page.click('.order-row:first-child a:text("View")');
  await page.click('button:text("Approve")');
  
  // Verify production job created
  await page.goto('/production');
  await expect(page.locator('.production-job')).toHaveCount(1);
});
```

**4. Schema Validation Tests**
- Database schema integrity
- API contract testing with OpenAPI spec
- DTO validation with class-validator

**5. Snapshot Tests**
- Configuration files (nginx.conf, ecosystem.config.js)
- Database migration files
- API response structures

**6. Security Tests**
- Authentication bypass attempts
- Authorization boundary testing
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting behavior

**7. Performance Tests**
- Load testing for API endpoints
- Database query performance
- Caching effectiveness
- File upload handling under load

#### Critical Test Scenarios

The following scenarios must have comprehensive test coverage:

**Authentication & Authorization**
- Valid/invalid credentials
- Token expiration and refresh
- Role-based access control
- Session management

**Order Workflow**
- Order creation with various statuses
- Approval routing based on value thresholds
- Production job auto-creation
- Invoice auto-generation
- Timeline tracking

**Financial Calculations**
- Order total: subtotal + tax + shipping - discount
- Invoice: partial payments and outstanding balance
- Customer metrics: lifetime value, average order value
- Loyalty tier assignment based on revenue

**Inventory Management**
- Stock level updates on consumption
- Low stock alerts
- Negative inventory prevention
- Material consumption tracking

**File Management**
- Upload validation (type, size)
- Malware scanning simulation
- Thumbnail generation
- Version control

**Workflow State Transitions**
- Valid state transitions (e.g., Draft → Pending_Approval → Approved)
- Invalid transition prevention (e.g., Completed → Draft)
- Status change event emission
- Timeline recording

**Data Integrity**
- Unique constraint enforcement (SKU, email, order number)
- Foreign key relationships
- Cascading deletes and soft deletes
- Audit log immutability

#### Testing Frameworks and Tools

**Unit & Integration Testing**
- **Framework**: Jest + ts-jest
- **API Testing**: Supertest
- **Database**: Separate test database with automated cleanup
- **Mocking**: jest.mock() for external dependencies

**E2E Testing**
- **Framework**: Playwright
- **Browser**: Chromium, Firefox, WebKit
- **Test Database**: Isolated test instance with seed data

**Contract Testing**
- **Tool**: jest-openapi for API contract validation
- **Specification**: OpenAPI 3.0 schema

**Coverage Tools**
- **Istanbul/nyc** for code coverage reporting
- **Minimum Coverage**: 70% for business logic

#### Conclusion

This platform is best tested through a combination of **unit tests**, **integration tests**, **E2E tests**, and **contract tests**. Property-based testing is not applicable because:
- The system is CRUD-focused, not algorithm-focused
- Most operations are deterministic with external dependencies
- Infrastructure and configuration don't benefit from input randomization
- Business workflows are better validated with concrete example scenarios

The recommended approach provides comprehensive coverage while being practical and maintainable for an enterprise business platform.

---

## Error Handling

### Error Categories

**1. Validation Errors (400)**
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      }
    ]
  }
}
```

**2. Authentication Errors (401)**
```typescript
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**3. Authorization Errors (403)**
```typescript
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions to access this resource"
  }
}
```

**4. Not Found Errors (404)**
```typescript
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found",
    "details": {
      "resource": "Order",
      "id": "uuid"
    }
  }
}
```

**5. Business Logic Errors (422)**
```typescript
{
  "success": false,
  "error": {
    "code": "ORDER_CANNOT_BE_CANCELLED",
    "message": "Order cannot be cancelled after production has started",
    "details": {
      "orderId": "uuid",
      "currentStatus": "in_production"
    }
  }
}
```


### Error Handling Strategy

**Exception Filter**: Global exception handler

**Logging**: All errors logged with context

**Error Codes**: Consistent error code naming

**Stack Traces**: Excluded from production responses

**Monitoring**: Error rate alerts

---

## Testing Strategy

### Testing Pyramid

```
                    /\
                   /  \
                  / E2E \           (10%)
                 /--------\
                /          \
               /Integration \       (30%)
              /--------------\
             /                \
            /   Unit Tests     \   (60%)
           /____________________\
```

### Unit Testing

**Scope**: Business logic in use cases and services

**Framework**: Jest + ts-jest

**Coverage Target**: Minimum 70% for business logic

**Patterns**:
- Arrange-Act-Assert
- Mocking with jest.mock()
- Dependency injection for testability

**Example**:
```typescript
describe('CreateOrderUseCase', () => {
  it('should create order and emit OrderCreatedEvent', async () => {
    // Arrange
    const mockRepo = createMockRepository();
    const mockEventBus = createMockEventBus();
    const useCase = new CreateOrderUseCase(mockRepo, mockEventBus);
    
    // Act
    const result = await useCase.execute(createOrderDto);
    
    // Assert
    expect(result.orderNumber).toMatch(/ORD-\d{4}-\d{4}/);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'OrderCreated' })
    );
  });
});
```


### Integration Testing

**Scope**: API endpoints with real database

**Framework**: Jest + Supertest + Test Database

**Setup**: Separate test database instance

**Critical Workflows**:
- Order creation → Production job creation → Invoice generation
- User authentication and authorization
- File upload and storage
- Payment recording and invoice update

### End-to-End Testing

**Scope**: Complete user journeys

**Framework**: Playwright

**Key Scenarios**:
- Manager creates order → Designer approves design → Production completes → Finance records payment
- Customer logs into portal → Uploads design → Tracks order status

### Contract Testing

**Purpose**: Ensure API contracts remain stable

**Implementation**: OpenAPI schema validation

**Tools**: Swagger/OpenAPI + jest-openapi

---

## Infrastructure and Deployment

### Native Deployment Architecture

```
Server Architecture (Native Installation)
├── Nginx (Reverse Proxy & Static Files)
│   ├── Port 80/443 (HTTP/HTTPS)
│   ├── Proxy to Backend (localhost:3000)
│   └── Serve Frontend (static files)
├── NestJS Backend (PM2 Managed)
│   ├── Port 3000
│   ├── Multiple workers (PM2 cluster mode)
│   └── Auto-restart on failure
├── BullMQ Workers (PM2 Managed)
│   └── Background job processing
├── PostgreSQL (Native Service)
│   └── Port 5432
├── Redis (Native Service)
│   ├── Port 6379
│   ├── Development: Memurai Developer Edition (Windows)
│   ├── Production: redis-server (Linux VPS)
│   └── Used for cache & queue
└── Object Storage (Cloud-managed)
    └── Cloudflare R2 (S3-compatible API)
```

### Deployment Configuration

#### PM2 Process Manager

**ecosystem.config.js**:
```javascript
module.exports = {
  apps: [
    {
      name: 'multikreasi-backend',
      script: 'dist/main.js',
      instances: 4,  // Number of CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'multikreasi-worker',
      script: 'dist/worker.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      max_memory_restart: '512M'
    }
  ]
};
```

**PM2 Commands**:
```bash
# Start application
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart all

# Stop application
pm2 stop all

# Setup startup script (auto-start on server reboot)
pm2 startup
pm2 save
```



#### Nginx Configuration

**nginx.conf** (Production):
```nginx
upstream backend {
    least_conn;
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name multikreasi.com www.multikreasi.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name multikreasi.com www.multikreasi.com;

    ssl_certificate /etc/ssl/certs/multikreasi.crt;
    ssl_certificate_key /etc/ssl/private/multikreasi.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React build)
    location / {
        root /var/www/multikreasi/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API requests
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO (real-time)
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads (larger body size)
    location /api/v1/design-files {
        client_max_body_size 100M;
        proxy_pass http://backend;
        proxy_request_buffering off;
    }

    # Static files (uploaded files)
    location /storage/ {
        alias /var/www/storage/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
}
```

#### Environment Variables

**.env.production**:
```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://multikreasi.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/multikreasi_prod
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT
JWT_SECRET=your-very-long-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# Object Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=multikreasi-storage
R2_PUBLIC_URL=https://storage.multikreasi.com
MAX_FILE_SIZE=104857600  # 100MB in bytes

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@multikreasi.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=Multi Kreasi Printing <noreply@multikreasi.com>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=1000

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```


### Installation Guide

#### Prerequisites (Windows/Linux)

**Required Software**:
- Node.js 18+ LTS
- PostgreSQL 15+
- Redis 7+
- Nginx 1.24+
- PM2 (npm install -g pm2)
- Git

#### PostgreSQL Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE multikreasi_prod;
CREATE USER multikreasi WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE multikreasi_prod TO multikreasi;

# Run migrations
cd backend
npm run migration:run
```

#### Redis Setup

**Linux (Production VPS)**:
```bash
# Install redis-server natively
sudo apt-get update
sudo apt-get install redis-server -y

# Start and enable service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Set password
redis-cli
CONFIG SET requirepass "your-redis-password"
CONFIG REWRITE

# Verify installation
redis-cli -a "your-redis-password" ping
# Should return: PONG
```

**Windows (Development)**:
```bash
# Install Memurai Developer Edition (Redis-compatible for Windows)
# Download from https://www.memurai.com/get-memurai

# Or use winget:
winget install Memurai.MemuraiDeveloper

# Memurai automatically runs as a Windows service after installation

# Connect and set password (optional for development)
memurai-cli
CONFIG SET requirepass "your-redis-password"
CONFIG REWRITE

# Verify installation
memurai-cli -a "your-redis-password" ping
# Should return: PONG
```

#### Application Deployment

**Backend Deployment**:
```bash
# 1. Clone repository
git clone https://github.com/your-org/multikreasi-backend.git
cd multikreasi-backend

# 2. Install dependencies
npm ci --production

# 3. Build application
npm run build

# 4. Configure environment
cp .env.example .env.production
# Edit .env.production with production values

# 5. Run database migrations
npm run migration:run

# 6. Seed initial data (roles, admin user)
npm run seed:prod

# 7. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**Frontend Deployment**:
```bash
# 1. Clone repository
git clone https://github.com/your-org/multikreasi-frontend.git
cd multikreasi-frontend

# 2. Install dependencies
npm ci

# 3. Build for production
npm run build

# 4. Copy build files to Nginx directory
cp -r dist/* /var/www/multikreasi/frontend/dist/
```

#### Storage Directory Setup

```bash
# Create storage directories
mkdir -p /var/www/storage/{designs,invoices,quotations,products,thumbnails}

# Set permissions
chown -R www-data:www-data /var/www/storage
chmod -R 755 /var/www/storage
```


### Backup Strategy

#### Database Backup

**Automated Backup Script** (`backup-db.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="multikreasi_prod"
DB_USER="multikreasi"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER -F c -b -v -f "$BACKUP_DIR/${DB_NAME}_${DATE}.backup" $DB_NAME

# Compress backup
gzip "$BACKUP_DIR/${DB_NAME}_${DATE}.backup"

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.backup.gz" -mtime +30 -delete

echo "Backup completed: ${DB_NAME}_${DATE}.backup.gz"
```

**Cron Job** (every 6 hours):
```bash
crontab -e

# Add this line:
0 */6 * * * /path/to/backup-db.sh >> /var/log/db-backup.log 2>&1
```

#### File Storage Backup

**Backup Script** (`backup-storage.sh`):
```bash
#!/bin/bash
STORAGE_DIR="/var/www/storage"
BACKUP_DIR="/var/backups/storage"
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Rsync incremental backup
rsync -av --delete $STORAGE_DIR/ "$BACKUP_DIR/latest/"

# Create daily snapshot
cp -al "$BACKUP_DIR/latest" "$BACKUP_DIR/snapshot_$DATE"

# Delete snapshots older than 7 days
find $BACKUP_DIR -name "snapshot_*" -mtime +7 -exec rm -rf {} \;

echo "Storage backup completed: snapshot_$DATE"
```

**Cron Job** (daily at 2 AM):
```bash
0 2 * * * /path/to/backup-storage.sh >> /var/log/storage-backup.log 2>&1
```


### Monitoring and Health Checks

#### Application Health Check

**Health Check Endpoint**: `GET /api/v1/health`

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  },
  "uptime": 3600,
  "memory": {
    "used": "512MB",
    "total": "2GB"
  }
}
```

#### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 status

# Logs
pm2 logs multikreasi-backend --lines 100

# Restart on high memory
pm2 start ecosystem.config.js --max-memory-restart 1G
```

#### Log Management

**Log Rotation** (`/etc/logrotate.d/multikreasi`):
```
/var/www/multikreasi/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```


### CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run tests
        run: npm run test
        
      - name: Run build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /var/www/multikreasi/backend
            git pull origin main
            npm ci --production
            npm run build
            npm run migration:run
            pm2 reload ecosystem.config.js
            
      - name: Verify Deployment
        run: |
          sleep 10
          curl -f https://multikreasi.com/api/v1/health || exit 1
```


### Security Checklist

**Pre-Production**:
- [ ] All environment variables configured
- [ ] Database credentials secured
- [ ] SSL certificate installed and configured
- [ ] Firewall rules configured (close unnecessary ports)
- [ ] Redis password set
- [ ] File upload limits configured
- [ ] Rate limiting enabled
- [ ] CORS whitelist configured
- [ ] Security headers enabled
- [ ] Error messages sanitized (no stack traces)
- [ ] Default admin password changed
- [ ] npm audit passed (no critical vulnerabilities)
- [ ] Backup scripts tested and scheduled
- [ ] Monitoring and alerting configured

**Firewall Rules** (UFW - Linux):
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

**Database Security**:
```sql
-- Restrict PostgreSQL to localhost only
-- Edit postgresql.conf:
-- listen_addresses = 'localhost'

-- Restrict access in pg_hba.conf:
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```


### Performance Optimization

#### Database Indexing

Ensure all critical indexes are created:
```sql
-- Check missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;

-- Create indexes based on query patterns
CREATE INDEX CONCURRENTLY idx_orders_customer_status 
    ON orders(customer_id, status) 
    WHERE deleted_at IS NULL;
```

#### Redis Caching Strategy

**Cache Keys TTL**:
```typescript
const CACHE_TTL = {
  PRODUCT_CATALOG: 1800,      // 30 minutes
  DASHBOARD_METRICS: 300,     // 5 minutes
  USER_PERMISSIONS: 3600,     // 1 hour
  CUSTOMER_PROFILE: 600,      // 10 minutes
};
```

#### Nginx Caching

```nginx
# Static asset caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API response caching (optional for specific endpoints)
location /api/v1/products {
    proxy_pass http://backend;
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
}
```


### Troubleshooting Guide

#### Application Won't Start

```bash
# Check PM2 logs
pm2 logs multikreasi-backend --err

# Check database connection
psql -U multikreasi -d multikreasi_prod -c "SELECT 1;"

# Check Redis connection
redis-cli -a your-password ping

# Check port availability
netstat -tuln | grep 3000
```

#### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart multikreasi-backend

# Check for memory leaks
node --inspect dist/main.js
# Use Chrome DevTools for profiling
```

#### Slow API Responses

```bash
# Check database slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Check Redis latency
redis-cli --latency

# Check Nginx access logs
tail -f /var/log/nginx/access.log | grep "request_time"
```


---

## Scalability Considerations

### Horizontal Scaling

**Load Balancing** (Multiple Backend Instances):
```nginx
upstream backend {
    least_conn;
    server 127.0.0.1:3000 weight=3;
    server 127.0.0.1:3001 weight=3;
    server 127.0.0.1:3002 weight=2;
    keepalive 32;
}
```

**PM2 Cluster Mode**:
```javascript
// ecosystem.config.js
{
  instances: 'max',  // Use all CPU cores
  exec_mode: 'cluster'
}
```

### Database Scaling

**Read Replicas** (Future):
```
Master (Write) → Replica 1 (Read)
              → Replica 2 (Read)
```

**Connection Pooling**:
```javascript
// Prisma configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection pool settings in DATABASE_URL
postgresql://user:password@localhost:5432/dbname?
  connection_limit=20&
  pool_timeout=10&
  connect_timeout=10
```

### Caching Strategy

**Multi-Layer Cache**:
1. Application memory (in-process)
2. Redis (distributed)
3. Database query result cache

**Cache Invalidation**:
- Event-based invalidation on data changes
- Time-based expiration (TTL)
- Manual invalidation for critical updates


---

## Maintenance Procedures

### Routine Maintenance

**Weekly**:
- Review application logs for errors
- Check disk space usage
- Review slow query logs
- Verify backup integrity

**Monthly**:
- Update dependencies (security patches)
- Database vacuum and analyze
- Review and optimize indexes
- Load testing

**Quarterly**:
- Full security audit
- Performance testing and optimization
- Disaster recovery drill
- Documentation review

### Database Maintenance

```bash
# Vacuum and analyze
psql -U multikreasi -d multikreasi_prod -c "VACUUM ANALYZE;"

# Reindex
psql -U multikreasi -d multikreasi_prod -c "REINDEX DATABASE multikreasi_prod;"

# Check database size
psql -U multikreasi -d multikreasi_prod -c "
SELECT 
    pg_size_pretty(pg_database_size('multikreasi_prod')) as db_size;
"
```

### Updating the Application

```bash
# 1. Backup database
./backup-db.sh

# 2. Pull latest code
cd /var/www/multikreasi/backend
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Run migrations
npm run migration:run

# 5. Build application
npm run build

# 6. Reload PM2
pm2 reload ecosystem.config.js

# 7. Verify health
curl https://multikreasi.com/api/v1/health
```


---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation  
**Next Phase**: Task Breakdown

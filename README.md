# Multi Kreasi Printing (MKP) Enterprise Digital Platform

Multi Kreasi Printing (MKP) is an enterprise-grade digital platform designed to manage and scale commercial printing operations. This platform handles everything from product catalog management, order processing, and customer relationship management to invoice generation and automated background jobs. 

Designed for high availability and performance, the system is capable of handling hundreds of thousands of daily requests through a robust architecture utilizing a modern technology stack.

## System Architecture Overview

The system follows a decoupled architecture, divided into a RESTful Backend and a Single Page Application (SPA) Frontend.

- **Backend (API Service):** Built with NestJS, providing a robust, modular, and scalable foundation. It uses Prisma as the ORM to communicate with a PostgreSQL database. Redis is heavily utilized for caching, rate limiting, session management, and background job queuing (via BullMQ).
- **Frontend (Client Application):** Built with React 19 and Vite, ensuring fast build times and a highly responsive user interface. State management and form handling are optimized with React Hook Form and Zod for strict type validation. Styling is powered by Tailwind CSS 4.
- **Infrastructure & Scaling:** Designed for deployment on PM2 cluster mode with Nginx as a reverse proxy. It incorporates Cloudflare R2 (AWS S3 compatible) for scalable object storage, managing large design files.

## Technology Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Caching & Message Broker:** Redis
- **Background Jobs:** BullMQ
- **File Storage:** AWS S3 SDK (Compatible with Cloudflare R2)
- **Document Generation:** PDFKit (for invoices and reports)
- **Real-time Communication:** Socket.IO
- **Security:** Helmet, Throttler (Redis-backed), JWT Authentication, bcrypt
- **Logging:** Winston (Structured JSON logging with daily rotation)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS 4
- **Form Management:** React Hook Form with Zod Resolvers
- **Data Visualization:** Recharts
- **Drag and Drop:** @dnd-kit

### Testing & Quality Assurance
- **Unit & Integration Testing:** Vitest (Backend and Frontend)
- **Load Testing:** k6 (Capable of simulating 100+ concurrent virtual users)
- **Code Quality:** ESLint, Prettier, Oxlint, Husky (Pre-commit hooks)

## Key Features

- **Comprehensive Dashboard:** Real-time metrics and data visualization.
- **Order Management System:** End-to-end tracking of printing orders, from submission to delivery.
- **Automated Invoice Generation:** Background processing of PDF invoices using PDFKit and BullMQ, delivered via email.
- **Secure File Handling:** Upload and manage large design assets (up to 100MB) securely using pre-signed URLs and Cloudflare R2.
- **Role-Based Access Control (RBAC):** Strict permission segregation between Admin, Staff, and Customer roles.
- **High Performance:** Sub-200ms p95 API response times, supported by Redis caching and database connection pooling.

## Prerequisites

To run this project locally, ensure you have the following installed:
- Node.js (v20 or higher recommended)
- PostgreSQL (v14 or higher)
- Redis Server (Required for production, highly recommended for local development)
- Git

## Getting Started (Local Development)

The application requires the Backend to be running before the Frontend can successfully connect.

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your PostgreSQL and Redis credentials.
4. Run database migrations and seed data:
   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```
   *The backend will be available at `http://localhost:3000`.*

### 2. Frontend Setup

1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

### 3. Testing the Application

Default Admin Credentials (if seeded):
- **Email:** `admin@mkprinting.com`
- **Password:** `Admin@123!`

For more detailed instructions, please refer to the `RUNNING_GUIDE.md`.

## Production Readiness

The platform is designed to scale up to 100K - 500K daily requests. Key production configurations include:

- **PM2 Cluster Mode:** Utilizing all available CPU cores for maximum throughput.
- **Nginx Reverse Proxy:** Handling SSL termination, gzip compression, and serving static assets.
- **Redis Requirement:** Mandatory in production for shared rate limiting across cluster workers and robust BullMQ job processing.
- **Zero-Downtime Deployment:** CI/CD pipelines enforce testing before deployment, executing graceful PM2 reloads.
- **Connection Pooling:** Dynamic configuration via environment variables to prevent database exhaustion.

For a detailed breakdown of the production architecture, read `PRODUCTION_READINESS.md`.

## Documentation Index

- `RUNNING_GUIDE.md` - Detailed guide for local setup and troubleshooting.
- `PRODUCTION_READINESS.md` - Architecture, capacity estimation, and infrastructure tasks.
- `TEST_REPORT.md` - Results of QA testing, unit tests, and coverage.
- `qa-test.md` - Manual QA checklist and results.
- `feature-gap-analysis.md` - Roadmap and missing features tracking.
- `TROUBLESHOOTING.md` - Common issues and resolutions.
- `COMMIT_GUIDE.md` - Guidelines for structured and conventional commits.
- `GEMINI.md` - AI agent instructions and project persona definitions.

## Security

Security is a primary concern in this project:
- No hardcoded credentials; all secrets are managed via environment variables.
- Strict Rate Limiting using `@nestjs/throttler-storage-redis`.
- Helmet middleware for HTTP header security.
- Parameter validation at the controller level using `class-validator` and `zod`.
- Prepared statements via Prisma ORM to prevent SQL Injection.

## License

This project is proprietary and confidential. Unauthorized copying of these files, via any medium, is strictly prohibited.

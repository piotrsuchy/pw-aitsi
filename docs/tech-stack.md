# Technology Stack

The Local Archive is built using a modern, full-stack JavaScript ecosystem centered around Next.js. This stack was selected for its strong developer experience, end-to-end type safety, performance, and robust ecosystem.

## Core Stack

### 1. Framework: Next.js (App Router)

- **Version:** 15.x / 16.x
- **Why:** Next.js provides hybrid rendering (Server Components and Client Components). Server Components allow direct database access without building a separate backend, resulting in less boilerplate and faster page loads. The App Router simplifies routing and layouts.

### 2. UI & Styling: React & TailwindCSS

- **Version:** React 19, TailwindCSS 4
- **Why:** React is the industry standard for component-based UIs. TailwindCSS enables rapid prototyping and styling through utility classes, keeping CSS bundle sizes small and enforcing a consistent design system (colors, spacing, themes) directly in the markup.

### 3. Database & ORM: PostgreSQL & Prisma

- **Why PostgreSQL:** A robust, relational database perfect for structured data with complex relationships (users, hierarchical categories, tags, photos).
- **Why Prisma:** Prisma provides a type-safe database client. It automatically generates TypeScript types based on the schema, catching database query errors at compile time rather than runtime.

### 4. Authentication: NextAuth.js (Auth.js)

- **Version:** v5 (Beta)
- **Why:** NextAuth provides secure, out-of-the-box OAuth integration (Google). The application utilizes the JWT strategy, making it compatible with Next.js Edge Middleware for instantaneous route protection and blocking malicious users before the page renders.

## Tooling & Quality Assurance

### 1. Testing: Vitest

- **Why:** Vitest is a fast, Vite-native testing framework that is compatible with Next.js. It is used to test API routes and critical backend logic.

### 2. Accessibility: axe-core

- **Why:** Automated accessibility auditing via the `@axe-core/cli` ensures that the application continuously meets WCAG 2.1 AA standards during development.

### 3. Containerization: Docker

- **Why:** `docker-compose` is used to spin up a local PostgreSQL database and pgAdmin interface seamlessly, ensuring uniform development environments across different machines.

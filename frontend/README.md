# ⚡ Nexus — Enterprise React Boilerplate

A production-grade, enterprise-quality React 19 frontend boilerplate inspired by the design standards of Stripe, Linear, and Vercel. Built to serve as the foundation for billion-dollar SaaS products.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 5 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 + CSS Variables |
| Animation | Framer Motion 11 |
| State | Zustand 4 (with Immer + DevTools) |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| HTTP | Axios + interceptors + auto token refresh |
| Routing | React Router v6 (lazy + code-split) |
| Auth | JWT + RBAC (Role-Based Access Control) |
| i18n | i18next + react-i18next |
| Testing | Vitest + React Testing Library + MSW |
| Mocking | MSW (Mock Service Worker) v2 |
| Linting | ESLint (strict) + Prettier |
| Git hooks | Husky + lint-staged |

---

## 📁 Project Structure

```
src/
├── features/              # Modular feature slices (domain-driven)
│   ├── auth/
│   │   ├── __tests__/     # Co-located tests
│   │   ├── components/    # LoginPage, RegisterPage, ForgotPasswordPage
│   │   ├── hooks/         # useLogin, useLogout, useRegister, useAuth
│   │   ├── services/      # auth.service.ts (API calls)
│   │   ├── store/         # auth.store.ts (Zustand)
│   │   └── types/         # auth.schemas.ts (Zod)
│   └── dashboard/
│       └── components/    # DashboardPage, AnalyticsPage
│
├── components/            # Shared, reusable UI
│   ├── ui/                # Button, Badge, Skeleton, ThemeToggle, UserAvatar
│   ├── layout/            # DashboardLayout (sidebar + topbar)
│   └── feedback/          # ErrorBoundary, PageLoader, NotFoundPage
│
├── hooks/                 # Global custom hooks
│   ├── usePermission.ts   # RBAC permission checks
│   ├── useQueryParams.ts  # Type-safe URL params
│   ├── useMediaQuery.ts   # Responsive breakpoints
│   └── useGlobalError.ts  # Global error handler
│
├── services/              # API layer
│   ├── api-client.ts      # Axios instance + interceptors + token refresh
│   └── query-client.ts    # TanStack Query configuration
│
├── store/                 # Global Zustand stores
│   └── theme.store.ts     # Dark/Light/System theme
│
├── routes/                # Routing configuration
│   ├── index.tsx          # Route definitions with lazy loading
│   └── guards.tsx         # ProtectedRoute, PublicRoute, Can
│
├── mocks/                 # MSW API mocks
│   ├── handlers.ts        # Request handlers
│   └── browser.ts         # Browser service worker setup
│
├── config/                # Application configuration
│   ├── index.ts           # APP_CONFIG, API_CONFIG, AUTH_CONFIG, ROUTES
│   └── i18n/              # i18next setup + locale JSON files
│
├── types/                 # Shared TypeScript types
│   └── index.ts           # User, Auth, API, Nav types
│
├── utils/                 # Pure utility functions
│   ├── cn.ts              # Tailwind class merging
│   ├── format.ts          # Date, currency, number formatters
│   ├── storage.ts         # Type-safe localStorage wrapper
│   └── performance.ts     # Debounce, IntersectionObserver hooks
│
├── styles/
│   └── globals.css        # CSS variables, glass, skeleton utilities
│
└── test/                  # Test infrastructure
    ├── setup.ts            # Vitest + Testing Library setup
    ├── server.ts           # MSW Node server
    └── utils.tsx           # Custom render with all providers
```

---

## ⚡ Quick Start

### 1. Clone and install

```bash
git clone <repo-url> nexus-app
cd nexus-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=https://your-api.com/v1
VITE_ENABLE_MOCKS=true          # Uses MSW — no backend needed
```

### 3. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

**Demo credentials** (with MSW mocks enabled):
- Email: `any@email.com`
- Password: `anypassword123`

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 🧪 Testing

```bash
npm run test           # Run tests once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

---

## 🔍 Code Quality

```bash
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Prettier format
npm run type-check     # TypeScript type check
```

---

## 🏗️ Architecture Decisions

### Why Vite over Next.js?
This boilerplate targets **SPA + API** architecture typical of enterprise dashboards. Vite provides faster HMR, simpler config, and better DX for pure client-side apps. Add Next.js if you need SSR/SEO for public pages.

### Why Zustand over Redux?
Zustand offers 95% of Redux's power with ~10% of the boilerplate. It integrates perfectly with React 19 concurrent features and doesn't require providers for most use cases. The `subscribeWithSelector` middleware ensures performant, granular subscriptions.

### Why TanStack Query for server state?
Server state (data from APIs) has fundamentally different characteristics from client state (UI toggles, themes). TanStack Query handles caching, background refetching, optimistic updates, and pagination out of the box — all things Zustand would require manual implementation for.

### Feature-based folder structure
Each feature is a self-contained vertical slice: `components/`, `hooks/`, `services/`, `store/`, `types/`. This means you can delete an entire feature by removing one folder, and you never need to hunt across the codebase for related code.

### RBAC Architecture
The auth store exposes `hasPermission()`, `hasRole()`, and `hasAnyPermission()` methods. Route-level guarding uses `<ProtectedRoute requiredPermission="..." />`. Component-level conditional rendering uses `<Can permission="..." />`. This separation means RBAC logic lives in one place and can be swapped for a policy engine without touching any UI code.

---

## 🔐 Security Notes

- **Access tokens** are stored in memory only (never localStorage) — immune to XSS
- **Refresh tokens** use localStorage (necessary for persistence) — use HttpOnly cookies in production
- **Auto token refresh** happens transparently via Axios interceptors
- **CSP headers** should be configured at the infrastructure level (Nginx/CDN)
- **Environment variables** — never prefix sensitive secrets with `VITE_` (they're bundled into the client)

---

## 📦 Adding a New Feature

```bash
# 1. Create feature folder
mkdir -p src/features/notifications/{components,hooks,services,store,types}

# 2. Add types
touch src/features/notifications/types/notification.types.ts

# 3. Add service
touch src/features/notifications/services/notifications.service.ts

# 4. Add React Query hook
touch src/features/notifications/hooks/use-notifications.ts

# 5. Add MSW mock handler in src/mocks/handlers.ts

# 6. Add route in src/routes/index.tsx (lazy import)

# 7. Add nav item in DashboardLayout NAV_ITEMS array
```

---

## 🚢 Deployment

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Vercel / Netlify
Point to the repo — the `build` command and `dist` output directory work out of the box.

---

## 📊 Lighthouse Targets

| Metric | Target | How |
|---|---|---|
| Performance | 95+ | Code splitting, compression, tree-shaking |
| Accessibility | 100 | ARIA labels, keyboard nav, focus management |
| Best Practices | 100 | HTTPS, no deprecated APIs |
| SEO | 90+ | Meta tags, semantic HTML |

---

Made with ❤️ — Production-ready from day one.

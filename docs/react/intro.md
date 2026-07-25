---
title: React — Architect-Level Mastery Path
sidebar_label: React - Topics
sidebar_position: 1
---

**1. Core Foundations**

- JSX & rendering model
- Components, props, state, lifecycle
- Hooks basics: useState, useEffect, useRef
- Conditional/list rendering & keys
- Event handling
- Controlled vs uncontrolled inputs

**2. Intermediate Mechanics**

- Custom hooks
- useMemo/useCallback & referential equality
- useReducer
- Context API
- Composition vs inheritance
- Portals
- Error boundaries
- forwardRef & useImperativeHandle

**3. Rendering Internals & Performance**

- Reconciliation & Fiber architecture
- Virtual DOM diffing
- Batching & concurrent rendering (React 18+)
- Suspense, useTransition, useDeferredValue
- React.memo & memoization strategy
- DevTools Profiler
- Avoiding unnecessary re-renders
- Windowing/virtualization

**4. State Management at Scale**

- Local vs global vs server state
- Context pitfalls at scale
- Redux / Zustand / Jotai / Recoil tradeoffs
- React Query/SWR: caching, invalidation, optimistic updates
- State colocation
- Event-driven vs store-driven architecture

**5. Data & API Architecture**

- REST/GraphQL client integration
- Fetch patterns: waterfall vs parallel
- Caching & normalization
- WebSocket/real-time sync
- BFF pattern
- API contract versioning

**6. Application Architecture**

- Component patterns: compound, render props, HOCs vs hooks
- Feature-based/domain-driven structure
- Micro-frontends (Module Federation)
- Monorepo strategy (Nx/Turborepo)
- Design systems & component libraries
- Shared UI kit governance

**7. Routing & Rendering Strategies**

- Client-side routing (React Router)
- SSR vs SSG vs ISR vs CSR
- Next.js/Remix architecture decisions
- Hydration & streaming SSR
- Edge rendering

**8. Type Safety & Code Quality**

- TypeScript integration patterns
- Generic component typing
- Strict typing: props/state/API
- ESLint/Prettier governance
- Architectural decision records (ADRs)

**9. Testing Strategy**

- Unit testing (Jest/Vitest)
- Component testing (RTL)
- Integration/E2E (Playwright/Cypress)
- Visual regression testing
- Testing pyramid for frontend

**10. Performance & Production Engineering**

- Bundle analysis & code splitting
- Tree-shaking & dead code elimination
- Core Web Vitals optimization
- Lazy loading & prefetching
- CDN/caching headers
- Build tooling (Vite/Webpack) decisions

**11. Security**

- XSS prevention in JSX
- CSP headers
- Auth token handling (httpOnly cookies vs localStorage)
- Dependency vulnerability management
- OWASP frontend checklist

**12. Cross-Cutting Architect Concerns**

- Accessibility (WCAG/ARIA) at scale
- i18n/l10n architecture
- Observability: RUM, error tracking, tracing
- Feature flagging & progressive rollout
- CI/CD for frontend
- Design-to-dev handoff
- Migration strategy (legacy → React, upgrades)
- Team scaling: conventions, code review, tech radar

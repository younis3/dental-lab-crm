# dental-lab-crm

Monorepo for a dental lab CRM: admin portal, mobile app, and NestJS API.

```
dental-lab-crm/
├── apps/
│   ├── lab-web/        # Lab staff, doctor & clinic web app (Next.js)
│   └── lab-mobile/     # Lab staff, doctor & clinic mobile app (Expo / React Native)
├── server/             # Core backend API (NestJS)
├── packages/           # Shared monorepo packages
│   ├── types/          # Shared TypeScript types & DB interfaces
│   ├── schemas/        # Shared Zod validation schemas
│   ├── api-client/     # Shared API client & query hooks
│   └── config/         # Shared ESLint, Prettier, and TSConfigs
└── docs/               # PRD, API specs, & workflow documentation
```

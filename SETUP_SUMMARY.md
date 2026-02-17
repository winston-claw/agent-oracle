# NextJS 14 Hackathon Template - Setup Summary

## Created Structure

```
hackathon-template/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── next.config.js
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── packages/
│   ├── db/
│   │   ├── convex/
│   │   │   └── schema.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ui/
│       ├── index.css
│       ├── package.json
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── src/
│           ├── button.tsx
│           ├── card.tsx
│           ├── index.tsx
│           ├── input.tsx
│           ├── label.tsx
│           └── utils.ts
├── package.json
└── pnpm-workspace.yaml
```

## Packages Created

### 1. packages/ui
- **package.json**: React, Tailwind CSS, clsx, tailwind-merge
- **src/index.tsx**: Exports Button, Card, Input, Label components
- **src/button.tsx**: Button component with multiple variants and sizes
- **src/card.tsx**: Card component with Header, Title, Description, Content, Footer
- **src/input.tsx**: Input component with label and error handling
- **src/label.tsx**: Label component
- **src/utils.ts**: Utility function for className merging
- **tailwind.config.js**: Tailwind configuration with custom colors
- **tsconfig.json**: TypeScript configuration
- **index.css**: CSS variables and base styles

### 2. packages/db
- **package.json**: Convex, better-auth, @better-auth/convex
- **convex/schema.ts**: Convex database schema with tables:
  - users (with indexes on email and createdAt)
  - posts (with indexes on authorId, published, createdAt)
  - sessions (with indexes on token and expiresAt)
- **tsconfig.json**: TypeScript configuration

### 3. apps/web
- **app/layout.tsx**: Root layout with Inter font and metadata
- **app/page.tsx**: Complete landing page featuring:
  - Hero section with call-to-action buttons
  - Features section with 4 feature cards
  - Pricing section with 3 pricing tiers (Free, Pro, Enterprise)
  - Newsletter subscription form
  - Footer
- **app/globals.css**: Global styles and Tailwind directives
- **next.config.js**: Next.js configuration with transpilePackages
- **tailwind.config.ts**: Tailwind configuration for web app
- **tsconfig.json**: TypeScript configuration with path aliases

## Configuration

### Monorepo Setup
- pnpm-workspace.yaml configured for apps/* and packages/* workspaces
- Root package.json with dev/build/start scripts

### Web App Configuration
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS with custom color variables
- Path aliases: @/* for app/*, @ui/* for packages/ui/*, @db/* for packages/db/*

## Next Steps

1. Initialize Convex: `pnpm --filter db convex dev`
2. Configure better-auth in web app
3. Start development server: `pnpm dev`

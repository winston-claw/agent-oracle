# Hackathon Template

A complete Next.js 14 hackathon template featuring UI components, Convex database, and authentication.

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library (@ui)
- **Database**: Convex with real-time capabilities
- **Authentication**: Better Auth with email/password
- **TypeScript**: Full type safety across the stack

## Project Structure

```
hackathon-template/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── lib/
│       │   └── useAuth.ts
│       ├── next.config.js
│       └── package.json
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── utils.ts
│   │   │   └── index.tsx
│   │   ├── index.css
│   │   ├── tailwind.config.js
│   │   └── package.json
│   └── db/
│       ├── convex/
│       │   ├── auth.ts
│       │   ├── authClient.ts
│       │   └── schema.ts
│       └── package.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- Convex account (get one at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hackathon-template
```

2. Install dependencies
```bash
pnpm install
```

3. Set up Convex
```bash
cd packages/db
pnpm convex dev
```

4. Set up environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-convex-app.convex.cloud
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

5. Run the development server
```bash
pnpm dev
```

## Features

### Landing Page
- Hero section with compelling headline
- Features grid showcasing the tech stack
- Pricing section with three tiers
- Newsletter signup with form handling

### UI Components
- **Button**: Multiple variants and sizes
- **Card**: Header, content, and footer sections
- **Input**: Styled form input with focus states
- **Label**: Accessible form labels

### Authentication
- Email/password signup and login
- Session management with Better Auth
- Protected routes and API calls
- User authentication state

### Database
- Convex schema with users, posts, and sessions
- Real-time database queries
- Type-safe mutations and queries
- Auth integration with Convex

## Available Scripts

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build the application
pnpm build

# Start production server
pnpm start

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

## Component Usage

### Button
```tsx
import { Button } from '@ui';

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button size="lg">Large</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
</Card>
```

### Input
```tsx
import { Input } from '@ui';

<Input type="email" placeholder="Enter your email" />
```

### Auth Hook
```tsx
import { useAuth } from '@/lib/useAuth';

function MyComponent() {
  const { login, logout, createAccount } = useAuth();

  const handleLogin = async () => {
    await login({ email: 'test@example.com', password: 'password' });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

## Contributing

This is a hackathon template, feel free to customize it for your needs!

## License

MIT

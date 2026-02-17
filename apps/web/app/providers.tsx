'use client';

import { ConvexProvider } from 'convex/react';
import { convex } from '../lib/convex-client';
import { AuthProvider } from '../lib/auth';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ConvexProvider>
  );
}

// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { PartnerReferralCapture } from '@/components/marketing/partner-referral-capture';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PartnerReferralCapture />
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
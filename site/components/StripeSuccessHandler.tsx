'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function StripeSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) return;

    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 1000; // Check every 1 second

    const checkSubscription = async () => {
      try {
        const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.isPro) {
          toast.success('🎉 Subscription activated! Redirecting...');
          // Remove session_id from URL and refresh
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          window.location.href = url.toString();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkSubscription, checkInterval);
        } else {
          // Max attempts reached, just reload without toast
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          window.location.href = url.toString();
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkSubscription, checkInterval);
        }
      }
    };

    // Show initial processing message
    toast.loading('Processing your subscription...');
    checkSubscription();
  }, [sessionId, router]);

  return null;
}

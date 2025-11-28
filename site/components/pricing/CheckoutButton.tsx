'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CheckoutButtonProps {
  priceId: string;
  className?: string;
}

export default function CheckoutButton({ priceId, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          returnUrl: window.location.origin + '/dashboard',
        }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading} 
      className={className}
    >
      {loading ? 'Processing...' : 'Upgrade to Pro'}
    </Button>
  );
}

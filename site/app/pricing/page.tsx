import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { stripe } from '@/lib/stripe/server';
import CheckoutButton from '@/components/pricing/CheckoutButton';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { PricingHeader } from '@/components/pricing/PricingHeader';
import ManageSubscriptionButton from '@/components/settings/ManageSubscriptionButton';

export const dynamic = 'force-dynamic';

interface PricingTier {
  priceId: string;
  price: Stripe.Price;
  product: Stripe.Product;
}

export default async function PricingPage() {
  let pricingTiers: PricingTier[] = [];

  try {
    // Fetch all active recurring prices from Stripe
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product'],
    });

    console.log('[PricingPage] Found prices from Stripe:', 
      prices.data.map(p => ({ 
        id: p.id, 
        productName: (p.product as Stripe.Product).name,
        amount: p.unit_amount,
        interval: p.recurring?.interval
      }))
    );

    // Convert to pricing tiers and sort by price (cheapest to most expensive)
    pricingTiers = prices.data
      .map(price => ({
        priceId: price.id,
        price,
        product: price.product as Stripe.Product,
      }))
      .sort((a, b) => {
        const aAmount = a.price.unit_amount || 0;
        const bAmount = b.price.unit_amount || 0;
        return aAmount - bAmount;
      });

  } catch (error) {
    console.error('[PricingPage] Error fetching prices:', error);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isSubscribed = false;
  if (user) {
    console.log(`[PricingPage] Checking subscription for user: ${user.id}`);
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, price_id')
      .in('status', ['trialing', 'active'])
      .maybeSingle();
      
    if (error) {
      console.error('[PricingPage] Subscription check error:', error);
    } else {
      console.log('[PricingPage] Subscription found:', subscription);
    }

    isSubscribed = !!subscription;

    if (isSubscribed) {
      redirect('/dashboard');
    }
  }

  const formatPrice = (amount: number | null, currency: string) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  // Parse features from product description or metadata
  const parseFeatures = (product: Stripe.Product): string[] => {
    // Try to get features from metadata first
    if (product.metadata?.features) {
      try {
        return JSON.parse(product.metadata.features);
      } catch {
        // If not JSON, split by comma or newline
        return product.metadata.features.split(/[,\n]/).map(f => f.trim()).filter(Boolean);
      }
    }
    // Default features if none specified
    return [
      'Unlimited Knowledge Trees',
      'Advanced AI Features',
      'Priority Support',
    ];
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-pink-500/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <Suspense fallback={
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Pricing that scales
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start for free, upgrade when you need more power. No hidden fees.
            </p>
          </div>
        }>
          <PricingHeader />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Hobby Plan - Free (Hardcoded) */}
          <div className="rounded-3xl p-8 bg-[#111] border border-white/10 flex flex-col hover:border-white/20 transition-colors">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Hobby</h3>
              <p className="text-gray-400">For personal projects and experiments</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-400">/month</span>
            </div>
            {isSubscribed ? (
              <ManageSubscriptionButton 
                variant="outline" 
                className="w-full mb-8 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                Downgrade
              </ManageSubscriptionButton>
            ) : (
              <Button variant="outline" className="w-full mb-8 bg-white/5 border-white/10 hover:bg-white/10 text-white" disabled>
                Current Plan
              </Button>
            )}
            <div className="space-y-4 flex-1">
              <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Includes</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-green-400" /> 3 Knowledge Trees
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-green-400" /> Basic AI Chat
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-green-400" /> 100MB Document Storage
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-green-400" /> Community Support
                </li>
              </ul>
            </div>
          </div>

          {/* Dynamic Stripe Plans */}
          {pricingTiers.map((tier, index) => {
            const isPopular = index === pricingTiers.length - 1; // Most expensive is popular
            const priceString = formatPrice(tier.price.unit_amount, tier.price.currency);
            const interval = tier.price.recurring?.interval || 'month';
            const features = parseFeatures(tier.product);

            return (
              <div 
                key={tier.priceId}
                className={`rounded-3xl p-8 bg-[#111] border flex flex-col relative ${
                  isPopular 
                    ? 'border-pink-500/50 shadow-[0_0_50px_-12px_rgba(236,72,153,0.3)]' 
                    : 'border-white/10 hover:border-white/20'
                } transition-colors`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.product.name}</h3>
                  <p className="text-gray-400">{tier.product.description || 'Upgrade your experience'}</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-bold">{priceString}</span>
                  <span className="text-gray-400">/{interval}</span>
                </div>
                {isSubscribed ? (
                  <ManageSubscriptionButton 
                    className="w-full mb-8 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  >
                    Manage Subscription
                  </ManageSubscriptionButton>
                ) : (
                  <CheckoutButton 
                    priceId={tier.priceId} 
                    className={`w-full mb-8 border-0 ${
                      isPopular 
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500' 
                        : 'bg-white/10 hover:bg-white/20'
                    } text-white`}
                    label={`Upgrade to ${tier.product.name}`}
                  />
                )}
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    {index === 0 ? 'Everything in Hobby, plus' : `Everything in previous tiers, plus`}
                  </p>
                  <ul className="space-y-3">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <Check className={`w-5 h-5 ${isPopular ? 'text-pink-500' : 'text-pink-500'}`} /> 
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left mt-8">
            <div className="p-6 rounded-2xl bg-white/5">
              <h3 className="font-bold mb-2">How are credits calculated?</h3>
              <p className="text-gray-400">
                Credits are consumed based on the model used:
                <br />• <strong>GPT-5 Mini</strong>: 1 credit per token
                <br />• <strong>GPT-5.1</strong>: 12 credits per token
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5">
              <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5">
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards via Stripe. Enterprise customers can pay via invoice.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5">
              <h3 className="font-bold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">We offer a 14-day money-back guarantee if you're not satisfied with our Pro plan.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5">
              <h3 className="font-bold mb-2">What happens to my data if I downgrade?</h3>
              <p className="text-gray-400">Your data is safe. You'll just lose access to Pro features like advanced AI and increased storage limits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

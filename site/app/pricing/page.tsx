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

export default async function PricingPage() {
  const standardPriceId = 'price_1SYQz2IaanXwtACFujUP9lee';
  const proPriceId = 'price_1SZdsjIaanXwtACFiRtnpJjZ';

  let standardPrice: Stripe.Price | null = null;
  let standardProduct: Stripe.Product | null = null;
  let proPrice: Stripe.Price | null = null;
  let proProduct: Stripe.Product | null = null;

  try {
    const [standard, pro] = await Promise.all([
      stripe.prices.retrieve(standardPriceId, { expand: ['product'] }),
      stripe.prices.retrieve(proPriceId, { expand: ['product'] })
    ]);
    
    standardPrice = standard;
    standardProduct = standard.product as Stripe.Product;
    proPrice = pro;
    proProduct = pro.product as Stripe.Product;
  } catch (error) {
    console.error('Error fetching prices:', error);
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

  const standardPriceString = standardPrice ? formatPrice(standardPrice.unit_amount, standardPrice.currency) : '$20';
  const standardInterval = standardPrice?.recurring?.interval || 'month';
  const standardName = standardProduct?.name || 'Pro';
  const standardDescription = standardProduct?.description || 'For serious developers and teams';

  const proPriceString = proPrice ? formatPrice(proPrice.unit_amount, proPrice.currency) : '$40';
  const proInterval = proPrice?.recurring?.interval || 'month';
  const proName = proProduct?.name || 'Max';
  const proDescription = proProduct?.description || 'For power users who need more';

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
          {/* Hobby Plan */}
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

          {/* Standard Plan */}
          <div className="rounded-3xl p-8 bg-[#111] border border-white/10 flex flex-col hover:border-pink-500/50 transition-colors">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{standardName}</h3>
              <p className="text-gray-400">{standardDescription}</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold">{standardPriceString}</span>
              <span className="text-gray-400">/{standardInterval}</span>
            </div>
            {isSubscribed ? (
              <ManageSubscriptionButton 
                className="w-full mb-8 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                Manage Subscription
              </ManageSubscriptionButton>
            ) : (
              <CheckoutButton 
                priceId={standardPriceId} 
                className="w-full mb-8 bg-white/10 hover:bg-white/20 text-white border-0"
                label={`Upgrade to ${standardName}`}
              />
            )}
            <div className="space-y-4 flex-1">
              <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Everything in Hobby, plus</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> Unlimited Knowledge Trees
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> Powered by GPT-5 Mini
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> Podcast Generation
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> 2,500,000 Credits / month
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> Priority Support
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl p-8 bg-[#111] border border-pink-500/50 flex flex-col relative shadow-[0_0_50px_-12px_rgba(236,72,153,0.3)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{proName}</h3>
              <p className="text-gray-400">{proDescription}</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold">{proPriceString}</span>
              <span className="text-gray-400">/{proInterval}</span>
            </div>
            {isSubscribed ? (
              <ManageSubscriptionButton 
                className="w-full mb-8 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                Manage Subscription
              </ManageSubscriptionButton>
            ) : (
              <CheckoutButton 
                priceId={proPriceId} 
                className="w-full mb-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-0"
                label={`Upgrade to ${proName}`}
              />
            )}
            <div className="space-y-4 flex-1">
              <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Everything in {standardName}, plus</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> 5,000,000 Credits / month
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> Access to GPT-5.1 for Deep Research
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-pink-500" /> Dedicated Support
                </li>
              </ul>
            </div>
          </div>
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

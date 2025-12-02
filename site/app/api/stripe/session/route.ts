import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.customer) {
      // Check if subscription exists in our database
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, price_id')
        .eq('user_id', user.id)
        .in('status', ['trialing', 'active'])
        .maybeSingle();

      if (subscription) {
        return NextResponse.json({ 
          isPro: true,
          status: subscription.status,
          priceId: subscription.price_id
        });
      }

      // Fallback: If DB is not updated yet (webhook delay), sync manually
      console.log('[SessionCheck] Subscription missing in DB, syncing from Stripe...');
      const supabaseAdmin = await createAdminClient();
      
      // 1. Ensure customer mapping exists
      const { data: customerData } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('stripe_customer_id', session.customer as string)
        .single();

      if (!customerData) {
        // Insert customer mapping if missing
        await supabaseAdmin.from('customers').insert({
          id: user.id,
          stripe_customer_id: session.customer as string
        });
      }

      // 2. Fetch and insert subscription
      if (session.subscription) {
        const subscriptionId = typeof session.subscription === 'string' 
          ? session.subscription 
          : session.subscription.id;

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['default_payment_method'],
        }) as Stripe.Subscription;

        const subscriptionData = {
          id: stripeSubscription.id,
          user_id: user.id,
          metadata: stripeSubscription.metadata,
          status: stripeSubscription.status,
          price_id: stripeSubscription.items.data[0].price.id,
          quantity: stripeSubscription.items.data[0].quantity,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          cancel_at: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000).toISOString() : null,
          canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          current_period_start: new Date(((stripeSubscription as any).current_period_start || stripeSubscription.created) * 1000).toISOString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          current_period_end: new Date(((stripeSubscription as any).current_period_end || stripeSubscription.created) * 1000).toISOString(),
          created: new Date(stripeSubscription.created * 1000).toISOString(),
          ended_at: stripeSubscription.ended_at ? new Date(stripeSubscription.ended_at * 1000).toISOString() : null,
          trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
        };

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert([subscriptionData]);

        if (error) {
          console.error('[SessionCheck] Failed to sync subscription:', error);
        } else {
          console.log('[SessionCheck] Successfully synced subscription');
          return NextResponse.json({ 
            isPro: true,
            status: stripeSubscription.status,
            priceId: stripeSubscription.items.data[0].price.id
          });
        }
      }
    }

    return NextResponse.json({ isPro: false });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ error: 'Failed to check session' }, { status: 500 });
  }
}

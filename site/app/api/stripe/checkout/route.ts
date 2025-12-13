import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: NextRequest) {
  try {
    const { priceId, returnUrl } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabaseAdmin = await createAdminClient();
    const { data: customerData } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = customerData?.stripe_customer_id;

    // Verify the customer exists in Stripe, or create a new one
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error: any) {
        // Customer doesn't exist in Stripe (e.g., switching from test to live mode)
        console.log(`[Checkout API] Customer ${stripeCustomerId} not found in Stripe, creating new customer`);
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUUID: user.id,
        },
      });
      stripeCustomerId = customer.id;
      
      // Upsert the customer record (update if exists, insert if not)
      const { error: upsertError } = await supabaseAdmin
        .from('customers')
        .upsert({ id: user.id, stripe_customer_id: stripeCustomerId }, { onConflict: 'id' });

      if (upsertError) {
        console.error('[Checkout API] Error upserting customer:', upsertError);
        throw new Error('Failed to create customer record');
      }
      
      console.log(`[Checkout API] Created new Stripe customer: ${stripeCustomerId}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
      subscription_data: {
        metadata: {
          supabaseUUID: user.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[Checkout API] Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

export async function GET() {
  try {
    // Fetch all active prices with their products
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100, // Adjust if you have more prices
    });

    // Filter for recurring prices only (subscriptions)
    const subscriptionPrices = prices.data.filter(
      (price) => price.type === 'recurring'
    );

    // Group by product metadata or name to identify plan types
    const formattedPrices = subscriptionPrices.map((price) => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        unitAmount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
        metadata: product.metadata,
      };
    });

    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    console.error('Error fetching Stripe prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

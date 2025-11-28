import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
  appInfo: {
    name: 'PG On Rails Site',
    version: '0.1.0',
  },
});

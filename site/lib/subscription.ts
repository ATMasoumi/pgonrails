import { createClient } from '@/lib/supabase/server';

export async function getUserSubscriptionStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isPro: false, userId: null, user: null };

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return { isPro: !!subscription, userId: user.id, user };
}

export async function isPro() {
  const { isPro } = await getUserSubscriptionStatus();
  return isPro;
}

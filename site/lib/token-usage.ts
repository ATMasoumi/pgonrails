import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

// TODO: Replace with your actual Stripe Price IDs
const PLAN_LIMITS: Record<string, number> = {
  'price_1SYQz2IaanXwtACFujUP9lee': 2000000, // $20 plan
  'price_1SZdsjIaanXwtACFiRtnpJjZ': 5000000, // $40 plan
}
const DEFAULT_LIMIT = 10000; // Free/Trial limit

const MODEL_MULTIPLIERS: Record<string, number> = {
  'gpt-4o-mini': 0.2, // Legacy
  'gpt-5-mini': 1,    // Base unit (1 credit = 1 token)
  'gpt-4o': 3,        // ~3x more expensive than 5-mini
  'gpt-5.1': 12,      // ~12x more expensive than 5-mini
};

export async function checkAndIncrementUsage(userId: string, tokensToAdd: number = 0, model: string = 'gpt-4o-mini') {
  const supabase = await createAdminClient()
  
  // Calculate weighted usage based on model cost
  const multiplier = MODEL_MULTIPLIERS[model] || 1;
  const weightedTokens = Math.ceil(tokensToAdd * multiplier);
  
  // 1. Get Subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_start, price_id')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .maybeSingle()

  if (!subscription) {
    // Enforce subscription for AI usage
    throw new Error('Active subscription required.')
  }

  // 2. Get Usage
  let { data: usage } = await supabase
    .from('token_usage')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!usage) {
    const { data: newUsage, error } = await supabase
      .from('token_usage')
      .insert({ user_id: userId, tokens_used: 0, last_reset_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    usage = newUsage
  }

  // 3. Check Reset
  const periodStart = new Date(subscription.current_period_start)
  const lastReset = new Date(usage.last_reset_at)

  // If the billing period started AFTER the last reset, we need to reset.
  if (periodStart > lastReset) {
    const { data: resetUsage, error } = await supabase
      .from('token_usage')
      .update({ tokens_used: 0, last_reset_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    usage = resetUsage
  }

  // 4. Check Limit
  const limit = PLAN_LIMITS[subscription.price_id] || DEFAULT_LIMIT
  if (usage.tokens_used + weightedTokens > limit) {
    throw new Error('Token limit exceeded. Please upgrade your plan or wait for the next billing cycle.')
  }

  // 5. Increment
  if (weightedTokens > 0) {
    const { error } = await supabase.rpc('increment_token_usage', { 
      target_user_id: userId, 
      amount: weightedTokens 
    })
    if (error) throw error
  }
  
  return {
    used: usage.tokens_used + weightedTokens,
    limit,
    resetDate: new Date(new Date(subscription.current_period_start).setMonth(new Date(subscription.current_period_start).getMonth() + 1)) // Approx next billing date
  }
}

export async function getTokenUsage(userId: string) {
    const supabase = await createClient()
    const { data } = await supabase.from('token_usage').select('*').eq('user_id', userId).single()
    return data
}

export async function getTokenUsageWithDetails(userId: string) {
  const supabase = await createClient()
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_start, price_id')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .maybeSingle()

  const { data: usage } = await supabase
    .from('token_usage')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const limit = subscription ? (PLAN_LIMITS[subscription.price_id] || DEFAULT_LIMIT) : DEFAULT_LIMIT
  const used = usage?.tokens_used || 0
  const resetDate = subscription 
    ? new Date(new Date(subscription.current_period_start).setMonth(new Date(subscription.current_period_start).getMonth() + 1))
    : null

  return { used, limit, resetDate }
}

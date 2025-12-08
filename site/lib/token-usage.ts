import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

// TODO: Replace with your actual Stripe Price IDs
const PLAN_LIMITS: Record<string, number> = {
  'price_1SYQz2IaanXwtACFujUP9lee': 2500000, // $20 plan ($5 worth of tokens)
  'price_1SZdsjIaanXwtACFiRtnpJjZ': 5000000, // $40 plan ($10 worth of tokens)
}
const DEFAULT_LIMIT = 100000; // Free/Trial limit (approx $0.04/user/mo cost to you)

const MODEL_MULTIPLIERS: Record<string, number> = {
  'gpt-4o-mini': 0.2, // Legacy
  'gpt-5-mini': 1,    // Base unit (1 credit = 1 token)
  'gpt-4o': 3,        // ~3x more expensive than 5-mini
  'gpt-5.1': 12,      // ~12x more expensive than 5-mini
  'tts-1': 7.5,       // $0.015/1k chars vs $0.002/1k tokens (approx 7.5x)
};

export async function checkAndIncrementUsage(userId: string, tokensToAdd: number = 0, model: string = 'gpt-4o-mini') {
  // Note: 'tokensToAdd' represents the billing unit count. 
  // For GPT models, this is tokens. For TTS, this is characters.
  console.log(`[TokenUsage] Processing request - User: ${userId}, Units: ${tokensToAdd}, Model: ${model}`)
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
  let shouldReset = false;
  if (subscription) {
    const periodStart = new Date(subscription.current_period_start)
    const lastReset = new Date(usage.last_reset_at)
    if (periodStart > lastReset) {
      shouldReset = true
    }
  } else {
    // Free tier: reset every 30 days
    const lastReset = new Date(usage.last_reset_at)
    const now = new Date()
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
    if (now.getTime() - lastReset.getTime() > thirtyDaysInMs) {
      shouldReset = true
    }
  }

  if (shouldReset) {
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
  const limit = subscription ? (PLAN_LIMITS[subscription.price_id] || DEFAULT_LIMIT) : DEFAULT_LIMIT
  
  // 5. Increment
  if (weightedTokens > 0) {
    const { error } = await supabase.rpc('increment_token_usage', { 
      target_user_id: userId, 
      amount: weightedTokens 
    })
    if (error) throw error
  }

  if (usage.tokens_used + weightedTokens > limit) {
    throw new Error('Token limit exceeded. Please upgrade your plan or wait for the next billing cycle.')
  }
  
  // Calculate reset date
  let resetDate: Date
  if (subscription) {
    resetDate = new Date(subscription.current_period_start)
    resetDate.setMonth(resetDate.getMonth() + 1)
  } else {
    resetDate = new Date(usage.last_reset_at)
    resetDate.setDate(resetDate.getDate() + 30)
  }
  
  return {
    used: usage.tokens_used + weightedTokens,
    limit,
    resetDate
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

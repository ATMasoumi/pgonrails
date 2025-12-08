import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { getUserSubscriptionStatus } from '@/lib/subscription'
import { checkAndIncrementUsage } from '@/lib/token-usage'
import { SupabaseClient } from '@supabase/supabase-js'

export const maxDuration = 300

async function getTopicPath(supabase: SupabaseClient, startId: string) {
  const path: string[] = []
  let currentId = startId
  
  // Safety break to prevent infinite loops
  let depth = 0
  const maxDepth = 20

  while (currentId && depth < maxDepth) {
    const { data } = await supabase
      .from('documents')
      .select('id, query, parent_id')
      .eq('id', currentId)
      .single()
    
    if (!data) break
    
    path.unshift(data.query)
    currentId = data.parent_id
    depth++
  }
  
  return path
}

export async function POST(req: Request) {
  const { documentId } = await req.json()
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify ownership
  const { data: doc } = await supabase
    .from('documents')
    .select('id, query, user_id')
    .eq('id', documentId)
    .single()

  if (!doc || doc.user_id !== user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { isPro } = await getUserSubscriptionStatus()
  const modelName = isPro ? 'gpt-5-mini' : 'gpt-5-mini'

  try {
    await checkAndIncrementUsage(user.id, 0, modelName)
  } catch (error) {
    return new Response('Token limit exceeded', { status: 402 })
  }

  const path = await getTopicPath(supabase, documentId)
  const contextString = path.join(' > ')
  const currentTopic = path[path.length - 1]

  const result = await streamText({
    model: openai(modelName),
    system: "You are an expert academic researcher and writer. Generate a highly comprehensive, detailed, and in-depth article about the requested topic. The content should be extensive, covering history, key concepts, theoretical foundations, practical applications, current state, future implications, and relevant examples. Use clear markdown formatting with multiple headers, lists, and code blocks where appropriate. Aim for a deep dive into the subject matter that provides significant value and insight.",
    prompt: `Context path: ${contextString}\n\nGenerate a comprehensive article for: ${currentTopic}`,
    onFinish: async ({ text, usage }) => {
      // Save to database
      await supabase
        .from('documents')
        .update({ content: text })
        .eq('id', documentId)

      // Track usage
      let tokens = usage?.totalTokens
      if (!tokens && text) {
        // Fallback estimation: ~3 chars per token
        tokens = Math.ceil(text.length / 3)
      }

      if (tokens) {
        await checkAndIncrementUsage(user.id, tokens, modelName)
      }
    }
  })

  return result.toTextStreamResponse()
}

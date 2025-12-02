import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { SupabaseClient } from '@supabase/supabase-js'
import { checkAndIncrementUsage } from '@/lib/token-usage'

export const runtime = 'edge'

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
  const { messages, topicId } = await req.json()
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    return new Response(errorMessage, { status: 403 })
  }

  // Save the user's message (the last one)
  const lastMessage = messages[messages.length - 1]
  if (lastMessage && lastMessage.role === 'user') {
    await supabase.from('chat_messages').insert({
      document_id: topicId,
      user_id: user.id,
      role: 'user',
      content: lastMessage.content
    })
  }

  const path = await getTopicPath(supabase, topicId)
  const contextString = path.join(' > ')
  const currentTopic = path[path.length - 1]

  // Fetch current document content for context
  const { data: currentDoc } = await supabase
    .from('documents')
    .select('content')
    .eq('id', topicId)
    .single()

  const systemMessage = `You are an expert tutor and documentation assistant.
    The current topic is: "${currentTopic}".
    The full context path is: "${contextString}".
    
    ${currentDoc?.content ? `The current content of the document is:\n---\n${currentDoc.content}\n---\n` : ''}

    CRITICAL INSTRUCTIONS:
    1. Your primary goal is to answer the user's questions or explain selected text.
    2. Do NOT regenerate, rewrite, or output the full document content unless the user explicitly asks you to (e.g., "write the document", "regenerate the article").
    3. If the user asks "Explain this: [text]", provide a clear, concise explanation of that specific text.
    4. If the user asks a question, answer ONLY that question.
    5. Use the provided document content as context for your answers, but do not repeat it.
    
    Use Markdown formatting.
    Keep the tone professional and educational.`

  const result = streamText({
    model: openai('gpt-5-mini'),
    messages,
    system: systemMessage,
    onFinish: async ({ text, usage }) => {
      if (text) {
        await supabase.from('chat_messages').insert({
          document_id: topicId,
          user_id: user.id,
          role: 'assistant',
          content: text
        })
      }
      if (usage) {
        console.log(`[Chat] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
        await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
      } else {
        console.log('[Chat] No token usage returned from AI provider')
      }
    }
  })

  return result.toTextStreamResponse()
}


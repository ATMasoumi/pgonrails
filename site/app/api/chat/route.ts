import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { SupabaseClient } from '@supabase/supabase-js'

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

  const path = await getTopicPath(supabase, topicId)
  const contextString = path.join(' > ')
  const currentTopic = path[path.length - 1]

  const systemMessage = `You are a helpful assistant writing documentation for a topic. 
    The current topic is: "${currentTopic}".
    The full context path is: "${contextString}".
    
    Write a comprehensive, well-structured explanation/document for this topic. 
    Use Markdown formatting. 
    If the user asks for changes, modify the document accordingly.
    Keep the tone professional and educational.`

  const result = streamText({
    model: openai('gpt-5.1'),
    messages,
    system: systemMessage,
  })

  return result.toTextStreamResponse()
}


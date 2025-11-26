"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { openai } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

export async function createTopic(query: string, parentId: string | null = null) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  if (!query) {
    throw new Error('Query is required')
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        query,
        content: null,
        parent_id: parentId || null
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to save topic')
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error creating topic:', error)
    return { success: false, error: 'Failed to create topic' }
  }
}

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

export async function generateTopicContent(id: string, type: 'subtopic' | 'explanation') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  const path = await getTopicPath(supabase, id)
  const contextString = path.join(' > ')
  const currentTopic = path[path.length - 1]

  if (type === 'subtopic') {
    try {
      const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: "You are a helpful assistant. Generate a comprehensive list of up to 10 subtopics for the last topic in the provided context path. The subtopics should be relevant to the specific branch of knowledge and cover the subject thoroughly.",
        prompt: `Context path: ${contextString}\n\nGenerate comprehensive subtopics for: ${currentTopic}`,
        schema: z.object({
          subtopics: z.array(z.string())
        })
      })

      const { error } = await supabase
        .from('documents')
        .insert(
          object.subtopics.map((topic: string) => ({
            user_id: user.id,
            query: topic,
            parent_id: id,
            content: null
          }))
        )

      if (error) throw error
      
    } catch (error) {
      console.error('Error generating subtopics:', error)
      throw error
    }
  } else {
    try {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: "You are a helpful assistant. Generate a comprehensive explanation/content for the requested topic. The content should be detailed and educational. Return plain markdown.",
        prompt: `Context path: ${contextString}\n\nGenerate content for: ${currentTopic}`
      })

      const { error } = await supabase
        .from('documents')
        .update({ content: text })
        .eq('id', id)

      if (error) throw error

    } catch (error) {
      console.error('Error generating content:', error)
      throw error
    }
  }
}

export async function deleteTopic(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/signin')
  }

  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to delete topic')
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting topic:', error)
    return { success: false, error: 'Failed to delete topic' }
  }
}

export async function updateTopicContent(id: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('documents')
    .update({ content })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  return { success: true }
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('documents')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/dashboard')
  revalidatePath(`/documents/${id}`)
  return { success: true }
}

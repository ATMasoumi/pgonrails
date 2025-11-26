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
        model: openai('gpt-5.1'),
        system: "You are an expert taxonomist and curriculum designer. Generate a comprehensive, structured, and logically ordered list of up to 10 subtopics for the last topic in the provided context path. The subtopics should be relevant to the specific branch of knowledge, cover the subject thoroughly, and facilitate deep learning.",
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
        model: openai('gpt-5.1'),
        system: "You are an expert academic researcher and writer. Generate a highly comprehensive, detailed, and in-depth article about the requested topic. The content should be extensive, covering history, key concepts, theoretical foundations, practical applications, current state, future implications, and relevant examples. Use clear markdown formatting with multiple headers, lists, and code blocks where appropriate. Aim for a deep dive into the subject matter that provides significant value and insight.",
        prompt: `Context path: ${contextString}\n\nGenerate a comprehensive article for: ${currentTopic}`
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

export async function togglePublic(id: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // First verify ownership of the root doc
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !doc) throw new Error('Unauthorized or not found')

  // We need to update the doc and all its descendants
  // Since we don't have a recursive query handy in the DB, we'll do it in two steps:
  // 1. Fetch all user docs (inefficient but consistent with current app)
  // 2. Find descendants
  // 3. Update them
  
  const { data: allDocs } = await supabase
    .from('documents')
    .select('id, parent_id')
    .eq('user_id', user.id)

  if (!allDocs) throw new Error('Failed to fetch documents')

  const descendants = new Set<string>([id])
  let changed = true
  while (changed) {
    changed = false
    for (const d of allDocs) {
      if (d.parent_id && descendants.has(d.parent_id) && !descendants.has(d.id)) {
        descendants.add(d.id)
        changed = true
      }
    }
  }

  const { error } = await supabase
    .from('documents')
    .update({ is_public: isPublic })
    .in('id', Array.from(descendants))

  if (error) throw error

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/${id}`)
  return { success: true }
}

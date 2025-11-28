"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { openai } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import OpenAI from 'openai'
import { search, SafeSearchType } from 'duck-duck-scrape'

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateInitialTree(supabase: SupabaseClient, rootId: string, query: string, userId: string) {
  try {
    const { object } = await generateObject({
      model: openai('gpt-5.1'),
      system: "You are an expert taxonomist and curriculum designer. Generate a comprehensive, structured knowledge tree for the provided topic. The tree should be 2 levels deep (Topic -> Subtopics -> Sub-subtopics). Ensure the structure is logical, covers the subject thoroughly, and facilitates deep learning.",
      prompt: `Generate a knowledge tree for: ${query}`,
      schema: z.object({
        subtopics: z.array(z.object({
          query: z.string(),
          subtopics: z.array(z.object({
            query: z.string()
          })).optional()
        }))
      })
    })

    for (const subtopic of object.subtopics) {
      const { data: l1Node, error: l1Error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          query: subtopic.query,
          parent_id: rootId,
          content: null
        })
        .select()
        .single()
      
      if (l1Error) {
        console.error('Error inserting L1 node:', l1Error)
        continue
      }

      if (subtopic.subtopics && subtopic.subtopics.length > 0) {
        const l2Nodes = subtopic.subtopics.map(st => ({
          user_id: userId,
          query: st.query,
          parent_id: l1Node.id,
          content: null
        }))
        
        const { error: l2Error } = await supabase
          .from('documents')
          .insert(l2Nodes)
          
        if (l2Error) console.error('Error inserting L2 nodes:', l2Error)
      }
    }
  } catch (error) {
    console.error('Error generating initial tree:', error)
  }
}

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

    if (!parentId) {
      await generateInitialTree(supabase, data.id, query, user.id)
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

export async function generateQuiz(documentId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      system: "You are an expert educator. Generate a quiz based on the provided content. The quiz should test the user's understanding of the key concepts. Provide 5 multiple-choice questions.",
      prompt: `Content: ${content}\n\nGenerate a quiz.`,
      schema: z.object({
        questions: z.array(z.object({
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number().describe("Index of the correct answer (0-3)"),
          explanation: z.string().describe("Explanation of why the answer is correct")
        }))
      })
    })

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        document_id: documentId,
        user_id: user.id,
        questions: object.questions
      })
      .select()
      .single()

    if (quizError) throw quizError

    return { success: true, quiz: object, quizId: quizData.id }
  } catch (error) {
    console.error('Error generating quiz:', error)
    return { success: false, error: 'Failed to generate quiz' }
  }
}

export async function saveQuizAttempt(quizId: string, score: number, totalQuestions: number, answers: number[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  try {
    const { error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        score,
        total_questions: totalQuestions,
        answers
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error saving quiz attempt:', error)
    return { success: false, error: 'Failed to save quiz attempt' }
  }
}

export async function getLatestQuiz(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!quiz) return null

  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quiz.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { quiz, attempt }
}

export async function generatePodcast(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch document content
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('content, query')
    .eq('id', documentId)
    .single()

  if (docError || !document || !document.content) {
    throw new Error('Document not found or has no content')
  }

  // Generate audio
  const mp3 = await openaiClient.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: document.content.substring(0, 4096), // OpenAI limit is 4096 chars
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())

  // Upload to storage
  const fileName = `${user.id}/${documentId}-${Date.now()}.mp3`
  const { error: uploadError } = await supabase
    .storage
    .from('podcasts')
    .upload(fileName, buffer, {
      contentType: 'audio/mpeg',
      upsert: true
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error('Failed to upload audio')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('podcasts')
    .getPublicUrl(fileName)

  // Save to database
  const { error: dbError } = await supabase
    .from('podcasts')
    .insert({
      document_id: documentId,
      user_id: user.id,
      audio_url: publicUrl
    })

  if (dbError) {
    console.error('DB error:', dbError)
    throw new Error('Failed to save podcast record')
  }

  return publicUrl
}

export async function getPodcast(documentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('podcasts')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

export async function generateFlashcards(documentId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Check if flashcards already exist
  const { data: existing } = await supabase
    .from('flashcards')
    .select('*')
    .eq('document_id', documentId)
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: true, flashcards: existing[0] }
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      system: "You are an expert educator. Create a set of flashcards to help a student learn the key concepts from the provided text. Each flashcard should have a 'front' (question or term) and a 'back' (answer or definition).",
      prompt: `Create 5-10 flashcards for the following content: ${content}`,
      schema: z.object({
        cards: z.array(z.object({
          front: z.string(),
          back: z.string()
        }))
      })
    })

    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        document_id: documentId,
        user_id: user.id,
        cards: object.cards
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, flashcards: data }
  } catch (error) {
    console.error('Error generating flashcards:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate flashcards' }
  }
}

export async function getFlashcards(documentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('document_id', documentId)
    .single()

  if (error) return null
  return data
}

export async function updateNote(id: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('documents')
    .update({ note })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating note:', error)
    throw new Error('Failed to update note')
  }

  // Find root to revalidate
  let currentId = id
  let rootId = id
  
  // Simple loop to find root (max depth is small usually)
  let depth = 0
  while (depth < 10) {
    const { data: doc } = await supabase
      .from('documents')
      .select('parent_id')
      .eq('id', currentId)
      .single()
      
    if (!doc || !doc.parent_id) {
      rootId = currentId
      break
    }
    currentId = doc.parent_id
    depth++
  }

  revalidatePath('/documents')
  revalidatePath(`/dashboard/${rootId}`)
  revalidatePath(`/boards/${id}`)
}

export async function generateResources(topic: string, content: string | null) {
  try {
    let searchContext = '';
    try {
      // Perform web searches to get real-time data
      // Run sequentially with delays to avoid rate limiting
      const videoResults = await search(`${topic} best youtube videos tutorials`, { safeSearch: SafeSearchType.STRICT });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const articleResults = await search(`${topic} best articles documentation guide`, { safeSearch: SafeSearchType.STRICT });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bookResults = await search(`${topic} best books`, { safeSearch: SafeSearchType.STRICT });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const influencerResults = await search(`${topic} top experts influencers`, { safeSearch: SafeSearchType.STRICT });

      searchContext = `
        YouTube Search Results:
        ${videoResults.results.slice(0, 5).map(r => `- ${r.title}: ${r.url}`).join('\n')}

        Article Search Results:
        ${articleResults.results.slice(0, 5).map(r => `- ${r.title}: ${r.url}`).join('\n')}

        Book Search Results:
        ${bookResults.results.slice(0, 5).map(r => `- ${r.title}: ${r.url}`).join('\n')}

        Influencer Search Results:
        ${influencerResults.results.slice(0, 5).map(r => `- ${r.title}: ${r.url}`).join('\n')}
      `;
    } catch (error) {
      console.error('Web search failed:', error);
      searchContext = "Web search failed. Please generate resources based on your internal knowledge. Ensure links are valid and well-known.";
    }

    const { object } = await generateObject({
      model: openai('gpt-4o'),
      system: "You are a helpful research assistant. Your goal is to find high-quality learning resources for the given topic. Use the provided search results to generate a curated list of YouTube videos, articles, books, and influencers. Prioritize using the actual links and titles found in the search results to ensure accuracy.",
      prompt: `Find learning resources for the topic: "${topic}". \n\nContext/Content: ${content ? content.substring(0, 500) : 'No content provided'}\n\nWeb Search Results:\n${searchContext}`,
      schema: z.object({
        youtubeVideos: z.array(z.object({
          title: z.string(),
          url: z.string(),
          channelName: z.string()
        })).describe("List of 3-5 relevant YouTube videos"),
        articles: z.array(z.object({
          title: z.string(),
          url: z.string(),
          source: z.string()
        })).describe("List of 3-5 relevant articles or documentation"),
        books: z.array(z.object({
          title: z.string(),
          author: z.string(),
          description: z.string()
        })).describe("List of 2-3 relevant books"),
        influencers: z.array(z.object({
          name: z.string(),
          platform: z.string(),
          handle: z.string(),
          description: z.string()
        })).describe("List of 3-5 key influencers or experts in this field")
      })
    })

    return { success: true, resources: object }
  } catch (error) {
    console.error('Error generating resources:', error)
    return { success: false, error: 'Failed to generate resources' }
  }
}

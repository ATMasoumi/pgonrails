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
      model: openai('gpt-4o-mini'),
      system: `You are a world-class curriculum designer and subject matter expert. Your task is to create an optimal learning tree that transforms any topic into a structured, pedagogically-sound knowledge map.

PRINCIPLES:
1. **Progressive Complexity**: Start with foundational concepts, then build to advanced topics
2. **Logical Dependencies**: Order subtopics so prerequisites come before dependent concepts
3. **Comprehensive Coverage**: Include all essential areas - theory, practice, history, and applications
4. **Balanced Depth**: Aim for 4-7 main branches, each with 3-5 sub-branches
5. **Actionable Titles**: Use clear, specific titles that indicate what the learner will understand

STRUCTURE GUIDELINES:
- First branch: Fundamentals/Introduction/Core Concepts
- Middle branches: Main subject areas in logical learning order
- Later branches: Advanced topics, applications, and real-world connections
- Final branch: Current trends, future directions, or practical projects

TITLE FORMAT:
- Be specific and descriptive (e.g., "Newton's Laws of Motion" not just "Laws")
- Avoid vague terms like "Basics" or "Overview" - specify what basics
- Use active language when appropriate (e.g., "Understanding X" or "Applying Y")`,
      prompt: `Create a comprehensive learning tree for: "${query}"

Generate a well-structured knowledge tree that would help someone master this topic from beginner to advanced level.`,
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
        model: openai('gpt-4o-mini'),
        system: `You are an expert curriculum designer specializing in breaking down complex topics into learnable components.

Your task is to generate subtopics that:
1. **Fit the Context**: Each subtopic must be specifically relevant to the parent topic within the given learning path
2. **Are Appropriately Scoped**: Not too broad (could be its own course) or too narrow (just a detail)
3. **Follow Learning Order**: Prerequisites and fundamentals first, then applications and advanced concepts
4. **Are Distinct**: No overlapping subtopics - each covers unique ground
5. **Are Actionable**: Titles should clearly indicate what the learner will understand or be able to do

GENERATE 5-8 SUBTOPICS that would help someone deeply understand the topic in context.

Title Guidelines:
- Be specific: "Gradient Descent Optimization" not "Optimization"
- Include key terms someone would search for
- Avoid redundancy with parent topic name
- Use consistent style (all noun phrases or all "Understanding X" format)`,
        prompt: `Learning Path: ${contextString}

Generate focused subtopics for: "${currentTopic}"

These subtopics should help someone who has followed the learning path above to deeply understand ${currentTopic}.`,
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
    .select('id, query, content')
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

  const updatePayload: { is_public: boolean; published_at?: string } = { is_public: isPublic }
  if (isPublic) {
    updatePayload.published_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('documents')
    .update(updatePayload)
    .in('id', Array.from(descendants))

  if (error) throw error

  // Generate description if making public and no content exists
  if (isPublic && (!doc.content || doc.content.length < 20)) {
    try {
      // Fetch immediate children for context
      const { data: children } = await supabase
        .from('documents')
        .select('query')
        .eq('parent_id', id)
        .limit(5)

      const childrenTopics = children?.map(c => c.query).join(', ') || ''
      
      const { text: description } = await generateText({
        model: openai('gpt-4o-mini'),
        system: 'You are an expert curator of knowledge trees. Your goal is to write compelling, concise descriptions.',
        prompt: `Generate a short, engaging description (max 250 characters) for a public knowledge tree titled "${doc.query}".
                 
                 Key subtopics in this tree include: ${childrenTopics}.
                 
                 The description should explain what the user will learn and why it's interesting. Do not use hashtags or emojis.`
      })

      if (description) {
        await supabase
          .from('documents')
          .update({ content: description })
          .eq('id', id)
      }
    } catch (err) {
      console.error('Error generating description:', err)
      // Don't fail the request if description generation fails
    }
  }

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
      model: openai('gpt-4o-mini'),
      system: `You are an expert educator and assessment designer. Your task is to create a comprehensive quiz that thoroughly tests understanding of the provided content.

QUIZ DESIGN PRINCIPLES:
1. **Complete Coverage**: Generate enough questions to cover ALL major concepts, facts, and ideas in the content
2. **Bloom's Taxonomy**: Include questions at different cognitive levels:
   - Knowledge/Recall (basic facts)
   - Comprehension (understanding concepts)
   - Application (using knowledge in new situations)
   - Analysis (breaking down complex ideas)
3. **Question Quality**: Each question should:
   - Be clear and unambiguous
   - Have exactly 4 plausible options
   - Have only ONE correct answer
   - Include a helpful explanation that teaches, not just confirms

QUESTION DISTRIBUTION:
- 30% Basic recall/definition questions
- 40% Understanding/comprehension questions  
- 30% Application/analysis questions

Generate 10-15 questions to ensure comprehensive coverage of the material.`,
      prompt: `Create a comprehensive quiz for the following content. Make sure to cover all the key topics, concepts, and details mentioned:\n\n${content}`,
      schema: z.object({
        questions: z.array(z.object({
          question: z.string().describe("A clear, well-formed question"),
          options: z.array(z.string()).length(4).describe("Exactly 4 answer options"),
          correctAnswer: z.number().min(0).max(3).describe("Index of the correct answer (0-3)"),
          explanation: z.string().describe("A detailed explanation that helps the learner understand why this answer is correct and why others are wrong")
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

  // Fix for self-hosted/docker environments where SUPABASE_URL might be internal
  // We want to store the public-facing URL so the client can access it
  let finalUrl = publicUrl
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const internalUrlObj = new URL(publicUrl)
      const publicUrlObj = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      finalUrl = publicUrl.replace(internalUrlObj.origin, publicUrlObj.origin)
    } catch (e) {
      console.error('Error replacing URL origin:', e)
    }
  }

  // Save to database
  const { error: dbError } = await supabase
    .from('podcasts')
    .insert({
      document_id: documentId,
      user_id: user.id,
      audio_url: finalUrl
    })

  if (dbError) {
    console.error('DB error:', dbError)
    throw new Error('Failed to save podcast record')
  }

  return finalUrl
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

  // Runtime fix for self-hosted environments
  if (data && data.audio_url && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(data.audio_url)
      const publicUrlObj = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      // Only replace if the origins are different (e.g. internal vs public)
      if (url.origin !== publicUrlObj.origin) {
        data.audio_url = data.audio_url.replace(url.origin, publicUrlObj.origin)
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  return data
}

export async function generateFlashcards(documentId: string, content: string, forceRegenerate: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Check if flashcards already exist (unless forcing regeneration)
  if (!forceRegenerate) {
    const { data: existing } = await supabase
      .from('flashcards')
      .select('*')
      .eq('document_id', documentId)
      .limit(1)

    if (existing && existing.length > 0) {
      return { success: true, flashcards: existing[0] }
    }
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are an expert educator and instructional designer. Create a comprehensive set of flashcards to help students master the key concepts from the provided educational content.

FLASHCARD DESIGN PRINCIPLES:
1. Active Recall - Questions should test understanding, not just recognition
2. One Concept Per Card - Each card focuses on a single, specific piece of knowledge
3. Varied Question Types - Include definitions, applications, comparisons, and examples
4. Progressive Difficulty - Mix basic facts with more challenging conceptual questions

CARD CATEGORIES TO INCLUDE:
- Key Terms & Definitions
- Core Concepts & Principles  
- Cause & Effect relationships
- Comparisons & Contrasts
- Real-world Applications
- Common Misconceptions (as "True or False" or "What's wrong with...")

FORMAT:
- Front: Clear, focused question or prompt (avoid yes/no questions when possible)
- Back: Concise but complete answer (typically 1-3 sentences)`,
      prompt: `Create 12-18 high-quality flashcards covering all major concepts from the following educational content. Ensure comprehensive coverage across different cognitive levels:

${content}`,
      schema: z.object({
        cards: z.array(z.object({
          front: z.string().describe('The question or prompt on the front of the flashcard'),
          back: z.string().describe('The answer or explanation on the back of the flashcard')
        }))
      })
    })

    // Delete existing flashcards if regenerating
    if (forceRegenerate) {
      await supabase
        .from('flashcards')
        .delete()
        .eq('document_id', documentId)
    }

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

export async function updateFlashcardsMastered(documentId: string, masteredIndices: number[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('flashcards')
    .update({ mastered_indices: masteredIndices })
    .eq('document_id', documentId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating mastered flashcards:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
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

export async function generateResources(documentId: string, topic: string, content: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Check if resources already exist
  const { data: existing } = await supabase
    .from('resources')
    .select('*')
    .eq('document_id', documentId)
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: true, resources: existing[0].data }
  }

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
      model: openai('gpt-4o-mini'),
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

    const { error } = await supabase
      .from('resources')
      .insert({
        document_id: documentId,
        user_id: user.id,
        data: object
      })

    if (error) throw error

    return { success: true, resources: object }
  } catch (error) {
    console.error('Error generating resources:', error)
    return { success: false, error: 'Failed to generate resources' }
  }
}

export async function getResources(documentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('document_id', documentId)
    .single()

  if (error) return null
  return data
}

export async function generateSummary(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch document content
  const { data: document } = await supabase
    .from('documents')
    .select('content, summary')
    .eq('id', documentId)
    .single()

  if (!document) throw new Error('Document not found')
  if (document.summary) return { success: true, summary: document.summary }

  if (!document.content) return { success: false, error: 'No content to summarize' }

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: "You are an expert summarizer. Create a concise but comprehensive summary of the provided text in HTML format. Use appropriate tags like <p>, <ul>, <li>, <strong>, <h3> etc. Do not include <html>, <head>, or <body> tags, just the content body. Do NOT wrap the output in markdown code blocks (like ```html). Return raw HTML only.",
      prompt: `Summarize the following content:\n\n${document.content}`,
    })

    // Clean up any potential markdown code blocks
    const cleanText = text.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')

    // Save summary
    const { error } = await supabase
      .from('documents')
      .update({ summary: cleanText })
      .eq('id', documentId)

    if (error) throw error

    revalidatePath('/dashboard/[id]')
    return { success: true, summary: cleanText }
  } catch (error) {
    console.error('Error generating summary:', error)
    return { success: false, error: 'Failed to generate summary' }
  }
}

export async function deleteSummary(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  try {
    const { error } = await supabase
      .from('documents')
      .update({ summary: null })
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/[id]')
    return { success: true }
  } catch (error) {
    console.error('Error deleting summary:', error)
    return { success: false, error: 'Failed to delete summary' }
  }
}

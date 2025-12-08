"use server"

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { openai } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import OpenAI from 'openai'
// Serper API helper for Google search with retry
const serperSearch = async (query: string, retries = 2): Promise<{ organic: Array<{ title: string; link: string; snippet?: string }> }> => {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    console.log('[Serper] No API key found');
    throw new Error('Serper API key not configured');
  }
  
  console.log('[Serper] Searching:', query.substring(0, 50) + '...');
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, num: 20 })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Serper] API error:', response.status, errorText);
        throw new Error(`Serper API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[Serper] Got', data.organic?.length || 0, 'results');
      return data;
    } catch (error: unknown) {
      const isNetworkError = error instanceof Error && 
        (error.message.includes('fetch failed') || 
         error.message.includes('ENOTFOUND') ||
         error.cause?.toString().includes('ENOTFOUND'));
      
      if (isNetworkError && attempt < retries) {
        console.log(`[Serper] Network error, retrying in ${(attempt + 1) * 2}s... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Serper search failed after retries');
}
import { checkAndIncrementUsage } from '@/lib/token-usage'
import { getUserSubscriptionStatus } from '@/lib/subscription'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

async function generateInitialTree(supabase: SupabaseClient, rootId: string, query: string, userId: string) {
  try {
    const { object, usage } = await generateObject({
      model: openai('gpt-5-mini'),
      system: `You are an expert that generates clean, balanced knowledge trees for any topic.
Your job is to break the topic into a hierarchy of subtopics that covers the whole concept, without being too shallow or too detailed.

TREE STRUCTURE:
- Level 1: 4-8 major subtopics that cover the entire subject
- Level 2: For each Level 1 node, add 3-7 more specific subtopics  
- Level 3 (optional): Only if needed, add 2-5 very focused subtopics under some Level 2 nodes
- Keep the tree between 20 and 60 total nodes
- Maintain balanced structure - avoid one huge branch and many tiny ones

TITLE RULES (Critical for searchability):
- Short, clear, readable: 3-6 words preferred, maximum 8 words
- Each title must be searchable on the internet
- Include the main keyword of that subtopic
- Use concrete, Google-friendly phrases like:
  ✓ "Supervised learning algorithms"
  ✓ "iOS concurrency with async/await"  
  ✓ "Database indexing strategies"
- Avoid vague or poetic titles like:
  ✗ "Going deeper"
  ✗ "The journey begins"
  ✗ "Understanding more"
- No emojis, no special characters, no numbering

CONTENT COVERAGE:
- Fundamentals and definitions
- Key components and categories
- Methods, workflows, techniques
- Tools and technologies (if relevant)
- Use cases and applications
- Common mistakes and pitfalls
- Advanced or future directions (if relevant)

GRANULARITY:
- Each node should represent a meaningful subtopic
- Could be the title of an article, podcast episode, or quiz section
- Not so detailed it becomes trivia
- Not so high-level the tree feels empty`,
      prompt: `Create a comprehensive knowledge tree for: "${query}"

Generate a well-structured tree that helps someone master this topic from beginner to advanced level. Return subtopics organized hierarchically.`,
      schema: z.object({
        subtopics: z.array(z.object({
          query: z.string().describe("Level 1 subtopic title - 3-8 words, searchable"),
          subtopics: z.array(z.object({
            query: z.string().describe("Level 2 subtopic title - 3-8 words, searchable"),
            subtopics: z.array(z.object({
              query: z.string().describe("Level 3 subtopic title - 3-8 words, searchable")
            })).optional().describe("Optional Level 3 subtopics, only if needed for complex areas")
          })).optional()
        })).describe("4-8 major subtopics covering the entire subject")
      })
    })

    if (usage) {
      console.log(`[Initial Tree] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(userId, usage.totalTokens, 'gpt-5-mini')
    } else {
      console.log('[Initial Tree] No token usage returned from AI provider')
    }

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
        for (const l2Subtopic of subtopic.subtopics) {
          const { data: l2Node, error: l2Error } = await supabase
            .from('documents')
            .insert({
              user_id: userId,
              query: l2Subtopic.query,
              parent_id: l1Node.id,
              content: null
            })
            .select()
            .single()
          
          if (l2Error) {
            console.error('Error inserting L2 node:', l2Error)
            continue
          }

          // Insert Level 3 nodes if they exist
          if (l2Subtopic.subtopics && l2Subtopic.subtopics.length > 0) {
            const l3Nodes = l2Subtopic.subtopics.map(st => ({
              user_id: userId,
              query: st.query,
              parent_id: l2Node.id,
              content: null
            }))
            
            const { error: l3Error } = await supabase
              .from('documents')
              .insert(l3Nodes)
              
            if (l3Error) console.error('Error inserting L3 nodes:', l3Error)
          }
        }
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

  // Check limits
  await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

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

async function processTopicGeneration(
  userId: string,
  id: string,
  type: 'subtopic' | 'explanation',
  contextString: string,
  currentTopic: string,
  isPro: boolean
) {
  const supabase = await createAdminClient()

  if (type === 'subtopic') {
    try {
      const { object, usage } = await generateObject({
        model: openai('gpt-5-mini'),
        system: `You are an expert that generates focused subtopics for knowledge trees.

SUBTOPIC GENERATION RULES:
- Generate 4-7 subtopics that break down the topic into learnable parts
- Each subtopic must be specifically relevant to the parent topic
- Scope appropriately: not too broad, not too narrow
- Prerequisites first, then applications and advanced concepts
- No overlapping subtopics - each covers unique ground

TITLE RULES (Critical for searchability):
- Short and clear: 3-6 words preferred, maximum 8 words
- Must be searchable on the internet
- Include the main keyword of that subtopic
- Use concrete, Google-friendly phrases like:
  ✓ "Binary search tree operations"
  ✓ "React state management patterns"
  ✓ "SQL join query optimization"
- Avoid vague titles like:
  ✗ "More details"
  ✗ "Going deeper"
  ✗ "Advanced concepts"
- No emojis, no special characters, no numbering
- Avoid redundancy with parent topic name`,
        prompt: `Learning Path: ${contextString}

Generate focused subtopics for: "${currentTopic}"

These subtopics should help someone who has followed the learning path above to deeply understand ${currentTopic}.`,
        schema: z.object({
          subtopics: z.array(z.string().describe("Subtopic title - 3-8 words, searchable, specific"))
        })
      })

      if (usage) {
        console.log(`[Subtopics] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
        await checkAndIncrementUsage(userId, usage.totalTokens, 'gpt-5-mini')
      } else {
        console.log('[Subtopics] No token usage returned from AI provider')
      }

      const { error } = await supabase
        .from('documents')
        .insert(
          object.subtopics.map((topic: string) => ({
            user_id: userId,
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
      const modelName = isPro ? 'gpt-5-mini' : 'gpt-5-mini'
      const { text, usage } = await generateText({
        model: openai(modelName),
        system: "You are an expert academic researcher and writer. Generate a highly comprehensive, detailed, and in-depth article about the requested topic. The content should be extensive, covering history, key concepts, theoretical foundations, practical applications, current state, future implications, and relevant examples. Use clear markdown formatting with multiple headers, lists, and code blocks where appropriate. Aim for a deep dive into the subject matter that provides significant value and insight.",
        prompt: `Context path: ${contextString}\n\nGenerate a comprehensive article for: ${currentTopic}`
      })

      if (usage) {
        console.log(`[Content Generation] Token usage: ${usage.totalTokens} tokens (Model: ${modelName})`)
        await checkAndIncrementUsage(userId, usage.totalTokens, modelName)
      } else {
        console.log('[Content Generation] No token usage returned from AI provider')
      }

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

export async function generateTopicContent(id: string, type: 'subtopic' | 'explanation') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  // Check limits
  await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

  const { isPro } = await getUserSubscriptionStatus()

  const path = await getTopicPath(supabase, id)
  const contextString = path.join(' > ')
  const currentTopic = path[path.length - 1]

  // Await generation to handle errors (like token limits) and propagate them to the client
  await processTopicGeneration(user.id, id, type, contextString, currentTopic, isPro)

  return { success: true, message: "Generation completed" }
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



export async function generateQuiz(documentId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

  try {
    const { object, usage } = await generateObject({
      model: openai('gpt-5-mini'),
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

    if (usage) {
      console.log(`[Quiz] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    } else {
      console.log('[Quiz] No token usage returned from AI provider')
    }

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

  const input = document.content.substring(0, 4096)
  const charCount = input.length

  // OpenAI TTS is billed by character, not token.
  // The API does not return a usage field, so we calculate cost based on input length.
  console.log(`[Podcast] Token usage: ${charCount} characters (Model: tts-1)`)
  await checkAndIncrementUsage(user.id, charCount, 'tts-1')

  // Generate audio
  const openaiClient = getOpenAIClient()
  const mp3 = await openaiClient.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input, // OpenAI limit is 4096 chars
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
    } catch {
      // Ignore URL parsing errors
    }
  }

  return data
}

export async function generateFlashcards(documentId: string, content: string, forceRegenerate: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

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
    const { object, usage } = await generateObject({
      model: openai('gpt-5-mini'),
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

    if (usage) {
      console.log(`[Flashcards] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    } else {
      console.log('[Flashcards] No token usage returned from AI provider')
    }

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

  await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

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
    
    // Check if Serper API key is available
    const serperApiKey = process.env.SERPER_API_KEY;
    
    if (serperApiKey) {
      try {
        console.log('[Resources] Starting Serper search for topic:', topic);
        
        // Use Serper (Google Search) for reliable web search
        // Run searches in parallel for speed
        const [youtubeResponse, articleResponse, bookResponse, expertResponse] = await Promise.all([
          serperSearch(`site:youtube.com ${topic} tutorial course explained`),
          serperSearch(`${topic} tutorial guide site:medium.com OR site:dev.to OR site:freecodecamp.org`),
          serperSearch(`${topic} best books site:goodreads.com OR site:amazon.com`),
          serperSearch(`${topic} expert site:twitter.com OR site:linkedin.com`)
        ]);

        console.log('[Resources] Serper raw responses:', {
          youtube: youtubeResponse.organic?.length || 0,
          articles: articleResponse.organic?.length || 0,
          books: bookResponse.organic?.length || 0,
          experts: expertResponse.organic?.length || 0
        });

        // Extract and categorize results
        const youtubeResults = (youtubeResponse.organic || [])
          .filter(r => r.link.includes('youtube.com/watch') || r.link.includes('youtu.be'))
          .slice(0, 6);
        
        const articleResults = (articleResponse.organic || [])
          .filter(r => !r.link.includes('youtube.com'))
          .slice(0, 6);
        
        const bookResults = (bookResponse.organic || [])
          .filter(r => r.link.includes('amazon.com') || r.link.includes('goodreads.com'))
          .slice(0, 4);
        
        const expertResults = (expertResponse.organic || [])
          .filter(r => r.link.includes('twitter.com') || r.link.includes('x.com') || r.link.includes('linkedin.com'))
          .slice(0, 4);

        console.log('[Resources] Filtered results:', {
          youtube: youtubeResults.map(r => ({ title: r.title, url: r.link })),
          articles: articleResults.map(r => ({ title: r.title, url: r.link })),
          books: bookResults.map(r => ({ title: r.title, url: r.link })),
          experts: expertResults.map(r => ({ title: r.title, url: r.link }))
        });

        searchContext = `
=== YOUTUBE VIDEOS (from Google search) ===
${youtubeResults.length > 0 ? youtubeResults.map(r => `Title: ${r.title}\nURL: ${r.link}\nDescription: ${r.snippet || 'N/A'}`).join('\n\n') : 'No YouTube results found.'}

=== ARTICLES & DOCUMENTATION (from Google search) ===
${articleResults.length > 0 ? articleResults.map(r => `Title: ${r.title}\nURL: ${r.link}\nSource: ${new URL(r.link).hostname.replace('www.', '')}`).join('\n\n') : 'No article results found.'}

=== BOOKS (from Google search) ===
${bookResults.length > 0 ? bookResults.map(r => `Title: ${r.title}\nURL: ${r.link}`).join('\n\n') : 'No book results found.'}

=== EXPERTS (from Google search) ===
${expertResults.length > 0 ? expertResults.map(r => `Title: ${r.title}\nURL: ${r.link}`).join('\n\n') : 'No expert profiles found.'}
        `;
        
        console.log('[Resources] Serper search completed successfully');
        console.log('[Resources] Search context length:', searchContext.length, 'chars');
      } catch (searchError) {
        console.error('[Resources] Serper search failed:', searchError);
        searchContext = '';
      }
    }
    
    // If no search results (no API key or search failed), use AI knowledge
    if (!searchContext) {
      console.log('[Resources] Using AI knowledge for resource generation');
      searchContext = `No web search available. Generate high-quality resources based on your knowledge:

For the topic "${topic}", recommend REAL, VERIFIED resources:
- Well-known YouTube channels and their specific educational videos
- Popular articles from Medium, freeCodeCamp, dev.to, official documentation
- Classic and highly-rated books with real authors
- Recognized experts and thought leaders with real Twitter/LinkedIn handles

IMPORTANT: Only recommend resources you are confident actually exist.`;
    }

    const { object, usage } = await generateObject({
      model: openai('gpt-5-mini'),
      system: `You are an expert educational curator specializing in finding the highest quality learning resources. Your goal is to recommend ONLY genuinely useful, verified resources that will help someone master the given topic.

CRITICAL GUIDELINES:

For YouTube Videos:
- If search results are available, use URLs from them
- If not, recommend well-known educational channels (e.g., 3Blue1Brown, Fireship, Traversy Media, freeCodeCamp, etc.)
- Use valid YouTube URL format: https://www.youtube.com/watch?v=VIDEO_ID or https://www.youtube.com/@CHANNEL
- Prefer channels with educational focus and high-quality production

For Articles:
- Prefer articles from reputable sources: official documentation, Medium publications, dev.to, freeCodeCamp, etc.
- Look for comprehensive guides, tutorials, and in-depth explanations
- Include the actual domain as the source (e.g., "Medium", "freeCodeCamp", "Official Docs")

For Books:
- Recommend well-established, highly-rated books on the topic
- Include classic texts and modern essentials
- Provide a brief description of why each book is valuable

For Experts/Influencers:
- Recommend real, verifiable experts in the field
- Include their primary platform (Twitter, LinkedIn, YouTube, etc.)
- Provide their actual handle/username when available
- Only include people who actively share educational content

IMPORTANT: Only return resources you are confident are real and useful. Quality over quantity.`,
      prompt: `Find the best learning resources for: "${topic}"

Topic Context: ${content ? content.substring(0, 800) : 'No additional context'}

Web Search Results:
${searchContext}

Based on these search results and your knowledge, provide the highest quality learning resources. Use the actual URLs from the search results when available.`,
      schema: z.object({
        youtubeVideos: z.array(z.object({
          title: z.string().describe("The exact video title"),
          url: z.string().describe("Full YouTube URL (must be youtube.com/watch?v= format)"),
          channelName: z.string().describe("The YouTube channel name")
        })).describe("3-5 high-quality educational YouTube videos"),
        articles: z.array(z.object({
          title: z.string().describe("The article title"),
          url: z.string().describe("Full article URL"),
          source: z.string().describe("The website name (e.g., 'Medium', 'freeCodeCamp', 'Official Docs')")
        })).describe("3-5 comprehensive articles or documentation pages"),
        books: z.array(z.object({
          title: z.string().describe("The book title"),
          author: z.string().describe("The author's name"),
          description: z.string().describe("Why this book is valuable for learning this topic (1-2 sentences)")
        })).describe("2-4 highly recommended books"),
        influencers: z.array(z.object({
          name: z.string().describe("The person's real name"),
          platform: z.string().describe("Primary platform: 'Twitter', 'LinkedIn', 'YouTube', etc."),
          handle: z.string().describe("Their username/handle on the platform"),
          description: z.string().describe("Their expertise and why they're worth following (1 sentence)")
        })).describe("3-5 recognized experts who share educational content")
      })
    })

    // Post-process to validate and clean URLs
    const cleanedObject = {
      youtubeVideos: object.youtubeVideos.filter(v => 
        v.url.includes('youtube.com/watch') || v.url.includes('youtu.be')
      ),
      articles: object.articles.filter(a => 
        a.url.startsWith('http') && !a.url.includes('youtube.com')
      ),
      books: object.books,
      influencers: object.influencers.filter(i => 
        i.name && i.platform && i.handle
      )
    };

    if (usage) {
      console.log(`[Resources] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    } else {
      console.log('[Resources] No token usage returned from AI provider')
    }

    const { error } = await supabase
      .from('resources')
      .insert({
        document_id: documentId,
        user_id: user.id,
        data: cleanedObject
      })

    if (error) throw error

    return { success: true, resources: cleanedObject }
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

  await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

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
    const { text, usage } = await generateText({
      model: openai('gpt-5-mini'),
      system: "You are an expert summarizer. Create a concise but comprehensive summary of the provided text in HTML format. Use appropriate tags like <p>, <ul>, <li>, <strong>, <h3> etc. Do not include <html>, <head>, or <body> tags, just the content body. Do NOT wrap the output in markdown code blocks (like ```html). Return raw HTML only.",
      prompt: `Summarize the following content:\n\n${document.content}`,
    })

    if (usage) {
      console.log(`[Summary] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    } else {
      console.log('[Summary] No token usage returned from AI provider')
    }

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

export async function updateNodePosition(id: string, x: number, y: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('documents')
    .update({ position_x: x, position_y: y })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating node position:', error)
    throw new Error('Failed to update node position')
  }

  return { success: true }
}

export async function getChatMessages(documentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true })
  
  return data || []
}

// ============================================================================
// DOCUMENT HIGHLIGHTS
// ============================================================================

export async function getDocumentHighlights(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('document_highlights')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching highlights:', error)
    return []
  }

  return data || []
}

export async function addDocumentHighlight(documentId: string, highlightedText: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // First check if highlight already exists
  const { data: existing } = await supabase
    .from('document_highlights')
    .select()
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .eq('highlighted_text', highlightedText)
    .maybeSingle()

  if (existing) {
    // If note is provided and different, update it
    if (note !== undefined && existing.note !== note) {
      const { data: updated } = await supabase
        .from('document_highlights')
        .update({ note })
        .eq('id', existing.id)
        .select()
        .single()
      return updated
    }
    return existing
  }

  // Insert new highlight
  const { data, error } = await supabase
    .from('document_highlights')
    .insert({
      document_id: documentId,
      user_id: user.id,
      highlighted_text: highlightedText,
      note: note || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding highlight:', error)
    throw new Error('Failed to add highlight')
  }

  return data
}

export async function updateDocumentHighlightNote(documentId: string, highlightedText: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('document_highlights')
    .update({ note })
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .eq('highlighted_text', highlightedText)
    .select()
    .single()

  if (error) {
    console.error('Error updating highlight note:', error)
    throw new Error('Failed to update highlight note')
  }

  return data
}

export async function removeDocumentHighlight(documentId: string, highlightedText: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('document_highlights')
    .delete()
    .eq('document_id', documentId)
    .eq('user_id', user.id)
    .eq('highlighted_text', highlightedText)

  if (error) {
    console.error('Error removing highlight:', error)
    throw new Error('Failed to remove highlight')
  }

  return { success: true }
}

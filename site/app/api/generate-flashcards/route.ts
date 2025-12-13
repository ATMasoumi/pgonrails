import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { checkAndIncrementUsage } from '@/lib/token-usage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { documentId, forceRegenerate = false } = await req.json()

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check limits
    await checkAndIncrementUsage(user.id, 0, 'gpt-5-mini')

    // Fetch document content
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('content, query')
      .eq('id', documentId)
      .single()

    if (docError || !document || !document.content) {
      return NextResponse.json({ error: 'Document not found or has no content' }, { status: 404 })
    }

    // Check if flashcards already exist (unless forcing regeneration)
    if (!forceRegenerate) {
      const { data: existing } = await supabase
        .from('flashcards')
        .select('*')
        .eq('document_id', documentId)
        .limit(1)

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: true,
          flashcards: existing[0],
          isExisting: true
        })
      }
    }

    // Generate new flashcards
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

${document.content}`,
      schema: z.object({
        cards: z.array(z.object({
          front: z.string().describe('The question or prompt on the front of the flashcard'),
          back: z.string().describe('The answer or explanation on the back of the flashcard')
        }))
      })
    })

    if (usage) {
      console.log(`[Flashcards API] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    }

    // Delete existing flashcards if regenerating
    if (forceRegenerate) {
      await supabase
        .from('flashcards')
        .delete()
        .eq('document_id', documentId)
    }

    // Save flashcards to database
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        document_id: documentId,
        user_id: user.id,
        cards: object.cards
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving flashcards:', error)
      return NextResponse.json({ error: 'Failed to save flashcards' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      flashcards: data,
      isExisting: false
    })
  } catch (error) {
    console.error('[Flashcards API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 })
  }
}

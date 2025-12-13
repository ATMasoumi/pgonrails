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
    const { documentId } = await req.json()

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

    // Check if quiz already exists
    const { data: existingQuiz } = await supabase
      .from('quizzes')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingQuiz) {
      // Return existing quiz
      const { data: attempt } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', existingQuiz.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return NextResponse.json({
        success: true,
        quiz: existingQuiz,
        attempt,
        isExisting: true
      })
    }

    // Generate new quiz
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
      prompt: `Create a comprehensive quiz for the following content. Make sure to cover all the key topics, concepts, and details mentioned:\n\n${document.content}`,
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
      console.log(`[Quiz API] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    }

    // Save quiz to database
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        document_id: documentId,
        user_id: user.id,
        questions: object.questions
      })
      .select()
      .single()

    if (quizError) {
      console.error('Error saving quiz:', quizError)
      return NextResponse.json({ error: 'Failed to save quiz' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      quiz: { ...quizData, questions: object.questions },
      isExisting: false
    })
  } catch (error) {
    console.error('[Quiz API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}

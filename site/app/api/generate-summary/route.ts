import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
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
      .select('content, summary')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Return existing summary if available
    if (document.summary) {
      return NextResponse.json({
        success: true,
        summary: document.summary,
        isExisting: true
      })
    }

    if (!document.content) {
      return NextResponse.json({ error: 'No content to summarize' }, { status: 400 })
    }

    // Generate summary
    const { text, usage } = await generateText({
      model: openai('gpt-5-mini'),
      system: "You are an expert summarizer. Create a concise but comprehensive summary of the provided text in HTML format. Use appropriate tags like <p>, <ul>, <li>, <strong>, <h3> etc. Do not include <html>, <head>, or <body> tags, just the content body. Do NOT wrap the output in markdown code blocks (like ```html). Return raw HTML only.",
      prompt: `Summarize the following content:\n\n${document.content}`,
    })

    if (usage) {
      console.log(`[Summary API] Token usage: ${usage.totalTokens} tokens (Model: gpt-5-mini)`)
      await checkAndIncrementUsage(user.id, usage.totalTokens, 'gpt-5-mini')
    }

    // Clean up any potential markdown code blocks
    const cleanText = text.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')

    // Save summary to database
    const { error } = await supabase
      .from('documents')
      .update({ summary: cleanText })
      .eq('id', documentId)

    if (error) {
      console.error('Error saving summary:', error)
      return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      summary: cleanText,
      isExisting: false
    })
  } catch (error) {
    console.error('[Summary API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}

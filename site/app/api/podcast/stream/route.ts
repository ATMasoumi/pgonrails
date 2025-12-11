import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAndIncrementUsage } from '@/lib/token-usage'
import { Readable, PassThrough } from 'stream'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const documentId = searchParams.get('documentId')

  console.log(`[Podcast Stream] Request for document ${documentId}`)

  if (!documentId) {
    return new NextResponse('Missing documentId', { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('[Podcast Stream] Unauthorized')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Fetch document content
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('content, query')
    .eq('id', documentId)
    .single()

  if (docError || !document || !document.content) {
    console.log('[Podcast Stream] Document not found')
    return new NextResponse('Document not found', { status: 404 })
  }

  // Check if podcast already exists
  const { data: existingPodcast } = await supabase
    .from('podcasts')
    .select('audio_url')
    .eq('document_id', documentId)
    .single()

  if (existingPodcast) {
     console.log('[Podcast Stream] Podcast already exists, redirecting')
     return NextResponse.redirect(existingPodcast.audio_url)
  }

  const rawContent = document.content.substring(0, 20000)

  if (rawContent.length === 0) {
      console.log('[Podcast Stream] Input is empty')
      return new NextResponse('Document content is empty', { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
      console.error('[Podcast Stream] OPENAI_API_KEY missing')
      return new NextResponse('Server Configuration Error', { status: 500 })
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  let script = ""
  try {
      console.log('[Podcast Stream] Generating script with OpenAI')
      const completion = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
              { role: "system", content: "You are an engaging podcast host. Convert the following article into a natural, conversational podcast script (monologue). Summarize key points, avoid reading verbatim, and keep it under 3800 characters maximum. Be concise but engaging. Do not include any sound effect cues or speaker labels, just the spoken text." },
              { role: "user", content: rawContent }
          ],
      })
      script = completion.choices[0].message.content || ""
      
      // Ensure script doesn't exceed TTS limit (4096 chars)
      if (script.length > 4000) {
        script = script.substring(0, 3997) + "..."
      }
  } catch (e) {
      console.error('[Podcast Stream] Script generation failed:', e)
      return new NextResponse('Failed to generate script', { status: 500 })
  }

  const charCount = script.length
  console.log(`[Podcast Stream] Script generated. Length: ${charCount}`)

  // Check usage
  try {
      await checkAndIncrementUsage(user.id, charCount, 'tts-1')
  } catch (e) {
      console.error('[Podcast Stream] Usage check failed:', e)
      return new NextResponse('Usage limit exceeded', { status: 402 })
  }

  try {
    console.log('[Podcast Stream] Calling OpenAI TTS')
    const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: script,
    })

    console.log('[Podcast Stream] OpenAI response received')

    // Handle stream splitting using Node streams for reliability
    const rawBody = response.body
    let nodeStream: Readable

    if (rawBody && typeof (rawBody as ReadableStream).getReader === 'function') {
        // It's a Web Stream
        // @ts-expect-error - fromWeb expects Web Stream API types
        nodeStream = Readable.fromWeb(rawBody as ReadableStream)
    } else {
        // It's a Node Stream
        nodeStream = rawBody as unknown as Readable
    }

    const stream1 = new PassThrough()
    const stream2 = new PassThrough()

    nodeStream.pipe(stream1)
    nodeStream.pipe(stream2)

    // Background upload task
    const saveToStorage = async () => {
        try {
            console.log('[Podcast Stream] Starting background upload')
            const chunks: Buffer[] = []
            
            for await (const chunk of stream2) {
                chunks.push(Buffer.from(chunk))
            }
            
            const buffer = Buffer.concat(chunks)
            console.log(`[Podcast Stream] Downloaded ${buffer.length} bytes for upload`)
            
            // Upload logic
            const fileName = `${user.id}/${documentId}-${Date.now()}.mp3`
            const { error: uploadError } = await supabase
                .storage
                .from('podcasts')
                .upload(fileName, buffer, {
                    contentType: 'audio/mpeg',
                    upsert: true
                })

            if (uploadError) {
                console.error('[Podcast Stream] Upload error:', uploadError)
                throw uploadError
            }

            const { data: { publicUrl } } = supabase
                .storage
                .from('podcasts')
                .getPublicUrl(fileName)

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

            await supabase
                .from('podcasts')
                .insert({
                    document_id: documentId,
                    user_id: user.id,
                    audio_url: finalUrl
                })
            console.log('[Podcast Stream] Podcast saved successfully')
                
        } catch (e) {
            console.error('[Podcast Stream] Background upload failed:', e)
        }
    }

    // Start background upload
    saveToStorage()

    console.log('[Podcast Stream] Returning stream')
    
    // Manually create Web Stream from Node stream to ensure compatibility
    const webStream1 = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream1) {
                    controller.enqueue(chunk)
                }
                controller.close()
            } catch (e) {
                console.error('[Podcast Stream] Stream error:', e)
                controller.error(e)
            }
        },
        cancel() {
            stream1.destroy()
        }
    })

    return new Response(webStream1, {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
        },
    })
  } catch (error) {
      console.error('[Podcast Stream] OpenAI API error:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
  }
}

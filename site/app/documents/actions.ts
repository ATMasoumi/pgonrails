"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateDocument(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/signin')
  }

  const query = formData.get('query') as string
  if (!query) {
    throw new Error('Query is required')
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that generates markdown documentation based on user queries." },
        { role: "user", content: query }
      ],
      model: "gpt-4o",
    })

    const content = completion.choices[0].message.content

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        query,
        content
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to save document')
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error generating document:', error)
    return { success: false, error: 'Failed to generate document' }
  }
}

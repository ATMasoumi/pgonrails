import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export const alt = 'DocTree Knowledge Graph'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: doc } = await supabase
    .from('documents')
    .select('query')
    .eq('id', id)
    .single()

  const title = doc?.query || 'DocTree Knowledge Graph'

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(to bottom right, #e0f2fe, #f0f9ff)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 40, marginRight: 10 }}>🌳</div>
          <div style={{ fontSize: 40, fontWeight: 'bold', color: '#0284c7' }}>DocTree</div>
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
            textShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#64748b',
            marginTop: 10,
          }}
        >
          Interactive Knowledge Tree
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

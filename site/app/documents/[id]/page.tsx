import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DocumentView } from '@/components/DocumentView'

export default async function DocumentPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ rootId?: string; autoGenerate?: string }>
}) {
  const { id } = await params
  const { rootId, autoGenerate } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (!document) {
    notFound()
  }

  // Check access: must be owner
  const isOwner = user && document.user_id === user.id

  if (!isOwner) {
    if (!user) {
      redirect('/signin')
    } else {
      redirect('/dashboard')
    }
  }

  console.log('Document data:', document)

  return <DocumentView doc={document} rootId={rootId} autoGenerate={autoGenerate === 'true'} />
}

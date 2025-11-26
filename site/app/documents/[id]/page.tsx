import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DocumentView } from '@/components/DocumentView'

export default async function DocumentPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ rootId?: string }>
}) {
  const { id } = await params
  const { rootId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (!document) {
    notFound()
  }

  if (document.user_id !== user.id) {
    redirect('/dashboard')
  }

  console.log('Document data:', document)

  return <DocumentView document={document} rootId={rootId} />
}

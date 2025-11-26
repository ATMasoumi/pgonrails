import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { GenerateDocumentForm } from '@/components/GenerateDocumentForm'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">AI Document Generator</h1>
          <p className="text-gray-600">Generate markdown documentation instantly with AI</p>
        </div>

        <GenerateDocumentForm />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents?.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{doc.query}</CardTitle>
                  <CardDescription>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {doc.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {documents?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No documents generated yet. Try creating one above!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import { generateDocument } from "@/app/documents/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function GenerateDocumentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await generateDocument(formData)
      if (result.success && result.id) {
        router.push(`/documents/${result.id}`)
      } else {
        console.error(result.error)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex gap-2 w-full max-w-2xl mx-auto mb-8">
      <Input 
        name="query" 
        placeholder="What do you want to generate documentation for?" 
        required 
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate"
        )}
      </Button>
    </form>
  )
}

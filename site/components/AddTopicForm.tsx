"use client"

import { useState } from "react"
import { createTopic } from "@/app/documents/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddTopicForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const query = formData.get('query') as string
      const result = await createTopic(query)
      if (result.success) {
        const form = document.getElementById('add-topic-form') as HTMLFormElement
        form?.reset()
        router.refresh()
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
    <form id="add-topic-form" action={handleSubmit} className="flex gap-2 w-full max-w-2xl mx-auto mb-8">
      <Input 
        name="query" 
        placeholder="Enter a new topic..." 
        required 
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Topic
          </>
        )}
      </Button>
    </form>
  )
}

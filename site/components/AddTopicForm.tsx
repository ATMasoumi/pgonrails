"use client"

import { useState } from "react"
import { createTopic } from "@/app/documents/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
      <div className="relative flex-1 group">
        {isLoading && (
          <div className="absolute -inset-0.5 rounded-lg overflow-hidden">
            <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          </div>
        )}
        <Input 
          name="query" 
          placeholder="Enter a new topic..." 
          required 
          className={cn(
            "relative bg-white transition-all duration-200",
            isLoading && "border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        />
      </div>
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

"use client"

import { useState, useTransition } from "react"
import { createTopic } from "@/app/documents/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useTokenLimit } from "@/lib/hooks/use-token-limit"

const SUGGESTED_TOPICS = [
  "Quantum Physics",
  "Renaissance Art",
  "Machine Learning",
  "Sustainable Energy",
  "Ancient Rome",
  "Space Exploration",
  "Cognitive Science",
  "Music Theory"
]

interface AddTopicFormProps {
  showSuggestions?: boolean
}

export function AddTopicForm({ showSuggestions = false }: AddTopicFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [inputValue, setInputValue] = useState("")
  const router = useRouter()
  const { handleTokenLimitError } = useTokenLimit()

  const isWorking = isLoading || isPending

  async function handleCreateTopic(query: string) {
    setIsLoading(true)
    try {
      const result = await createTopic(query)
      
      if (result.success) {
        setInputValue("")
        startTransition(() => {
          router.refresh()
        })
      } else {
        console.error(result.error)
        if (!handleTokenLimitError(result.error)) {
          toast.error("Failed to create topic. Please try again.")
        }
      }
    } catch (error: any) {
      console.error(error)
      if (!handleTokenLimitError(error)) {
        toast.error("An error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await handleCreateTopic(inputValue)
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative z-10">
      <form id="add-topic-form" onSubmit={onSubmit} className="flex gap-3 w-full">
        <div className="relative flex-1 group">
          {isWorking && (
            <>
              {/* Animated Gradient Border */}
              <div className="absolute -inset-[2px] rounded-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#22d3ee_25%,#4ade80_50%,#facc15_75%,transparent_100%)] blur-[2px] opacity-80" />
              </div>
              
              {/* Loading Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20 text-white font-medium pointer-events-none">
                 <Sparkles className="w-4 h-4 mr-2 animate-pulse text-yellow-400" />
                 <span className="animate-pulse bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Generating Topic...</span>
              </div>
            </>
          )}
          
          <Input 
            name="query" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a new topic..." 
            required 
            disabled={isWorking}
            className={cn(
              "relative z-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all duration-200 h-11 rounded-full px-6",
              isWorking && "!bg-[#020202] !border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 opacity-100 disabled:opacity-100 shadow-none text-transparent placeholder:text-transparent selection:text-transparent cursor-not-allowed"
            )}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isWorking}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 h-11 px-6 rounded-full relative z-10"
        >
          {isWorking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Add Topic
        </Button>
      </form>

      <AnimatePresence>
        {showSuggestions && !isWorking && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {SUGGESTED_TOPICS.map((topic, index) => (
              <motion.button
                key={topic}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setInputValue(topic)
                  handleCreateTopic(topic)
                }}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105"
              >
                {topic}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

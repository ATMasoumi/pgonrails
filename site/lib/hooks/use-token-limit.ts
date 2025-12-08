"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCallback } from "react"

export function useTokenLimit() {
  const router = useRouter()

  const handleTokenLimitError = useCallback((error: any) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || ''
    
    if (
      errorMessage.includes('Token limit exceeded') || 
      errorMessage.includes('upgrade your plan') || 
      errorMessage.includes('402')
    ) {
      router.push('/pricing?limit=reached')
      return true
    }
    return false
  }, [router])

  return { handleTokenLimitError }
}

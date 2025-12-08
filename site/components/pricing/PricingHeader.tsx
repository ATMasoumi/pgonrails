"use client"

import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

const TOPICS = [
  "Machine Learning",
  "Quantum Physics",
  "Web Development",
  "Data Science",
  "Blockchain",
  "Neuroscience",
  "Philosophy",
  "Music Theory",
  "Astrophysics",
  "Economics",
]

export function PricingHeader() {
  const searchParams = useSearchParams()
  const limitReached = searchParams.get('limit') === 'reached'
  const [topicIndex, setTopicIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % TOPICS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center mb-16">
      <AnimatePresence mode="wait">
        {limitReached ? (
          <motion.div
            key="limit-reached"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">AI Token Limit Reached</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
            >
              Upgrade to Continue
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              You&apos;ve used all your AI credits for this period. Upgrade now to unlock more power and keep creating.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 flex flex-col items-center gap-2">
              <span className="text-white">Master</span>
              <span className="relative inline-block w-full h-[1.3em] overflow-visible" style={{ perspective: '1000px' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={topicIndex}
                    initial={{ rotateX: 90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: -90, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="block w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent whitespace-nowrap text-center"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    {TOPICS[topicIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-white">10x faster with AI</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Transform any topic into an interactive knowledge tree. Learn faster, remember longer.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

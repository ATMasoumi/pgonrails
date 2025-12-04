"use client"

import { Button } from "@/components/ui/button"
import { Library, Atom, Cpu, Palette } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

const topics = [
  {
    root: { 
      text: "History", 
      Icon: Library, 
      classes: {
        text: "text-white",
        bg: "bg-[#1a1a1a]",
        border: "border-yellow-500/50",
        shadow: "shadow-[0_0_30px_rgba(234,179,8,0.2)]",
        iconBg: "bg-yellow-500/20",
        iconColor: "text-yellow-400"
      }
    },
    l2: [
      { text: "Ancient", classes: { text: "text-orange-400", border: "border-orange-500/30", shadow: "shadow-orange-900/10" } },
      { text: "Modern", classes: { text: "text-blue-400", border: "border-blue-500/30", shadow: "shadow-blue-900/10" } }
    ],
    l3: [
      { text: "Rome", hover: "hover:border-yellow-500/50" },
      { text: "Egypt", hover: "hover:border-yellow-500/50" },
      { text: "WWII", hover: "hover:border-yellow-500/50" },
      { text: "Cold War", hover: "hover:border-yellow-500/50" }
    ]
  },
  {
    root: { 
      text: "Science", 
      Icon: Atom, 
      classes: {
        text: "text-white",
        bg: "bg-[#1a1a1a]",
        border: "border-cyan-500/50",
        shadow: "shadow-[0_0_30px_rgba(34,211,238,0.2)]",
        iconBg: "bg-cyan-500/20",
        iconColor: "text-cyan-400"
      }
    },
    l2: [
      { text: "Physics", classes: { text: "text-violet-400", border: "border-violet-500/30", shadow: "shadow-violet-900/10" } },
      { text: "Biology", classes: { text: "text-emerald-400", border: "border-emerald-500/30", shadow: "shadow-emerald-900/10" } }
    ],
    l3: [
      { text: "Quantum", hover: "hover:border-cyan-500/50" },
      { text: "Gravity", hover: "hover:border-cyan-500/50" },
      { text: "Genetics", hover: "hover:border-cyan-500/50" },
      { text: "Cells", hover: "hover:border-cyan-500/50" }
    ]
  },
  {
    root: { 
      text: "Tech", 
      Icon: Cpu, 
      classes: {
        text: "text-white",
        bg: "bg-[#1a1a1a]",
        border: "border-indigo-500/50",
        shadow: "shadow-[0_0_30px_rgba(99,102,241,0.2)]",
        iconBg: "bg-indigo-500/20",
        iconColor: "text-indigo-400"
      }
    },
    l2: [
      { text: "AI", classes: { text: "text-fuchsia-400", border: "border-fuchsia-500/30", shadow: "shadow-fuchsia-900/10" } },
      { text: "Web", classes: { text: "text-sky-400", border: "border-sky-500/30", shadow: "shadow-sky-900/10" } }
    ],
    l3: [
      { text: "LLMs", hover: "hover:border-indigo-500/50" },
      { text: "Vision", hover: "hover:border-indigo-500/50" },
      { text: "React", hover: "hover:border-indigo-500/50" },
      { text: "Next.js", hover: "hover:border-indigo-500/50" }
    ]
  },
  {
    root: { 
      text: "Art", 
      Icon: Palette, 
      classes: {
        text: "text-white",
        bg: "bg-[#1a1a1a]",
        border: "border-pink-500/50",
        shadow: "shadow-[0_0_30px_rgba(236,72,153,0.2)]",
        iconBg: "bg-pink-500/20",
        iconColor: "text-pink-400"
      }
    },
    l2: [
      { text: "Classic", classes: { text: "text-rose-400", border: "border-rose-500/30", shadow: "shadow-rose-900/10" } },
      { text: "Modern", classes: { text: "text-purple-400", border: "border-purple-500/30", shadow: "shadow-purple-900/10" } }
    ],
    l3: [
      { text: "Renais.", hover: "hover:border-pink-500/50" },
      { text: "Baroque", hover: "hover:border-pink-500/50" },
      { text: "Abstract", hover: "hover:border-pink-500/50" },
      { text: "Cubism", hover: "hover:border-pink-500/50" }
    ]
  }
]

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

  const handleCreateTree = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/signin')
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topics.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const currentTopic = topics[currentIndex]

  return (
    <section className="container mx-auto px-4 pt-32 pb-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-[#0A0A0A] rounded-[2rem] overflow-hidden border border-white/10 relative max-w-6xl mx-auto"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col items-center text-center pt-16 pb-24 px-4 relative z-10"
        >
          {/* Floating Topic Tree */}
          <div className="relative w-full max-w-6xl h-[400px] mb-12 hidden md:block">
             <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full h-full max-w-3xl" style={{ perspective: "1000px" }}>
                  {/* Background Grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
                  
                  {/* SVG Lines - Drawn first so they are behind nodes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    {/* Level 1 to Level 2 */}
                    <motion.path d="M100 200 C 250 200, 250 125, 400 125" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                    <motion.path d="M100 200 C 250 200, 250 275, 400 275" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                    
                    {/* Level 2 to Level 3 (Top Branch) */}
                    <motion.path d="M400 125 C 550 125, 550 75, 700 75" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
                    <motion.path d="M400 125 C 550 125, 550 175, 700 175" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />

                    {/* Level 2 to Level 3 (Bottom Branch) */}
                    <motion.path d="M400 275 C 550 275, 550 225, 700 225" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                    <motion.path d="M400 275 C 550 275, 550 325, 700 325" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                  </svg>

                  {/* Level 1: Root */}
                  <AnimatePresence>
                    <motion.div 
                      key={currentIndex}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ backfaceVisibility: "hidden" }}
                      className={`absolute left-[100px] top-[200px] -translate-x-1/2 -translate-y-1/2 z-20 px-6 py-3 rounded-2xl flex items-center gap-3 border ${currentTopic.root.classes.bg} ${currentTopic.root.classes.border} ${currentTopic.root.classes.shadow}`}
                    >
                      <div className={`p-2 rounded-lg ${currentTopic.root.classes.iconBg}`}>
                        <currentTopic.root.Icon className={`w-5 h-5 ${currentTopic.root.classes.iconColor}`} />
                      </div>
                      <span className={`font-bold text-lg ${currentTopic.root.classes.text}`}>{currentTopic.root.text}</span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Level 2: Categories */}
                  <AnimatePresence>
                    <motion.div 
                      key={`l2-1-${currentIndex}`}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      style={{ backfaceVisibility: "hidden" }}
                      className={`absolute left-[400px] top-[125px] -translate-y-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#1a1a1a] border rounded-xl font-semibold text-sm shadow-lg ${currentTopic.l2[0].classes.text} ${currentTopic.l2[0].classes.border} ${currentTopic.l2[0].classes.shadow}`}
                    >
                      {currentTopic.l2[0].text}
                    </motion.div>
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    <motion.div 
                      key={`l2-2-${currentIndex}`}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      style={{ backfaceVisibility: "hidden" }}
                      className={`absolute left-[400px] top-[275px] -translate-y-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#1a1a1a] border rounded-xl font-semibold text-sm shadow-lg ${currentTopic.l2[1].classes.text} ${currentTopic.l2[1].classes.border} ${currentTopic.l2[1].classes.shadow}`}
                    >
                      {currentTopic.l2[1].text}
                    </motion.div>
                  </AnimatePresence>

                  {/* Level 3: Topics */}
                  {/* Top Branch Children */}
                  <AnimatePresence>
                    <motion.div 
                      key={`l3-1-${currentIndex}`}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      style={{ backfaceVisibility: "hidden" }}
                      className={`absolute left-[700px] top-[75px] -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs transition-colors ${currentTopic.l3[0].hover}`}
                    >
                      {currentTopic.l3[0].text}
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    <motion.div 
                      key={`l3-2-${currentIndex}`}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 }}
                      style={{ backfaceVisibility: "hidden" }}
                      className={`absolute left-[700px] top-[175px] -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs transition-colors ${currentTopic.l3[1].hover}`}
                    >
                      {currentTopic.l3[1].text}
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom Branch Children */}
                  <AnimatePresence>
                    <motion.div 
                      key={`l3-3-${currentIndex}`}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      style={{ backfaceVisibility: "hidden" }}
                      className={`absolute left-[700px] top-[225px] -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs transition-colors ${currentTopic.l3[2].hover}`}
                    >
                      {currentTopic.l3[2].text}
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    <motion.div 
                      key={`l3-4-${currentIndex}`}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.35 }}
                      style={{ backfaceVisibility: "hidden" }}
                      className={`absolute left-[700px] top-[325px] -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs transition-colors ${currentTopic.l3[3].hover}`}
                    >
                      {currentTopic.l3[3].text}
                    </motion.div>
                  </AnimatePresence>

                </div>
             </div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl"
          >
            AI-powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Knowledge Trees</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl"
          >
            Turn any topic into a clear, expandable visual tree with AI. Learn faster, think better, and explore interactive mind-maps.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.04 }}
            >
              <Button onClick={handleCreateTree} size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8 h-12 text-lg shadow-lg hover:shadow-white/20 transition-all relative overflow-hidden group font-semibold">
                <span className="relative z-10">Create a Tree Now</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-shimmer"
                />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

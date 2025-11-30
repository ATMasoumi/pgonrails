"use client"

import { motion } from "framer-motion"
import { Network, FileText, BrainCircuit, Headphones, Library, Sparkles, Zap, BookOpen, Layers, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Everything you need to master any topic
          </h2>
          <p className="text-xl text-gray-400">
            From initial concept to deep mastery, our AI-powered tools guide every step of your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-[minmax(180px,auto)]">
          
          {/* Card 1: Topic Tree (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 rounded-3xl p-8 bg-[#111] border border-white/10 hover:border-purple-500/30 transition-colors group relative overflow-hidden flex flex-col"
          >
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Network className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Generate Topic Tree</h3>
              <p className="text-gray-400 text-lg max-w-md">
                Start with a single concept. Watch as AI breaks it down into a structured knowledge graph, organizing complex ideas into manageable learning paths.
              </p>
            </div>
            
            {/* Visual representation of a tree */}
            <div className="mt-8 relative h-80 w-full bg-[#050505] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="relative w-full h-full max-w-3xl">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
                    
                    {/* SVG Lines - Drawn first so they are behind nodes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                      {/* Level 1 to Level 2 */}
                      <motion.path d="M140 160 C 180 160, 180 100, 200 100" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                      <motion.path d="M140 160 C 180 160, 180 220, 200 220" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                      
                      {/* Level 2 to Level 3 (Top Branch) */}
                      <motion.path d="M320 100 C 360 100, 380 60, 460 60" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
                      <motion.path d="M320 100 C 360 100, 380 140, 460 140" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />

                      {/* Level 2 to Level 3 (Bottom Branch) */}
                      <motion.path d="M300 220 C 340 220, 380 180, 460 180" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                      <motion.path d="M300 220 C 340 220, 380 260, 460 260" fill="none" stroke="#333" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                    </svg>

                    {/* Level 1: Root */}
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="absolute left-[40px] top-1/2 -translate-y-1/2 z-20 px-6 py-3 bg-[#1a1a1a] rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(147,51,234,0.2)] border border-purple-500/50"
                    >
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <BrainCircuit className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-white font-bold text-lg">AI</span>
                    </motion.div>

                    {/* Level 2: Categories */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute left-[260px] top-[100px] -translate-y-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#1a1a1a] border border-blue-500/30 rounded-xl text-blue-400 font-semibold text-sm shadow-lg shadow-blue-900/10"
                    >
                      Machine Learning
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute left-[250px] top-[220px] -translate-y-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#1a1a1a] border border-green-500/30 rounded-xl text-green-400 font-semibold text-sm shadow-lg shadow-green-900/10"
                    >
                      Data Science
                    </motion.div>

                    {/* Level 3: Topics */}
                    {/* Top Branch Children */}
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute left-[460px] top-[60px] -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs hover:border-purple-500/50 transition-colors"
                    >
                      Neural Networks
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="absolute left-[460px] top-[140px] -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs hover:border-purple-500/50 transition-colors"
                    >
                      Deep Learning
                    </motion.div>

                    {/* Bottom Branch Children */}
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="absolute left-[460px] top-[180px] -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs hover:border-purple-500/50 transition-colors"
                    >
                      Statistics
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="absolute left-[460px] top-[260px] -translate-y-1/2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 text-xs hover:border-purple-500/50 transition-colors"
                    >
                      Visualization
                    </motion.div>

                  </div>
               </div>
            </div>
          </motion.div>

          {/* Card 2: Comprehensive Doc */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 md:row-span-2 rounded-3xl p-8 bg-[#111] border border-white/10 hover:border-blue-500/30 transition-colors group relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText className="w-48 h-48 text-blue-500" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Comprehensive Docs</h3>
            <p className="text-gray-400 mb-6">
              Generate detailed, well-structured documentation for any node in your tree instantly.
            </p>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                  <div className="h-2 bg-white/10 rounded w-full" />
                </div>
              ))}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                  <div className="h-2 bg-white/10 rounded w-2/3" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Quizzes & Flashcards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 rounded-3xl p-6 bg-[#111] border border-white/10 hover:border-green-500/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                Active Recall
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Quizzes & Flashcards</h3>
            <p className="text-sm text-gray-400">
              Reinforce your knowledge with auto-generated interactive quizzes and flashcards.
            </p>
          </motion.div>

          {/* Card 4: Podcast */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 rounded-3xl p-6 bg-[#111] border border-white/10 hover:border-pink-500/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-pink-400" />
              </div>
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <motion.div 
                    key={i}
                    className="w-1 bg-pink-500/40 rounded-full"
                    animate={{ height: [8, 16, 8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Audio Podcasts</h3>
            <p className="text-sm text-gray-400">
              Turn documentation into engaging audio conversations for learning on the go.
            </p>
          </motion.div>

          {/* Card 5: Resources & Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 rounded-3xl p-6 bg-[#111] border border-white/10 hover:border-yellow-500/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Library className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Resources & Summary</h3>
            <p className="text-sm text-gray-400">
              Get instant summaries and curated external resources to expand your understanding.
            </p>
          </motion.div>

          {/* Card 6: Improve Learning Experience (Banner) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-3 rounded-3xl p-8 bg-gradient-to-r from-[#111] to-[#161616] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-white/20 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Sparkles className="w-5 h-5 text-yellow-200" />
                </div>
                <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">The Ultimate Goal</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Improve Your Learning Experience</h3>
              <p className="text-gray-400 max-w-xl">
                Stop getting lost in information overload. Our structured, AI-driven approach helps you retain more information in less time.
              </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex -space-x-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center text-xs font-bold text-white">
                      User
                    </div>
                  ))}
               </div>
               <div className="text-sm text-gray-400">
                 <span className="text-white font-bold">10k+</span> learners
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

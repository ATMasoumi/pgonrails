"use client"

import { motion } from "framer-motion"
import { Network, FileText, BrainCircuit, Headphones, Library, Sparkles, Zap, BookOpen, Layers, GraduationCap, Youtube, Book, Newspaper, Users, Check, Search, Quote, ArrowRight, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Everything you need to master any topic
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
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
              <h3 className="text-2xl font-bold tracking-tight mb-3 text-white">Generate Topic Tree</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
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
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.1 } },
              hover: {}
            }}
            className="md:col-span-1 md:row-span-2 rounded-3xl p-8 bg-[#111] border border-white/10 hover:border-blue-500/30 transition-colors group relative overflow-hidden flex flex-col"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3 text-white">Comprehensive Docs</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Generate detailed, well-structured documentation for any node in your tree instantly.
              </p>
            </div>

            {/* Layered Docs Visual */}
            <div className="relative flex-1 min-h-[200px] flex items-center justify-center mt-4">
               {/* Layer 3 (Back) */}
               <motion.div 
                 className="absolute w-48 h-60 bg-blue-500/5 border border-blue-500/10 rounded-2xl"
                 variants={{
                   hidden: { rotate: 0, scale: 0.9, x: 0 },
                   visible: { rotate: 12, scale: 0.9, x: 20, transition: { duration: 0.5, delay: 0.2 } },
                   hover: { rotate: 24, scale: 0.9, x: 45, transition: { duration: 0.3, ease: "easeOut", delay: 0 } }
                 }}
               />
               {/* Layer 2 (Middle) */}
               <motion.div 
                 className="absolute w-48 h-60 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
                 variants={{
                   hidden: { rotate: 0, scale: 0.95, x: 0 },
                   visible: { rotate: -6, scale: 0.95, x: -10, transition: { duration: 0.5, delay: 0.3 } },
                   hover: { rotate: -12, scale: 0.95, x: -25, transition: { duration: 0.3, ease: "easeOut", delay: 0 } }
                 }}
               />
               {/* Layer 1 (Front) */}
               <motion.div 
                 className="absolute w-48 h-60 bg-[#151515] border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 flex flex-col"
                 variants={{
                   hidden: { y: 20, opacity: 0 },
                   visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.4 } },
                   hover: { y: -15, scale: 1.05, transition: { duration: 0.3, ease: "easeOut", delay: 0 } }
                 }}
               >
                 {/* Doc Content */}
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                     <FileText className="w-4 h-4 text-blue-400" />
                   </div>
                   <div className="h-2 w-16 bg-white/20 rounded-full" />
                 </div>
                 <div className="space-y-3 flex-1">
                   <div className="h-1.5 w-full bg-white/10 rounded-full" />
                   <div className="h-1.5 w-full bg-white/10 rounded-full" />
                   <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                   <div className="h-1.5 w-full bg-white/10 rounded-full" />
                   <div className="h-1.5 w-5/6 bg-white/10 rounded-full" />
                 </div>
                 
                 {/* Bottom fade */}
                 <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#151515] to-transparent rounded-b-2xl" />
               </motion.div>
            </div>
          </motion.div>

          {/* Card 3: Quizzes & Flashcards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 rounded-3xl p-6 bg-[#111] border border-white/10 hover:border-green-500/30 transition-colors group flex flex-col overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2 text-white relative z-10">Quizzes & Flashcards</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 relative z-10">
              Reinforce your knowledge with auto-generated interactive quizzes and flashcards.
            </p>

            {/* 3D Illustration Area */}
            <div className="relative h-32 w-full mt-auto">
                {/* Left: Quiz UI Visual */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                    <div className="relative w-28 bg-[#151515] border border-green-500/30 rounded-xl p-3 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        {/* Question Placeholder */}
                        <div className="space-y-1.5 mb-3">
                            <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                            <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
                        </div>
                        
                        {/* Options */}
                        <div className="space-y-2">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full border flex items-center justify-center transition-colors duration-300",
                                        i === 1 ? "border-green-500 bg-green-500/10" : "border-white/10"
                                    )}>
                                        {i === 1 && (
                                            <motion.div 
                                                className="w-1.5 h-1.5 rounded-full bg-green-400"
                                                animate={{ scale: [0, 1, 1, 1, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 0.9, 1] }}
                                            />
                                        )}
                                    </div>
                                    <div className={cn(
                                        "h-1 w-full rounded-full",
                                        i === 1 ? "bg-green-500/20" : "bg-white/5"
                                    )} />
                                </div>
                            ))}
                        </div>
                        
                        {/* Success Checkmark */}
                        <motion.div 
                            className="absolute -right-2 -top-2 bg-green-500 text-black rounded-full p-0.5 shadow-lg shadow-green-500/20"
                            animate={{ scale: [0, 1, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, times: [0.15, 0.25, 0.8, 0.9, 1] }}
                        >
                            <Check className="w-3 h-3 stroke-[3]" />
                        </motion.div>
                    </div>
                </div>

                {/* Right: Floating Flashcards Stack */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-20 h-24 perspective-1000">
                    {/* Card 3 (Back - Checkmark) */}
                    <motion.div 
                        className="absolute inset-0 bg-green-900/10 border border-green-500/10 rounded-lg flex items-center justify-center"
                        animate={{ y: [0, -4, 0], rotate: [-5, -8, -5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                        style={{ zIndex: 1, x: -10 }}
                    >
                        <Check className="w-6 h-6 text-green-500/20" />
                    </motion.div>

                    {/* Card 2 (Middle - ABC) */}
                    <motion.div 
                        className="absolute inset-0 bg-green-900/20 border border-green-500/20 rounded-lg flex items-center justify-center"
                        animate={{ y: [0, -6, 0], rotate: [5, 2, 5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        style={{ zIndex: 2, x: 0 }}
                    >
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                        </div>
                    </motion.div>

                    {/* Card 1 (Front - Question) */}
                    <motion.div 
                        className="absolute inset-0 bg-[#151515] border border-green-500/40 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                        animate={{ y: [0, -8, 0], rotate: [10, 12, 10] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        style={{ zIndex: 3, x: 10 }}
                    >
                        <span className="text-xl font-bold text-green-400">?</span>
                    </motion.div>
                </div>
            </div>
          </motion.div>

          {/* Card 4: Podcast */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 rounded-3xl p-6 bg-[#111] border border-white/10 hover:border-pink-500/30 transition-colors group flex flex-col overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2 text-white relative z-10">Audio Podcasts</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 relative z-10">
              Turn documentation into engaging audio conversations for learning on the go.
            </p>

            {/* Visual Area */}
            <div className="relative h-32 w-full mt-auto flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-pink-500/5 blur-2xl rounded-full transform translate-y-10" />

                {/* Floating Player Card */}
                <motion.div 
                    className="relative z-10 w-full max-w-[220px] bg-[#1a1a1a] border border-pink-500/20 rounded-xl p-4 shadow-xl shadow-pink-900/10"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        {/* Play Button */}
                        <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                        </div>
                        {/* Track Lines */}
                        <div className="flex-1 space-y-1.5">
                            <div className="h-1.5 w-2/3 bg-white/10 rounded-full" />
                            <div className="h-1.5 w-1/2 bg-white/5 rounded-full" />
                        </div>
                    </div>
                    
                    {/* Waveform */}
                    <div className="flex items-end justify-between h-8 gap-0.5">
                        {[...Array(16)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-1.5 bg-gradient-to-t from-pink-500/40 to-pink-500/80 rounded-t-sm"
                                animate={{ height: ["20%", "80%", "30%"] }}
                                transition={{ 
                                    duration: 1.2, 
                                    repeat: Infinity, 
                                    delay: i * 0.05,
                                    ease: "easeInOut",
                                    repeatType: "reverse"
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
          </motion.div>

          {/* Card 5: Resources */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 rounded-3xl p-6 bg-[#111] border border-white/10 hover:border-yellow-500/30 transition-colors group flex flex-col overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Library className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2 text-white relative z-10">Curated Resources</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 relative z-10">
              We crawl the web to find YouTube videos, books, and articles to expand your understanding.
            </p>

            {/* Visual Area */}
            <div className="relative h-40 w-full mt-auto flex flex-col justify-center gap-3 overflow-hidden">
                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#111] to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#111] to-transparent z-10" />

                {/* Row 1: Media & Video (Scrolling Left) */}
                <motion.div 
                    className="flex gap-3 w-max"
                    animate={{ x: "-50%" }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {[
                        { icon: Youtube, label: "Video Tutorials", color: "text-red-400" },
                        { icon: Zap, label: "Crash Courses", color: "text-yellow-400" },
                        { icon: Users, label: "Tech Talks", color: "text-green-400" },
                        { icon: Youtube, label: "Video Tutorials", color: "text-red-400" },
                        { icon: Zap, label: "Crash Courses", color: "text-yellow-400" },
                        { icon: Users, label: "Tech Talks", color: "text-green-400" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                            <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                            <span className="text-xs font-medium text-gray-300 whitespace-nowrap">{item.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Row 2: Reading & Docs (Scrolling Right) */}
                <motion.div 
                    className="flex gap-3 w-max"
                    animate={{ x: "0%" }}
                    initial={{ x: "-50%" }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                    {[
                        { icon: Book, label: "Textbooks", color: "text-blue-400" },
                        { icon: Newspaper, label: "Research Papers", color: "text-gray-400" },
                        { icon: FileText, label: "Documentation", color: "text-purple-400" },
                        { icon: Book, label: "Textbooks", color: "text-blue-400" },
                        { icon: Newspaper, label: "Research Papers", color: "text-gray-400" },
                        { icon: FileText, label: "Documentation", color: "text-purple-400" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                            <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                            <span className="text-xs font-medium text-gray-300 whitespace-nowrap">{item.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Row 3: Community & More (Scrolling Left) */}
                <motion.div 
                    className="flex gap-3 w-max"
                    animate={{ x: "-50%" }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                >
                    {[
                        { icon: Quote, label: "Expert Blogs", color: "text-orange-400" },
                        { icon: Library, label: "Case Studies", color: "text-cyan-400" },
                        { icon: GraduationCap, label: "Academic Journals", color: "text-pink-400" },
                        { icon: Quote, label: "Expert Blogs", color: "text-orange-400" },
                        { icon: Library, label: "Case Studies", color: "text-cyan-400" },
                        { icon: GraduationCap, label: "Academic Journals", color: "text-pink-400" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                            <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                            <span className="text-xs font-medium text-gray-300 whitespace-nowrap">{item.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
          </motion.div>

          {/* Card 6: Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-1 rounded-3xl p-6 bg-[#111] border border-white/10 hover:border-orange-500/30 transition-colors group flex flex-col overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2 text-white relative z-10">Instant Summaries</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 relative z-10">
              Get concise, AI-generated summaries of complex topics to save time.
            </p>

            {/* Visual Area */}
            <div className="relative h-32 w-full mt-auto flex items-center justify-center">
                {/* Background Text Lines */}
                <div className="absolute inset-0 px-8 py-4 space-y-2 opacity-20 mask-image-linear-gradient-to-b">
                    {[85, 72, 90, 65, 78, 95].map((width, i) => (
                        <div key={i} className="h-1.5 bg-white rounded-full w-full" style={{ width: `${width}%` }} />
                    ))}
                </div>

                {/* Summary Card Pop-up */}
                <motion.div 
                    className="relative z-10 bg-[#1a1a1a] border border-orange-500/30 rounded-xl p-4 shadow-xl shadow-orange-900/10 max-w-[180px] w-full"
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">TL;DR</span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-white/20 rounded-full" />
                        <div className="h-1.5 w-full bg-white/20 rounded-full" />
                        <div className="h-1.5 w-2/3 bg-white/20 rounded-full" />
                    </div>
                </motion.div>
            </div>
          </motion.div>

          {/* Card 7: Personal AI Tutor */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="md:col-span-2 rounded-3xl p-8 bg-[#111] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-purple-500/30 transition-colors relative overflow-hidden"
          >
             {/* Background Glow */}
             <div className="absolute right-0 top-0 w-1/2 h-full bg-purple-500/5 blur-3xl rounded-full transform translate-x-1/3" />

            <div className="flex-1 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3 text-white">Personal AI Tutor</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Stuck on a concept? Chat directly with your knowledge tree. Get instant answers, analogies, and examples tailored to your learning style.
              </p>
            </div>

            {/* Chat Visual */}
            <div className="relative z-10 w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-purple-900/10 flex flex-col gap-3">
                {/* User Message */}
                <div className="self-end bg-purple-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[85%] shadow-lg shadow-purple-900/20">
                    Explain "Neural Networks" like I'm 5.
                </div>
                
                {/* AI Message */}
                <div className="self-start bg-white/10 text-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[90%] border border-white/5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI Tutor</span>
                    </div>
                    <p className="leading-relaxed text-gray-300">
                        Imagine a brain made of tiny switches. When you see a cat, some switches turn on...
                    </p>
                </div>

                {/* Input Area */}
                <div className="mt-2 flex gap-2 items-center">
                    <div className="h-9 flex-1 bg-white/5 rounded-full border border-white/10 px-4 flex items-center text-xs text-gray-500">
                        Ask a follow-up question...
                    </div>
                    <div className="h-9 w-9 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

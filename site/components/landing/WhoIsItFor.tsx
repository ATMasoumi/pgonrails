"use client"

import { GraduationCap, BookOpen, BrainCircuit, Presentation, Briefcase, Lightbulb, CheckCircle2, Play, FileText, Calendar, X, Check, Link, Clock, ArrowRight, Sparkles, Users, BarChart3, PieChart, Search, MessageSquare, Network, List, FileQuestion, Youtube, Globe, File, Film } from "lucide-react"
import { motion } from "framer-motion"

export default function WhoIsItFor() {
  const audiences = [
    {
      title: "Students",
      description: "Master any subject with AI-generated flashcards. Flip through key concepts and track your retention effortlessly.",
      icon: GraduationCap,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      visual: (
        <div className="relative h-64 w-full flex items-center justify-center">
          {/* Stack Effect */}
          <motion.div 
            className="absolute w-64 h-40 bg-blue-900/20 border border-blue-500/20 rounded-2xl rotate-6"
            animate={{ rotate: [6, 8, 6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute w-64 h-40 bg-blue-800/20 border border-blue-500/20 rounded-2xl -rotate-3"
            animate={{ rotate: [-3, -5, -3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Main Flashcard */}
          <motion.div 
            className="relative w-64 h-40 bg-[#1A1A1A] border border-blue-500/30 rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Question</span>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            
            <div className="text-lg font-medium text-white text-center">
              What is the powerhouse of the cell?
            </div>

            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Flip Action Hint */}
          <motion.div 
            className="absolute -bottom-4 bg-[#0A0A0A] border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-gray-300">Flipping...</span>
          </motion.div>
        </div>
      )
    },
    {
      title: "Educators",
      description: "Generate comprehensive quizzes from textbooks, YouTube videos, and documents in seconds. Save hours on assessment creation.",
      icon: FileQuestion,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      visual: (
        <div className="relative h-64 w-full flex items-center justify-center gap-8">
          {/* Input Doc */}
          <motion.div 
            className="w-24 h-32 bg-[#1A1A1A] border border-white/10 rounded-lg p-3 flex flex-col gap-2"
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
          >
            <FileText className="w-6 h-6 text-gray-500" />
            <div className="space-y-1">
              <div className="h-1 w-full bg-white/10 rounded-full" />
              <div className="h-1 w-full bg-white/10 rounded-full" />
              <div className="h-1 w-2/3 bg-white/10 rounded-full" />
            </div>
          </motion.div>

          {/* Processing Arrow */}
          <div className="flex flex-col items-center gap-1 z-10">
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-6 h-6 text-pink-500" />
            </motion.div>
            <span className="text-[10px] font-bold text-pink-400">AI Generating</span>
          </div>

          {/* Output Quiz */}
          <motion.div 
            className="w-48 bg-[#0A0A0A] border border-pink-500/30 rounded-xl p-4 shadow-2xl"
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">Unit 1 Quiz</span>
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <div className="w-3 h-3 rounded border border-pink-400" />
                <div className="h-1 w-20 bg-white/20 rounded-full" />
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="w-3 h-3 rounded border border-gray-600" />
                <div className="h-1 w-24 bg-white/10 rounded-full" />
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="w-3 h-3 rounded border border-gray-600" />
                <div className="h-1 w-16 bg-white/10 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Researchers",
      description: "Crawl resources—including books, YouTube videos, and articles—from across the web and organize them into a centralized knowledge base.",
      icon: Search,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      visual: (
        <div className="relative h-64 w-full flex items-center justify-center">
          {/* Central Hub */}
          <div className="relative z-10 w-20 h-20 bg-[#1A1A1A] border border-purple-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>

          {/* Orbiting Resources */}
          {[
            { icon: Youtube, color: "text-red-500", label: "YouTube" },
            { icon: BookOpen, color: "text-blue-400", label: "Books" },
            { icon: Globe, color: "text-cyan-400", label: "Web" },
            { icon: FileText, color: "text-green-400", label: "Articles" },
            { icon: Youtube, color: "text-red-400", label: "Lectures" },
            { icon: Users, color: "text-orange-400", label: "People" }
          ].map((item, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{ rotate: [i * 60, i * 60 + 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <div 
                className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8"
                style={{ transform: `translateY(-100px)` }}
              >
                <motion.div 
                  className="w-full h-full"
                  animate={{ rotate: [-i * 60, -i * 60 - 360] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div 
                    className="w-full h-full bg-[#0A0A0A] border border-white/10 rounded-xl flex flex-col items-center justify-center shadow-lg gap-1"
                    whileHover={{ scale: 1.2 }}
                  >
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    <span className="text-[9px] text-gray-400 font-medium">{item.label}</span>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Connection Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line 
                  x1="50%" y1="50%" x2="50%" y2="calc(50% - 80px)" 
                  stroke="rgba(168,85,247,0.3)" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </svg>
            </motion.div>
          ))}

          {/* Scanning Effect */}
          <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping opacity-20" />
        </div>
      )
    },
    {
      title: "Professionals",
      description: "Extract key insights from reports and transcripts into concise, actionable summaries instantly.",
      icon: List,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      visual: (
        <div className="relative h-64 w-full flex items-center justify-center gap-8">
          {/* Long Document */}
          <motion.div 
            className="w-32 h-48 bg-[#1A1A1A] border border-white/10 rounded-lg p-3 overflow-hidden opacity-50"
            initial={{ y: 10 }}
            animate={{ y: 0 }}
          >
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-1.5 w-full bg-white/10 rounded-full" />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
          </motion.div>

          {/* Magic Transformation */}
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>

          {/* Summary Card */}
          <motion.div 
            className="w-40 h-auto bg-[#0A0A0A] border border-amber-500/30 rounded-xl p-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Summary</span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="h-2 w-full bg-white/20 rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="h-2 w-5/6 bg-white/20 rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="h-2 w-4/5 bg-white/20 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Lifelong Learners",
      description: "Expand your knowledge tree. Start with a topic and let AI branch out into related concepts for deep exploration.",
      icon: Network,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      visual: (
        <div className="relative h-64 w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-[400px]">
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
              
              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 256" preserveAspectRatio="xMidYMid meet">
                {/* Level 1 to Level 2 */}
                <motion.path d="M40 128 C 100 128, 100 80, 160 80" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                <motion.path d="M40 128 C 100 128, 100 176, 160 176" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                
                {/* Level 2 to Level 3 (Top Branch) */}
                <motion.path d="M160 80 C 220 80, 220 50, 280 50" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
                <motion.path d="M160 80 C 220 80, 220 110, 280 110" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />

                {/* Level 2 to Level 3 (Bottom Branch) */}
                <motion.path d="M160 176 C 220 176, 220 146, 280 146" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                <motion.path d="M160 176 C 220 176, 220 206, 280 206" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
              </svg>

              {/* Level 1: Root */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="absolute left-[40px] top-[128px] -translate-y-1/2 -translate-x-1/2 z-20"
              >
                <div className="px-3 py-2 bg-[#0A0A0A] rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/50">
                  <Film className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold text-xs">Cinema</span>
                </div>
              </motion.div>

              {/* Level 2: Categories */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute left-[160px] top-[80px] -translate-y-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0A0A0A] border border-emerald-500/30 rounded-lg text-emerald-400 font-medium text-[10px] shadow-lg"
              >
                History
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute left-[160px] top-[176px] -translate-y-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0A0A0A] border border-emerald-500/30 rounded-lg text-emerald-400 font-medium text-[10px] shadow-lg"
              >
                Production
              </motion.div>

              {/* Level 3: Topics */}
              {/* Top Branch Children */}
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute left-[280px] top-[50px] -translate-y-1/2 -translate-x-1/2 px-2 py-1 bg-[#0A0A0A] border border-white/10 rounded text-gray-400 text-[9px] whitespace-nowrap"
              >
                Silent Era
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute left-[280px] top-[110px] -translate-y-1/2 -translate-x-1/2 px-2 py-1 bg-[#0A0A0A] border border-white/10 rounded text-gray-400 text-[9px] whitespace-nowrap"
              >
                New Wave
              </motion.div>

              {/* Bottom Branch Children */}
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute left-[280px] top-[146px] -translate-y-1/2 -translate-x-1/2 px-2 py-1 bg-[#0A0A0A] border border-white/10 rounded text-gray-400 text-[9px] whitespace-nowrap"
              >
                Editing
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute left-[280px] top-[206px] -translate-y-1/2 -translate-x-1/2 px-2 py-1 bg-[#0A0A0A] border border-white/10 rounded text-gray-400 text-[9px] whitespace-nowrap"
              >
                Sound
              </motion.div>

            </div>
          </div>
        </div>
      )
    },
    {
      title: "Creators",
      description: "Chat with your content to brainstorm ideas and extract key quotes effortlessly.",
      icon: MessageSquare,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      visual: (
        <div className="relative h-64 w-full flex items-center justify-center">
          <div className="w-72 bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="bg-white/5 p-3 border-b border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-gray-300">DocTree AI</span>
            </div>

            {/* Chat Area */}
            <div className="p-4 space-y-4">
              {/* User Message */}
              <motion.div 
                className="flex justify-end"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                  <div className="text-xs text-cyan-100">Find quotes about innovation.</div>
                </div>
              </motion.div>

              {/* AI Response */}
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
                  <div className="flex gap-1 mb-2">
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-75" />
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-150" />
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-black/20 rounded border border-white/5">
                      <div className="text-[10px] text-gray-400 italic">"Innovation distinguishes between a leader and a follower."</div>
                    </div>
                    <div className="p-2 bg-black/20 rounded border border-white/5">
                      <div className="text-[10px] text-gray-400 italic">"The best way to predict the future is to create it."</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="container mx-auto px-4 py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Who is DocTree for?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Whether you're preparing for a degree or mastering a new hobby, our platform adapts to your learning style.
          </p>
        </motion.div>
        
        <div className="space-y-32">
          {audiences.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Text Content */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex p-3 rounded-2xl ${item.bg} mb-6`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                
                <p className="text-gray-400 text-lg leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Visual Content */}
              <div className="flex-1 w-full">
                <div className="bg-[#0A0A0A] rounded-3xl border border-white/10 p-8 hover:border-purple-500/20 transition-colors duration-500">
                  {item.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

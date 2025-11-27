"use client"

"use client"

import { motion } from "framer-motion"
import { Network, Sparkles, PenTool, FileText, Share2, GraduationCap, CheckCircle2 } from "lucide-react"

export default function Features() {
  const features = [
    {
      title: "Expandable Knowledge Trees",
      desc: "See the entire subject — not just a paragraph.",
      icon: Network,
      color: "text-blue-400",
      bg: "bg-blue-900/20",
      visual: (
        <div className="relative flex items-center justify-center h-full w-full">
           {/* Animated Tree Structure */}
           <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
             {/* Left Branch */}
             <motion.path d="M100 80 L100 50 L60 30" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" fill="none"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
             <motion.path d="M60 30 L40 15" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" fill="none"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.8 }} />
             <motion.path d="M60 30 L80 15" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" fill="none"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.8 }} />

             {/* Right Branch */}
             <motion.path d="M100 50 L140 30" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" fill="none"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
             <motion.path d="M140 30 L120 15" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" fill="none"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.0 }} />
             <motion.path d="M140 30 L160 15" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" fill="none"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.0 }} />
           </svg>

           {/* Nodes */}
           <motion.div className="absolute bottom-4 w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 z-10" 
              initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: "spring" }} />
           
           <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full z-10" 
              initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} />

           {/* Leaf Nodes */}
           {[
             { top: "30%", left: "30%", delay: 0.8 },
             { top: "30%", right: "30%", delay: 1.0 },
             { top: "15%", left: "20%", delay: 1.2 },
             { top: "15%", left: "40%", delay: 1.2 },
             { top: "15%", right: "40%", delay: 1.4 },
             { top: "15%", right: "20%", delay: 1.4 },
           ].map((node, i) => (
             <motion.div 
                key={i}
                className="absolute w-2 h-2 bg-blue-300 rounded-full"
                style={{ top: node.top, left: node.left, right: node.right }}
                initial={{ scale: 0 }} 
                whileInView={{ scale: 1 }} 
                transition={{ delay: node.delay, type: "spring" }} 
             />
           ))}
        </div>
      )
    },
    {
      title: "AI Explanations",
      desc: "Every concept explained instantly.",
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-900/20",
      visual: (
         <div className="relative flex flex-col items-center justify-center h-full gap-3">
            {/* Chat Bubbles */}
            <motion.div 
              className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 w-48 self-start ml-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-2 w-24 bg-white/20 rounded mb-2" />
              <div className="h-2 w-32 bg-white/10 rounded" />
            </motion.div>

            <motion.div 
              className="bg-purple-500/20 border border-purple-500/30 rounded-2xl rounded-tr-none p-3 w-48 self-end mr-8 relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-purple-400" />
              <div className="space-y-2">
                <motion.div 
                  className="h-2 bg-purple-400/40 rounded w-full"
                  initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ delay: 0.8, duration: 0.5 }}
                />
                <motion.div 
                  className="h-2 bg-purple-400/30 rounded w-5/6"
                  initial={{ width: 0 }} whileInView={{ width: "83%" }} transition={{ delay: 1.0, duration: 0.5 }}
                />
                <motion.div 
                  className="h-2 bg-purple-400/30 rounded w-4/6"
                  initial={{ width: 0 }} whileInView={{ width: "66%" }} transition={{ delay: 1.2, duration: 0.5 }}
                />
              </div>
            </motion.div>
         </div>
      )
    },
    {
      title: "Notes & Highlights",
      desc: "Learn actively, not passively.",
      icon: PenTool,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 w-64 space-y-3 relative overflow-hidden">
            <div className="h-2 w-full bg-white/10 rounded" />
            <div className="relative">
              <div className="h-2 w-full bg-white/10 rounded" />
              <motion.div 
                className="absolute inset-0 bg-yellow-500/40 rounded mix-blend-overlay"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
              />
            </div>
            <div className="h-2 w-3/4 bg-white/10 rounded" />
            
            {/* Floating Pen */}
            <motion.div
              className="absolute right-8 top-8 text-yellow-400"
              initial={{ x: 20, y: -20, opacity: 0 }}
              whileInView={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <PenTool className="w-6 h-6 fill-yellow-400/20" />
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "Export as Docs/PDF",
      desc: "Turn your entire learning path into a clean document.",
      icon: FileText,
      color: "text-green-400",
      bg: "bg-green-900/20",
      visual: (
        <div className="relative flex items-center justify-center h-full">
            {/* Background Pages */}
            <motion.div 
              className="absolute w-32 h-40 bg-white/5 border border-white/10 rounded-lg rotate-6"
              initial={{ rotate: 0, scale: 0.9 }}
              whileInView={{ rotate: 6, scale: 0.9 }}
              transition={{ delay: 0.2 }}
            />
            <motion.div 
              className="absolute w-32 h-40 bg-white/5 border border-white/10 rounded-lg -rotate-6"
              initial={{ rotate: 0, scale: 0.9 }}
              whileInView={{ rotate: -6, scale: 0.9 }}
              transition={{ delay: 0.3 }}
            />
            
            {/* Main Doc */}
            <motion.div 
                className="relative w-32 h-40 bg-[#1a1a1a] border border-white/20 rounded-lg flex flex-col gap-3 p-4 shadow-xl"
                whileHover={{ y: -5 }}
            >
                <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-white/20 rounded" />
                  <div className="w-2/3 h-1.5 bg-white/20 rounded" />
                  <div className="w-full h-1.5 bg-white/20 rounded" />
                </div>
                
                {/* Download Arrow */}
                <motion.div 
                  className="absolute -right-3 -bottom-3 bg-green-500 text-white p-2 rounded-full shadow-lg"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </motion.div>
            </motion.div>
        </div>
      )
    },
    {
      title: "Shareable Trees",
      desc: "Share your knowledge — zero AI credits needed.",
      icon: Share2,
      color: "text-pink-400",
      bg: "bg-pink-900/20",
      visual: (
        <div className="relative flex items-center justify-center h-full w-full">
            {/* Central Node */}
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  <Share2 className="w-5 h-5 text-pink-400" />
              </div>
              {/* Pulse Effect */}
              <motion.div 
                className="absolute inset-0 rounded-full border border-pink-500/30"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Connected Users */}
            {[0, 120, 240].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                style={{ transform: `rotate(${deg}deg) translateY(-60px)` }}
              >
                <div className="relative" style={{ transform: `rotate(-${deg}deg)` }}>
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
                  </div>
                  {/* Connection Line */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 w-1 h-[30px] bg-gradient-to-b from-white/5 to-pink-500/20 origin-top"
                    style={{ 
                      transform: `translate(-50%, 16px) rotate(${deg}deg)`,
                      height: '34px'
                    }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                  />
                </div>
              </motion.div>
            ))}
        </div>
      )
    },
    {
      title: "Auto Quizzes",
      desc: "Learn faster with smart AI quizzes.",
      icon: GraduationCap,
      color: "text-orange-400",
      bg: "bg-orange-900/20",
      visual: (
        <div className="relative flex items-center justify-center h-full">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 w-64 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="w-20 h-2 bg-white/10 rounded" />
                    <div className="text-[10px] text-orange-400 font-bold bg-orange-900/20 px-2 py-0.5 rounded">Q1/10</div>
                </div>
                
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i}
                        className={`p-2 rounded-lg border flex items-center gap-3 ${i === 2 ? 'bg-green-900/10 border-green-500/30' : 'bg-white/5 border-transparent'}`}
                        initial={{ x: -10, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${i === 2 ? 'border-green-500 bg-green-500' : 'border-white/20'}`}>
                          {i === 2 && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="w-32 h-1.5 bg-white/10 rounded" />
                      </motion.div>
                    ))}
                </div>
            </div>
            
            {/* Score Pop-up */}
            <motion.div 
                className="absolute -top-4 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20"
                initial={{ scale: 0, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 10 }}
                transition={{ delay: 0.8, type: "spring" }}
            >
                Correct! +50xp
            </motion.div>
        </div>

      )
    }
  ]

  return (
    <section className="container mx-auto px-4 py-24 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Powerful features for <span className="text-purple-400">deep learning</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Everything you need to break down complex topics and master them faster.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111] rounded-[2rem] p-8 shadow-sm border border-white/10 flex flex-col justify-between group hover:border-white/20 transition-colors h-[320px]"
            >
              <div className="h-32 mb-6 relative flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 overflow-hidden group-hover:border-white/10 transition-colors">
                {feature.visual}
              </div>
              <div>
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

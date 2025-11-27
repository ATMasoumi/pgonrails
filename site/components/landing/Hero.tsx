"use client"

import { Button } from "@/components/ui/button"
import { Network, Share2, Brain, FileText, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="container mx-auto px-4 pt-32 pb-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-[#0A0A0A] rounded-[2rem] overflow-hidden border border-white/10 relative"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col items-center text-center pt-16 pb-24 px-4 relative z-10"
        >
          {/* Floating Topic Tree */}
          <div className="relative w-full max-w-6xl h-[500px] mb-12 hidden md:block">
            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#333" />
                  <stop offset="100%" stopColor="#666" />
                </linearGradient>
              </defs>
              
              {/* Root to Level 1 */}
              {[
                { x1: "10%", y1: "50%", x2: "30%", y2: "35%" },
                { x1: "10%", y1: "50%", x2: "30%", y2: "65%" },
              ].map((line, i) => (
                <motion.line 
                  key={`l1-${i}`}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                  className="stroke-white/20 stroke-2" 
                  strokeDasharray="6 6"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -12 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ))}

              {/* Level 1 to Level 2 */}
              {[
                // From ML (30, 35)
                { x1: "30%", y1: "35%", x2: "55%", y2: "20%" },
                { x1: "30%", y1: "35%", x2: "55%", y2: "40%" },
                // From DS (30, 65)
                { x1: "30%", y1: "65%", x2: "55%", y2: "60%" },
                { x1: "30%", y1: "65%", x2: "55%", y2: "80%" },
              ].map((line, i) => (
                <motion.line 
                  key={`l2-${i}`}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                  className="stroke-white/20 stroke-2" 
                  strokeDasharray="6 6"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -12 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ))}

              {/* Level 2 to Level 3 */}
              {[
                // From NN (55, 20)
                { x1: "55%", y1: "20%", x2: "80%", y2: "15%" },
                { x1: "55%", y1: "20%", x2: "80%", y2: "25%" },
                // From DL (55, 40)
                { x1: "55%", y1: "40%", x2: "80%", y2: "35%" },
                { x1: "55%", y1: "40%", x2: "80%", y2: "45%" },
                // From Stats (55, 60)
                { x1: "55%", y1: "60%", x2: "80%", y2: "55%" },
                { x1: "55%", y1: "60%", x2: "80%", y2: "65%" },
                // From Vis (55, 80)
                { x1: "55%", y1: "80%", x2: "80%", y2: "75%" },
                { x1: "55%", y1: "80%", x2: "80%", y2: "85%" },
              ].map((line, i) => (
                <motion.line 
                  key={`l3-${i}`}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                  className="stroke-white/20 stroke-2" 
                  strokeDasharray="6 6"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -12 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ))}
            </svg>

            {/* Root Node */}
            <motion.div 
              className="absolute top-1/2 left-[10%] -translate-x-1/2 -translate-y-1/2 z-30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <div className="bg-[#111] text-white px-8 py-4 rounded-full shadow-2xl shadow-purple-900/20 border border-white/10 font-bold text-xl flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                AI
              </div>
            </motion.div>

            {/* Level 1 Nodes */}
            {[
              { text: "Machine Learning", top: "35%", left: "30%", color: "text-blue-400" },
              { text: "Data Science", top: "65%", left: "30%", color: "text-emerald-400" },
            ].map((node, i) => (
              <motion.div
                key={`l1-node-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ top: node.top, left: node.left }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
              >
                <div className={`bg-[#111] px-6 py-3 rounded-full shadow-lg border border-white/10 font-semibold text-lg ${node.color}`}>
                  {node.text}
                </div>
              </motion.div>
            ))}

            {/* Level 2 Nodes */}
            {[
              { text: "Neural Networks", top: "20%", left: "55%", delay: 0.4 },
              { text: "Deep Learning", top: "40%", left: "55%", delay: 0.5 },
              { text: "Statistics", top: "60%", left: "55%", delay: 0.6 },
              { text: "Visualization", top: "80%", left: "55%", delay: 0.7 },
            ].map((node, i) => (
               <motion.div
                key={`l2-node-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-[#111] border border-white/10 shadow-sm text-sm font-medium text-gray-300"
                style={{ top: node.top, left: node.left }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                transition={{ 
                  opacity: { delay: node.delay, duration: 0.4 },
                  scale: { delay: node.delay, duration: 0.4, type: "spring" },
                  y: { duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.1, cursor: "default", color: "#fff", borderColor: "#fff" }}
              >
                {node.text}
              </motion.div>
            ))}

            {/* Level 3 Nodes */}
            {[
              { text: "Transformers", top: "15%", left: "80%", delay: 0.8 },
              { text: "CNNs", top: "25%", left: "80%", delay: 0.9 },
              { text: "Backprop", top: "35%", left: "80%", delay: 1.0 },
              { text: "Layers", top: "45%", left: "80%", delay: 1.1 },
              { text: "Probability", top: "55%", left: "80%", delay: 1.2 },
              { text: "Distributions", top: "65%", left: "80%", delay: 1.3 },
              { text: "Charts", top: "75%", left: "80%", delay: 1.4 },
              { text: "Dashboards", top: "85%", left: "80%", delay: 1.5 },
            ].map((node, i) => (
               <motion.div
                key={`l3-node-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#111] border border-white/10 shadow-sm text-xs font-medium text-gray-500"
                style={{ top: node.top, left: node.left }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
                transition={{ 
                  opacity: { delay: node.delay, duration: 0.4 },
                  scale: { delay: node.delay, duration: 0.4, type: "spring" },
                  y: { duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.1, cursor: "default", color: "#fff", borderColor: "#fff" }}
              >
                {node.text}
              </motion.div>
            ))}
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
            Turn any topic into a clear, expandable visual tree with AI. Learn faster, think better, and share interactive mind-maps.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.04 }}
            >
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8 h-12 text-lg shadow-lg hover:shadow-white/20 transition-all relative overflow-hidden group font-semibold">
                <span className="relative z-10">Create a Tree Now</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-shimmer"
                />
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-lg border-white/20 text-white hover:bg-white/10 hover:text-white transition-all bg-transparent">
                Try Example Trees
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

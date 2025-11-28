"use client"

import { motion } from "framer-motion"
import { Database, Server, Shield, Zap, Layout, Box } from "lucide-react"

export default function Architecture() {
  return (
    <section className="container mx-auto px-4 py-24 bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-purple-400 font-medium mb-4 block"
          >
            Network and Connect
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Interconnect your knowledge seamlessly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">intelligent linking</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-8 leading-relaxed"
          >
            DocTree provides automated concept discovery, blazing fast navigation, and support for any subject, all out of the box.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-white font-medium cursor-pointer group"
          >
            Learn More 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-white/10 flex items-center gap-8"
          >
            <div>
              <div className="flex items-end gap-2 mb-1">
                <div className="h-6 w-1 bg-purple-500 rounded-full animate-pulse" />
                <div className="h-4 w-1 bg-purple-500/50 rounded-full" />
                <div className="h-8 w-1 bg-purple-500 rounded-full" />
              </div>
              <div className="text-2xl font-bold text-white">50ms p95</div>
              <div className="text-sm text-gray-500">global query latency</div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Replaces</span>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-600 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Visualization */}
        <div className="relative h-[600px] w-full">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Connecting Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* Lines connecting nodes */}
            {/* Center to Top Right */}
            <motion.path d="M300 300 L450 150" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1 }} />
            {/* Center to Bottom Right */}
            <motion.path d="M300 300 L450 450" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />
            {/* Center to Left */}
            <motion.path d="M300 300 L150 300" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
            {/* Top Right to Far Top */}
            <motion.path d="M450 150 L450 80" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} />
          </svg>

          {/* Nodes */}
          
          {/* Center Node (API Gateway equivalent) */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="w-16 h-16 bg-[#111] border border-blue-500/50 rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              {/* Pulse */}
              <div className="absolute -inset-2 border border-blue-500/20 rounded-3xl animate-ping opacity-20" />
            </div>
          </motion.div>

          {/* Top Right Node (Frontend equivalent) */}
          <motion.div 
            className="absolute top-[20%] right-[10%] z-10"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-[#161616] border border-white/10 rounded-xl p-4 w-64 shadow-xl backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-500 font-bold text-xs">JS</div>
                <div>
                  <div className="text-sm font-bold text-white">Web Client</div>
                  <div className="text-xs text-purple-400">client.doctree.app</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Just updated
              </div>
            </div>
          </motion.div>

          {/* Bottom Right Node (Backend equivalent) */}
          <motion.div 
            className="absolute bottom-[20%] right-[10%] z-10"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-[#161616] border border-white/10 rounded-xl p-4 w-64 shadow-xl backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Server className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Knowledge Engine</div>
                  <div className="text-xs text-purple-400">api.doctree.app</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Operational
              </div>
            </div>
          </motion.div>

          {/* Left Node (Analytics equivalent) */}
          <motion.div 
            className="absolute top-1/2 left-[10%] -translate-y-1/2 z-10"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-[#161616] border border-white/10 rounded-xl p-4 w-56 shadow-xl backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Layout className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Learning Analytics</div>
                  <div className="text-xs text-purple-400">stats.doctree.app</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Tracking active
              </div>
            </div>
          </motion.div>

          {/* Bottom Center (Database equivalent) */}
          <motion.div 
            className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-10"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-[#161616] border border-white/10 rounded-xl p-4 w-64 shadow-xl backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Vector Database</div>
                  <div className="text-xs text-purple-400">pg-vector-store</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Synced
              </div>
              {/* Nested Data Card */}
              <div className="mt-3 pt-3 border-t border-white/5">
                 <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Box className="w-3 h-3" />
                    <span>embeddings-v2</span>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Particles */}
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 rounded-full"
              style={{
                top: `${(i * 17) % 100}%`,
                left: `${(i * 37) % 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + (i % 2),
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}

        </div>
      </div>
    </section>
  )
}

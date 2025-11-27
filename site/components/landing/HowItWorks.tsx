"use client"

import { Search, Network, Expand } from "lucide-react"
import { motion } from "framer-motion"

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Type Anything You Want to Learn",
      description: "From 'iOS Development' to 'History of Cinema', start from any topic. DocTree works with any subject.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Network,
      title: "2. Get an Instant AI Knowledge Tree",
      description: "DocTree analyzes your topic and builds a complete hierarchical tree — automatically organized.",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: Expand,
      title: "3. Explore, Expand, and Export Your Learning",
      description: "Tap any branch to expand deeper, read explanations, generate documents, or share the full tree.",
      gradient: "from-pink-500 to-rose-500"
    }
  ]

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-[#111] rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-colors group"
            >
              <motion.div 
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg shadow-purple-900/20`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

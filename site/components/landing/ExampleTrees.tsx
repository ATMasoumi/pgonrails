"use client"

import { ArrowRight, Code, Film, Brain, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ExampleTrees() {
  const examples = [
    {
      title: "iOS Development",
      description: "Fundamentals, UI, concurrency, architecture...",
      icon: Code,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "History of Cinema",
      description: "Origins, silent era, Hollywood, global cinema...",
      icon: Film,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Psychology 101",
      description: "Cognitive, behavioral, social, developmental...",
      icon: Brain,
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "Nutrition Basics",
      description: "Macros, vitamins, digestion, diet planning...",
      icon: Leaf,
      gradient: "from-green-400 to-emerald-500"
    }
  ]

  return (
    <section className="container mx-auto px-4 py-20 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Explore Example Trees</h2>
            <p className="text-gray-400">See what's possible with DocTree.</p>
          </div>
          <Button variant="ghost" className="hidden md:flex gap-2 text-gray-400 hover:text-white hover:bg-white/10">
            View all examples <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examples.map((example, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.06, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
              }}
              className="group bg-[#111] rounded-2xl p-6 border border-white/10 shadow-sm cursor-pointer hover:border-white/20"
            >
              <motion.div 
                className={`w-full h-32 rounded-xl bg-gradient-to-br ${example.gradient} mb-6 flex items-center justify-center`}
                whileHover={{ rotate: [0, -2, 2, 0] }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <example.icon className="w-10 h-10 text-white opacity-90" />
                </motion.div>
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-1">{example.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{example.description}</p>
              <span className="text-sm font-medium text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Open Tree <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

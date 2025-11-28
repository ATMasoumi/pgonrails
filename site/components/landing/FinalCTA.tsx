"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function FinalCTA() {
  return (
    <section className="container mx-auto px-4 py-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          />
          
          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                top: `${(i * 23) % 100}%`,
                left: `${(i * 41) % 100}%`,
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

        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Start Learning Visually in Seconds.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            No more complicated reading. Enter a topic and watch it turn into a knowledge tree.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-white/20">
                Generate Your First Tree
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent">
                Try Example Trees
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

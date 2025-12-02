"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useAppContext } from "@/lib/contexts/appContext"
import { useSubscription } from "@/lib/contexts/SubscriptionContext"

export default function LandingNavbar() {
  const { user } = useAppContext()
  const { isPro, isLoading } = useSubscription()

  return (
    <motion.nav 
      className={cn(
        "fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-5xl rounded-full bg-[#111]/80 backdrop-blur-md shadow-2xl border border-white/10 py-2 md:py-3 px-4 md:px-6 z-50 flex items-center justify-between"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <BookOpen className="w-6 h-6 text-white" />
        </motion.div>
        <span className="text-xl font-bold tracking-tight text-white">DocTree</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        {!isPro && !isLoading && (
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 md:px-6 shadow-lg hover:shadow-white/20 transition-all font-semibold flex items-center gap-2 text-sm md:text-base h-9 md:h-10">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/signin">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 font-medium rounded-full px-3 md:px-5 text-sm md:text-base h-9 md:h-10">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 md:px-6 shadow-lg hover:shadow-white/20 transition-all font-semibold text-sm md:text-base h-9 md:h-10">
                <span className="hidden sm:inline">Generate a Tree</span>
                <span className="sm:hidden">Get Started</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  )
}

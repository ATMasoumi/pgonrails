import Hero from "@/components/landing/Hero"
import LandingNavbar from "@/components/landing/LandingNavbar"
import Features from "@/components/landing/Features"
import SocialProof from "@/components/landing/SocialProof"
import FinalCTA from "@/components/landing/FinalCTA"

export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>
      </div>
      
      <div className="relative z-10">
        <LandingNavbar />
        <Hero />
        <Features />
        <SocialProof />
        <FinalCTA />
        
        <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/10 bg-[#020202]">
          <p>© {new Date().getFullYear()} DocTree. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

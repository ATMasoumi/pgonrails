import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface TokenUsageProps {
  used: number
  limit: number
  resetDate: Date | null
}

export default function TokenUsage({ used, limit, resetDate }: TokenUsageProps) {
  const percentage = Math.min(100, Math.max(0, (used / limit) * 100))

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white backdrop-blur-lg shadow-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-100">
            <Sparkles className="h-5 w-5 text-yellow-400 fill-yellow-400/20" />
            AI Credit Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-2xl font-bold tracking-tight text-white">
                {used.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 ml-2">
                / {limit.toLocaleString()} credits
              </span>
            </div>
            <span className="text-xl font-semibold text-purple-200">
              {percentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="relative h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
              style={{ width: `${percentage}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12" />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400/50" />
              <p>GPT-5 Mini: <span className="text-gray-300">1 credit</span> / token</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400/50" />
              <p>GPT-5.1: <span className="text-gray-300">12 credits</span> / token</p>
            </div>
          </div>
          
          {resetDate && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-gray-500">
                Resets on <span className="text-gray-300 font-medium">{resetDate.toLocaleDateString()}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

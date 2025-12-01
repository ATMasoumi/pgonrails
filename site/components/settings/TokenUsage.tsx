import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TokenUsageProps {
  used: number
  limit: number
  resetDate: Date | null
}

export default function TokenUsage({ used, limit, resetDate }: TokenUsageProps) {
  const percentage = Math.min(100, Math.max(0, (used / limit) * 100))

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Credit Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{used.toLocaleString()} / {limit.toLocaleString()} credits</span>
            <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• GPT-5 Mini: 1 credit / token</p>
          <p>• GPT-5.1: 12 credits / token</p>
        </div>
        {resetDate && (
          <p className="text-sm text-gray-500 pt-2">
            Resets on {resetDate.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

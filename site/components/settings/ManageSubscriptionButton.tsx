"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CreditCard, Loader2, Settings } from "lucide-react"

type Props = {
    className?: string
    children?: React.ReactNode
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function ManageSubscriptionButton({ className, children, variant = "outline" }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleManage = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    returnUrl: window.location.href,
                }),
            })

            if (!res.ok) throw new Error('Failed to create portal session')

            const { url } = await res.json()
            router.push(url)
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    return (
        <Button 
            variant={variant} 
            className={cn(
                "relative overflow-hidden bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/20 hover:to-white/10 border-white/10 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-white/5 group",
                className
            )} 
            onClick={handleManage} 
            disabled={loading}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    <Settings className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    {children || "Manage Subscription"}
                </>
            )}
        </Button>
    )
}

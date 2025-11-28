"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ManageSubscriptionButton() {
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
        <Button variant="outline" onClick={handleManage} disabled={loading}>
            {loading ? "Loading..." : "Manage Subscription"}
        </Button>
    )
}

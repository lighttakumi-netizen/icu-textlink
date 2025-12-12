'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'

export function ConnectStripeButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleConnect = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/stripe/connect', { method: 'POST' })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert("Failed to get connection URL")
            }
        } catch (e) {
            console.error(e)
            alert("Error connecting to Stripe")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button onClick={handleConnect} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Setup Payouts (Connect Stripe)
        </Button>
    )
}

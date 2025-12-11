'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { requestTextbook } from "@/app/textbooks/actions"
import { useRouter } from 'next/navigation'

export function RequestButton({ textbookId }: { textbookId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleRequest() {
        if (!confirm("Are you sure you want to request this book?")) return

        setIsLoading(true)
        const res = await requestTextbook(textbookId)

        if (res?.error) {
            alert(res.error)
            setIsLoading(false)
        } else if (res?.success) {
            alert("Request sent successfully! check your dashboard.")
            router.push('/dashboard')
            router.refresh()
        } else {
            // Redirect happened server side if we used redirect() in action, 
            // but we modified action to return object usually.
            // If action does redirect, this code might not reach.
            setIsLoading(false)
        }
    }

    return (
        <Button size="lg" className="w-full text-lg h-12" onClick={handleRequest} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Request to Borrow
        </Button>
    )
}

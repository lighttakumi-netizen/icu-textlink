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
        try {
            const res = await requestTextbook(textbookId)

            if (res?.error) {
                alert(`Error: ${res.error}`)
            } else if (res?.success) {
                alert("Request sent successfully! Check your dashboard.")
                router.push('/dashboard')
                router.refresh()
            }
        } catch (e) {
            console.error("Request failed unexpectedly:", e)
            alert("An unexpected error occurred. Please try again.")
        } finally {
            // Only stop loading if we didn't succeed (success redirects)
            // But router.push is client-side nav, so state might persist briefly.
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

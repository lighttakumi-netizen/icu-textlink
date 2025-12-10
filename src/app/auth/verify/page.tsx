"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { verifyEmail } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function VerifyPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') ?? ""

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleVerify(formData: FormData) {
        setIsLoading(true)
        setError(null)

        // Ensure email is included
        formData.append('email', email)

        const res = await verifyEmail(formData)
        setIsLoading(false)

        if (res?.error) {
            setError(res.error)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Check your Inbox</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit confirmation code to <strong>{email}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <form action={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Confirmation Code</Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="123456"
                                required
                                maxLength={6}
                                className="text-center text-2xl tracking-widest letter-spacing-2"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Verify & Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

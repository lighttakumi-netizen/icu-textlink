'use client'

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProfile } from "@/app/profile/actions"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"

export default function ProfilePage({ user, profile }: { user: any, profile: any }) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setMessage(null)

        const res = await updateProfile(formData)

        setIsLoading(false)
        if (res.error) {
            setMessage({ type: 'error', text: res.error })
        } else if (res.success) {
            setMessage({ type: 'success', text: res.message || "Updated!" })
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto space-y-6">
                <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {message && (
                            <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user?.email} disabled className="bg-slate-100 text-slate-500" />
                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="full_name">Display Name</Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    defaultValue={profile?.full_name || user?.user_metadata?.full_name}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="student_id">Student ID</Label>
                                <Input
                                    id="student_id"
                                    name="student_id"
                                    defaultValue={profile?.student_id || ""}
                                    placeholder="e.g. 231234"
                                />
                                <p className="text-xs text-muted-foreground">Used for verification if needed.</p>
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

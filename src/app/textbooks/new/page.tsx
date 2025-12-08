"use client"

import { useState } from "react"
import { createTextbook } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateTextbookPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const response = await createTextbook(formData)

        if (response?.error) {
            setError(response.error)
            setIsLoading(false)
        }
        // If success, it redirects in the server action, so we don't need to do anything here unless we want to handle loading state differently.
    }

    return (
        <div className="container max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>List a Textbook</CardTitle>
                    <CardDescription>
                        Share your textbook with other students.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Textbook Title</Label>
                            <Input id="title" name="title" required placeholder="e.g. Introduction to Psychology" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="course_name">Course Name/ID</Label>
                            <Input id="course_name" name="course_name" required placeholder="e.g. PSY101" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="condition">Condition</Label>
                            <Select name="condition" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="S">S - Like New</SelectItem>
                                    <SelectItem value="A">A - Very Good</SelectItem>
                                    <SelectItem value="B">B - Good</SelectItem>
                                    <SelectItem value="C">C - Acceptable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Mention any highlights, notes, or damage..."
                                className="h-32"
                            />
                        </div>

                        {/* Image upload placeholder */}
                        <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground text-sm">
                            Image upload coming soon
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm font-medium">{error}</div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Listing..." : "List Textbook"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

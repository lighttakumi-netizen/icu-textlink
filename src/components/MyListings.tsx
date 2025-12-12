'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Loader2, Plus, BookOpen } from "lucide-react"
import { deleteTextbook } from '@/app/textbooks/actions'
import { EditTextbookDialog } from "./EditTextbookDialog"
import Link from 'next/link'

type Textbook = {
    id: string
    title: string
    course_name: string
    condition: string
    description: string | null
    images: string[] | null
    is_available: boolean
    created_at: string
}

export function MyListings({ textbooks }: { textbooks: Textbook[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const router = useRouter()

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return

        setIsDeleting(id)
        const res = await deleteTextbook(id)
        setIsDeleting(null)

        if (res.success) {
            router.refresh()
        } else {
            alert(res.error || "Failed to delete")
        }
    }

    if (textbooks.length === 0) {
        return (
            <Card className="bg-slate-50 border-dashed">
                <CardContent className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <BookOpen className="h-12 w-12 opacity-20" />
                    <p>You haven't listed any textbooks yet.</p>
                    <Button asChild variant="outline">
                        <Link href="/textbooks/new">
                            <Plus className="mr-2 h-4 w-4" /> List Your First Book
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button asChild size="sm">
                    <Link href="/textbooks/new">
                        <Plus className="mr-2 h-4 w-4" /> Add New Listing
                    </Link>
                </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {textbooks.map((book) => (
                    <div key={book.id} className="border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
                        <div className="aspect-[3/2] bg-slate-200 relative">
                            {book.images && book.images.length > 0 ? (
                                <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
                            )}
                            <div className="absolute top-2 right-2">
                                <Badge variant={book.is_available ? "default" : "secondary"}>
                                    {book.is_available ? "Available" : "Unavailable"}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-lg line-clamp-1" title={book.title}>{book.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{book.course_name}</p>

                            <div className="mt-auto flex items-center gap-2 pt-4 border-t">
                                <EditTextbookDialog textbook={book} />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50 border-red-200"
                                    onClick={() => handleDelete(book.id)}
                                    disabled={!!isDeleting}
                                >
                                    {isDeleting === book.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

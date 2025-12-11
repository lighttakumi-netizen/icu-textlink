'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { submitReview } from '@/app/textbooks/actions'

export function ReviewModal({ transactionId, targetId, onReviewSubmitted }: {
    transactionId: string,
    targetId: string,
    onReviewSubmitted?: () => void
}) {
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit() {
        setIsSubmitting(true)
        const res = await submitReview(transactionId, targetId, rating, comment)
        setIsSubmitting(false)

        if (res.success) {
            setOpen(false)
            if (onReviewSubmitted) onReviewSubmitted()
            alert('Review submitted successfully!')
        } else {
            alert(res.error || "Failed to submit review")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                    <Star className="h-4 w-4 mr-2" /> Leave Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogDescription>
                        How was your experience using this textbook?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`focus:outline-none transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                            >
                                <Star className="h-8 w-8 fill-current" />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Write your comments here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

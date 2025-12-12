'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Loader2, Pencil } from "lucide-react"
import { updateTextbook } from '@/app/textbooks/actions'

type Textbook = {
    id: string
    title: string
    course_name: string
    condition: string
    description: string | null
    is_available: boolean
}

export function EditTextbookDialog({ textbook }: { textbook: Textbook }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        const res = await updateTextbook(textbook.id, formData)
        setIsLoading(false)

        if (res.success) {
            setOpen(false)
            router.refresh()
            alert("Textbook updated!")
        } else {
            alert(res.error || "Failed to update")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Textbook</DialogTitle>
                    <DialogDescription>
                        Update the details of your listing here.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" defaultValue={textbook.title} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="course_name">Course Name</Label>
                        <Input id="course_name" name="course_name" defaultValue={textbook.course_name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select name="condition" defaultValue={textbook.condition}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="S">S (Like New)</SelectItem>
                                <SelectItem value="A">A (Very Good)</SelectItem>
                                <SelectItem value="B">B (Good)</SelectItem>
                                <SelectItem value="C">C (Acceptable)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={textbook.description || ""} />
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Hidden checkbox hack for FormData or handled via manual state/hidden input? 
                             Simplest Next.js way: defaultChecked checkbox sends 'on' if checked.
                         */}
                        <input type="checkbox" id="is_available" name="is_available" defaultChecked={textbook.is_available} className="h-4 w-4 rounded border-gray-300" />
                        <Label htmlFor="is_available">Available for borrowing</Label>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

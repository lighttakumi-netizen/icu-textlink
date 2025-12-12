'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { requestTextbook } from '../app/textbooks/actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RENTAL_PLANS, RentalDuration } from '@/lib/pricing'

export function RequestButton({ textbookId, isOwner }: { textbookId: string, isOwner: boolean }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<RentalDuration>('weekly')
    const router = useRouter()

    if (isOwner) return null

    const handleRequest = async () => {
        try {
            setIsLoading(true)
            const result = await requestTextbook(textbookId, selectedPlan)
            if (result?.error) {
                alert(`Error: ${result.error}`)
            } else if (result?.success) {
                alert("Request sent successfully! Once approved, you can pay and start chatting.")
                setIsOpen(false)
                router.push('/dashboard')
                router.refresh()
            }
        } catch (e) {
            alert("An unexpected error occurred.")
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full text-lg h-12">Request to Borrow</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Select Rental Duration</DialogTitle>
                    <DialogDescription>
                        Choose how long you want to borrow this textbook.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        {(Object.keys(RENTAL_PLANS) as RentalDuration[]).map((planKey) => {
                            const plan = RENTAL_PLANS[planKey]
                            const isSelected = selectedPlan === planKey
                            return (
                                <div
                                    key={planKey}
                                    className={`flex items-center space-x-3 border p-3 rounded-md cursor-pointer transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'hover:bg-slate-50'}`}
                                    onClick={() => setSelectedPlan(planKey)}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-slate-400'}`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                    </div>
                                    <Label className="flex-1 cursor-pointer flex justify-between">
                                        <span>{plan.label}</span>
                                        <div className="text-right">
                                            <span className="block font-semibold">¥{plan.price}</span>
                                            <span className="text-xs text-slate-400">Owner gets: ¥{plan.lenderPayout}</span>
                                        </div>
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                        * Payment is required after approval.
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleRequest} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

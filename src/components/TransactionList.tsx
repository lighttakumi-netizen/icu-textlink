'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Check, X } from "lucide-react"
import { updateTransactionStatus } from '@/app/textbooks/actions'

type Transaction = {
    id: string
    status: string
    created_at: string
    book: {
        id: string
        title: string
        image_url: string
    }
    borrower: {
        id: string
        full_name: string
        email: string
    }
    lender: {
        id: string
        full_name: string
        email: string
    }
}

export function TransactionList({
    transactions,
    currentUserId
}: {
    transactions: Transaction[],
    currentUserId: string
}) {
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const lending = transactions.filter(t => t.lender.id === currentUserId)
    const borrowing = transactions.filter(t => t.borrower.id === currentUserId)

    async function handleStatusUpdate(id: string, status: 'approved' | 'rejected') {
        setIsLoading(id)
        await updateTransactionStatus(id, status)
        setIsLoading(null)
    }

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            case 'approved':
                return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Approved</Badge>
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>
            case 'returned':
                return <Badge variant="outline">Returned</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const TransactionCard = ({ t, type }: { t: Transaction, type: 'lending' | 'borrowing' }) => (
        <div key={t.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Book Image Placeholder */}
            {t.book.image_url ? (
                <img src={t.book.image_url} alt={t.book.title} className="w-20 h-28 object-cover rounded-md bg-slate-200" />
            ) : (
                <div className="w-20 h-28 bg-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs text-center p-1">
                    No Image
                </div>
            )}

            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-lg text-slate-900">{t.book.title}</h4>
                        <p className="text-sm text-slate-500">
                            {type === 'lending'
                                ? `Requested by ${t.borrower.full_name}`
                                : `Owner: ${t.lender.full_name}`
                            }
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(t.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <StatusBadge status={t.status} />
                </div>

                {/* Actions & Contact Info */}
                <div className="pt-2">
                    {t.status === 'pending' && type === 'lending' && (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusUpdate(t.id, 'approved')}
                                disabled={!!isLoading}
                            >
                                {isLoading === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Accept</>}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                onClick={() => handleStatusUpdate(t.id, 'rejected')}
                                disabled={!!isLoading}
                            >
                                {isLoading === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1" /> Reject</>}
                            </Button>
                        </div>
                    )}

                    {t.status === 'approved' && (
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 flex items-start gap-3">
                            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Contact Email</p>
                                <p className="text-sm text-blue-700 select-all">
                                    {type === 'lending' ? t.borrower.email : t.lender.email}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Please email {type === 'lending' ? 'the borrower' : 'the owner'} to arrange the handover.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    if (transactions.length === 0) {
        return (
            <Card className="bg-slate-50 border-dashed">
                <CardContent className="py-12 text-center text-slate-500">
                    <p>No active transactions found.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Tabs defaultValue="borrowing" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="borrowing">Borrowed ({borrowing.length})</TabsTrigger>
                <TabsTrigger value="lending">Lending ({lending.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="borrowing" className="space-y-4">
                {borrowing.length > 0 ? (
                    borrowing.map(t => <TransactionCard key={t.id} t={t} type="borrowing" />)
                ) : (
                    <div className="text-center py-8 text-slate-500">You haven't requested any books yet.</div>
                )}
            </TabsContent>

            <TabsContent value="lending" className="space-y-4">
                {lending.length > 0 ? (
                    lending.map(t => <TransactionCard key={t.id} t={t} type="lending" />)
                ) : (
                    <div className="text-center py-8 text-slate-500">No one has requested your books yet.</div>
                )}
            </TabsContent>
        </Tabs>
    )
}

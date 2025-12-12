'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Check, X, MessageCircle } from "lucide-react"
import { updateTransactionStatus } from '@/app/textbooks/actions'
import { ChatBox } from "@/components/ChatBox"
import { ReviewModal } from "@/components/ReviewModal"

type Transaction = {
    id: string
    status: string
    created_at: string
    book: {
        id: string
        title: string
        image_url: string
        course_id: string | null
        course_name: string
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
    const [activeChat, setActiveChat] = useState<string | null>(null)

    const lending = transactions.filter(t => t.lender.id === currentUserId)
    const borrowing = transactions.filter(t => t.borrower.id === currentUserId)

    async function handleStatusUpdate(id: string, status: 'approved' | 'rejected' | 'returned') {
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
                return <Badge variant="outline" className="text-blue-600 border-blue-600">Returned</Badge>
            case 'completed':
                return <Badge variant="secondary" className="bg-slate-200 text-slate-600">Completed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const TransactionCard = ({ t, type }: { t: Transaction, type: 'lending' | 'borrowing' }) => {
        const isCompleted = ['returned', 'completed'].includes(t.status)
        const isApproved = t.status === 'approved'

        return (
            <div key={t.id} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Book Image */}
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
                                <p className="text-sm text-slate-500 mb-1">
                                    {t.book.course_id && <span className="font-medium mr-2 text-primary">{t.book.course_id}</span>}
                                    {t.book.course_name}
                                </p>
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

                        {/* Actions */}
                        <div className="pt-2 flex flex-wrap gap-2">
                            {/* Approve/Reject (Lender only, Status: Pending) */}
                            {t.status === 'pending' && type === 'lending' && (
                                <>
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
                                </>
                            )}

                            {/* Mark as Returned (Lender only, Status: Approved) */}
                            {t.status === 'approved' && type === 'lending' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(t.id, 'returned')}
                                    disabled={!!isLoading}
                                >
                                    Mark as Returned
                                </Button>
                            )}

                            {/* Chat Button (Visible if active transaction) */}
                            {(isApproved || isCompleted) && (
                                <Button
                                    size="sm"
                                    variant={activeChat === t.id ? "secondary" : "outline"}
                                    onClick={() => setActiveChat(activeChat === t.id ? null : t.id)}
                                >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    {activeChat === t.id ? 'Close Chat' : 'Chat'}
                                </Button>
                            )}

                            {/* Review Button (Visible if Completed) */}
                            {isCompleted && (
                                <ReviewModal
                                    transactionId={t.id}
                                    targetId={type === 'lending' ? t.borrower.id : t.lender.id}
                                    onReviewSubmitted={() => window.location.reload()} // Simple reload to refresh state
                                />
                            )}
                        </div>

                        {/* Contact info logic moved to Chat mainly, but can keep email if needed */}
                        {isApproved && (
                            <p className="text-xs text-slate-500 mt-2">
                                Contact Email: {type === 'lending' ? t.borrower.email : t.lender.email}
                            </p>
                        )}
                    </div>
                </div>

                {/* Inline Chat Area */}
                {activeChat === t.id && (
                    <div className="border-t p-4 bg-slate-50">
                        <ChatBox transactionId={t.id} currentUserId={currentUserId} />
                    </div>
                )}
            </div>
        )
    }

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

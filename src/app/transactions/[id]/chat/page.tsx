import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatBox } from '@/components/ChatBox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ChatPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // specific transaction fetch
    const { data: transaction, error } = await supabase
        .from('transactions')
        .select(`
            *,
            book:textbooks(title, images),
            borrower:profiles!transactions_borrower_id_fkey(full_name),
            lender:profiles!transactions_lender_id_fkey(full_name)
        `)
        .eq('id', params.id)
        .single()

    if (error || !transaction) {
        notFound()
    }

    // Security check
    if (transaction.borrower_id !== user.id && transaction.lender_id !== user.id) {
        return <div className="p-8 text-center text-red-500">Access Denied</div>
    }

    const partnerName = user.id === transaction.borrower_id
        ? transaction.lender?.full_name
        : transaction.borrower?.full_name

    return (
        <div className="container max-w-2xl py-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="font-bold text-lg">{transaction.book?.title}</h1>
                    <p className="text-sm text-slate-500">Chat with {partnerName}</p>
                </div>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-white shadow-sm">
                <ChatBox transactionId={params.id} currentUserId={user.id} />
            </div>
        </div>
    )
}

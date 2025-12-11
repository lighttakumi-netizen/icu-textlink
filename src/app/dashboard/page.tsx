import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BookOpen, Plus, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getUserTransactions } from "@/app/textbooks/actions"
import { TransactionList } from "@/components/TransactionList"

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in</div>
    }

    const rawTransactions = await getUserTransactions() || []

    // Transform Supabase response to match Component props
    const transactions = rawTransactions.map((t: any) => ({
        ...t,
        book: Array.isArray(t.book) ? t.book[0] : t.book,
        borrower: Array.isArray(t.borrower) ? t.borrower[0] : t.borrower,
        lender: Array.isArray(t.lender) ? t.lender[0] : t.lender
    }))

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-xl text-slate-900">ICU TextLink</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 hidden sm:inline">
                            Welcome, {user.user_metadata.full_name || user.email}
                        </span>
                        <Link href="/profile">
                            <Button variant="ghost" size="icon" className="text-slate-600">
                                <User className="h-5 w-5" />
                            </Button>
                        </Link>
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" size="sm" className="text-slate-600">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/textbooks" className="group">
                        <Card className="h-full hover:border-blue-300 transition-colors cursor-pointer">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                                    <Search className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Find Textbooks</h3>
                                    <p className="text-slate-500">Browse available books and request to borrow.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/textbooks/new" className="group">
                        <Card className="h-full hover:border-green-300 transition-colors cursor-pointer">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                                    <Plus className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Lend a Textbook</h3>
                                    <p className="text-slate-500">List your unused textbooks to help others.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Transactions */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Your Transactions</h2>
                    <TransactionList transactions={transactions} currentUserId={user.id} />
                </div>
            </main>
        </div>
    )
}

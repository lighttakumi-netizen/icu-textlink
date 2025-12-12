import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookOpen, Plus, User, Wallet, PlusCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getUserTransactions } from "@/app/textbooks/actions"
import { TransactionList } from "@/components/TransactionList"
import { ConnectStripeButton } from "@/components/ConnectStripeButton"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const rawTransactions = await getUserTransactions() || []

    // Fetch user profile for Stripe status
    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_charges_enabled')
        .eq('id', user.id)
        .single()

    const isStripeConnected = profile?.stripe_charges_enabled || false

    // Fetch my textbooks
    const { data: myTextbooks } = await supabase
        .from('textbooks')
        .select('*')
        .eq('owner_id', user.id)

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

                {/* Stripe Connect Warning for Lenders */}
                {!isStripeConnected && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-indigo-900">Setup Payouts Required</h3>
                                <p className="text-sm text-indigo-700">To accept requests and receive money, you need to connect your Stripe account.</p>
                            </div>
                        </div>
                        <ConnectStripeButton />
                    </div>
                )}

                <Tabs defaultValue="transactions" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="listings">My Listings</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="transactions">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 sr-only">Your Transactions</h2>
                            <TransactionList transactions={transactions} currentUserId={user.id} />
                        </div>
                    </TabsContent>

                    <TabsContent value="listings">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {myTextbooks && myTextbooks.length > 0 ? (
                                    myTextbooks.map((book: any) => (
                                        <div key={book.id} className="border rounded-lg p-4 flex gap-3 hover:bg-slate-50 cursor-pointer bg-white">
                                            {book.images && book.images[0] ? (
                                                <img src={book.images[0]} className="w-16 h-20 object-cover rounded bg-slate-200" />
                                            ) : (
                                                <div className="w-16 h-20 bg-slate-200 rounded flex items-center justify-center text-xs">No Img</div>
                                            )}
                                            <div>
                                                <h4 className="font-medium line-clamp-1">{book.title}</h4>
                                                <p className="text-xs text-slate-500">{book.course_name}</p>
                                                <div className="mt-2 text-xs">
                                                    <Link href={`/textbooks/${book.id}`} className="text-indigo-600 hover:underline">View Details</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-8 text-slate-500">
                                        You haven't listed any textbooks yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

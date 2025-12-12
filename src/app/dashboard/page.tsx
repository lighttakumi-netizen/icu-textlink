import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookOpen, Plus, User } from "lucide-react"
import { createClient } from '@/utils/supabase/server'
import { getUserTransactions, getCategories } from '@/app/textbooks/actions'
import { TransactionList } from '@/components/TransactionList'
import { PlusCircle, Wallet } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ConnectStripeButton } from '@/components/ConnectStripeButton'

export default async function Dashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const transactions = await getUserTransactions()

    // Fetch user profile for Stripe status
    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_charges_enabled')
        .eq('id', user.id)
        .single()

    const isStripeConnected = profile?.stripe_charges_enabled || false

    // Fetch my textbooks (Simulated as filtering for now, or new server action needed to do it strictly)
    // For now, let's just use the TransactionList. Ideally we want "My Listings" management too.
    const { data: myTextbooks } = await supabase
        .from('textbooks')
        .select('*')
        .eq('owner_id', user.id)


    return (
        <User className="h-5 w-5" />
                            </Button >
                        </Link >
        <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" className="text-slate-600">
                Sign Out
            </Button>
        </form>
                    </div >
                </div >
            </header >

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
                        <MyListings textbooks={myTextbooks} />
                    </div>
                </TabsContent>
            </Tabs>
        </main>
        </div >
    )
}

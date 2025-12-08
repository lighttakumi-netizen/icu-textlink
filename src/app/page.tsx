import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Book, CheckCircle, RefreshCw, Shield } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.14))]">
            {/* Hero Section */}
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 bg-slate-50">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <Link
                        href="/about"
                        className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted/80"
                    >
                        ICU Students Only 🎓
                    </Link>
                    <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                        Seamless Textbook Sharing <br className="hidden sm:inline" />
                        for the ICU Community
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Buy, borrow, and lend textbooks securely with your student ID.
                        Fixed pricing, no negotiation, trusted ecosystem.
                    </p>
                    <div className="space-x-4">
                        <Button size="lg" asChild>
                            <Link href="/login">Get Started</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/about">How it works</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                        Built on Trust
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        We solved the problems of anonymous marketplaces by restricting access to verified ICU students.
                    </p>
                </div>
                <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                        <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                            <Shield className="h-12 w-12 text-slate-900" />
                            <div className="space-y-2">
                                <h3 className="font-bold">Trust & Safety</h3>
                                <p className="text-sm text-muted-foreground">
                                    Verified by @icu.ac.jp email. Real names and student IDs ensure accountability.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                        <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                            <CheckCircle className="h-12 w-12 text-slate-900" />
                            <div className="space-y-2">
                                <h3 className="font-bold">Fixed Pricing</h3>
                                <p className="text-sm text-muted-foreground">
                                    No awkward negotiations. Fixed rates for daily, weekly, or monthly rentals.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                        <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                            <RefreshCw className="h-12 w-12 text-slate-900" />
                            <div className="space-y-2">
                                <h3 className="font-bold">Eco-System</h3>
                                <p className="text-sm text-muted-foreground">
                                    Keep resources within the campus via direct handovers. Save money and the planet.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="container py-8 md:py-12 lg:py-24">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                        Ready to save on textbooks?
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Join hundreds of other ICU students today.
                    </p>
                    <Button size="lg" asChild className="mt-4">
                        <Link href="/login">
                            Create Account <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}

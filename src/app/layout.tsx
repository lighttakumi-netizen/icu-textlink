import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "ICU TextLink",
    description: "Textbook sharing platform for ICU students",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <html lang="en">
            <body className="min-h-screen flex flex-col bg-background font-sans antialiased">
                <Header user={user} />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}

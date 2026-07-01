import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./globals.css";
import { UserNav } from "@/features/auth/user-nav";
import { LoginButton } from "@/features/auth/login-button";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { HeaderWrapper } from "@/components/header-wrapper";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PeaPods - Sublease Marketplace",
  description:
    "Trust-based sublease marketplace for university students and summer interns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <div className="relative flex min-h-screen flex-col">
          {/* Floating Pill Header */}
          <HeaderWrapper>
            <header className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-5xl px-4 sm:px-6">
              <div className="flex h-16 items-center justify-between rounded-full border border-slate-200/60 bg-white/80 px-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                      <p className="text-xl font-black tracking-tight text-slate-900 leading-none">
                        PeaPods.
                      </p>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserNav />
                  <LoginButton />
                </div>
              </div>
            </header>
          </HeaderWrapper>

          <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 mx-auto w-full max-w-6xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

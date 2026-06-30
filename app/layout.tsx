import type { Metadata } from "next";
import "./globals.css";
import { UserNav } from "@/features/auth/user-nav";
import { LoginButton } from "@/features/auth/login-button";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

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
      <body>
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-900">
                  PeaPods
                </p>
                <p className="text-xs text-slate-500">
                  Subleases for students and interns
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserNav />
              <LoginButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}

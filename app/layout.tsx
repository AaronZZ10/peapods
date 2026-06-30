import type { Metadata } from "next";
import "./globals.css";
import { UserNav } from "@/features/auth/user-nav";
import { LoginButton } from "@/features/auth/login-button";

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
    <html lang="en">
      <body>
        <header className="border-b">
          <div className="max-w-5xl mx-auto py-4 flex items-center justify-between px-4">
            <h1 className="text-xl font-bold">PeaPods</h1>
            <div className="flex items-center gap-4">
              <UserNav />
              <LoginButton />
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto py-8 px-4">{children}</main>
      </body>
    </html>
  );
}

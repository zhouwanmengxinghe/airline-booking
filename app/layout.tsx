import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "KiwiAir — Airline Booking",
  description: "Book your flight across New Zealand and Sydney",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}
      >
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary-700 tracking-tight">
              KiwiAir
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-primary-700 transition-colors">
                Home
              </Link>
              <Link
                href="/my-bookings"
                className="text-gray-600 hover:text-primary-700 transition-colors"
              >
                My Bookings
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

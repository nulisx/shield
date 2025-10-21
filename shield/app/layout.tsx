import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Shield",
  description: "", // leave empty so no duplicate lines in embeds
  openGraph: {
    title: "Shield",
    description: "", // empty to prevent extra text
    url: "https://shieldyard.vercel.app",
    siteName: "Shield",
  },
  twitter: {
    card: "summary",
    title: "Shield",
    description: "", // empty again
  },
  generator: "Shield.sh",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}

import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import { ClerkSync } from "@/components/ClerkSync"

const inter = Inter({ subsets: ["latin"] })

// Make sure the key exists and is a string
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

export const metadata: Metadata = {
  title: "CanCitizenTest - Canadian Citizenship Test Practice",
  description: "Practice for your Canadian citizenship test with our AI-powered quiz generator. Study smarter and prepare to pass your citizenship exam.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={inter.className}>
          <ClerkSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

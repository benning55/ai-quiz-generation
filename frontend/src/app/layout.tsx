import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { ClerkProvider } from '@clerk/nextjs'
import { ClarityInit } from "@/components/ClarityInit"
import { ClerkSync } from "@/components/ClerkSync"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

// Make sure the key exists and is a string
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

export const metadata: Metadata = {
  title: "CanCitizenTest - Canadian Citizenship Practice",
  description: "Master the Canadian Citizenship Test with AI-powered practice quizzes. Study smarter and pass with confidence.",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CanCitizenTest",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "CanCitizenTest",
    "mobile-web-app-capable": "yes",
  },
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
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-06TH2E48KL" />
          <Script id="google-gtag">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-06TH2E48KL');
            `}
          </Script>
          <link rel="manifest" href="/manifest.json" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="CanCitizenTest" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#dc2626" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
          <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icons/icon-192x192.svg" />
          <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icons/icon-512x512.svg" />
        </head>
        <body className={inter.className}>
          <ClarityInit />
          <ClerkSync />
          <AuthProvider>
            {children}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                    if ('serviceWorker' in navigator) {
                      window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js');
                      });
                    }
                    // auto-reload once on chunk load errors
                    window.addEventListener('error', function (e) {
                      var src = e?.target?.src || '';
                      if (src.includes('/_next/') && src.includes('chunk') &&
                          !sessionStorage.getItem('chunk-reload')) {
                        sessionStorage.setItem('chunk-reload', '1');
                        location.reload();
                      }
                    }, true);
                  `,
              }}
            />
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import {Header} from "@/sections/Header"
import clsx from "clsx";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Save Boost Landing Page",
  description: "Verify product potential",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='relative'>
      <body className={clsx(dmSans.className, "antialiased bg-[#EAEEFE]")}>
        {children}
      </body>
    </html>
  )
}

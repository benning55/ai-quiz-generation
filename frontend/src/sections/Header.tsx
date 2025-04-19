import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import ArrowRight from "@/assets/arrow-right.svg"
import Logo from "@/assets/logosaas.png"
import MenuIcon from "@/assets/menu.svg"

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 bg-gradient-to-r from-blue-700 to-red-600 text-white shadow-lg z-20">
      <div className="container py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg"
                alt="Canadian Flag"
                height={40}
                width={40}
              />
            </motion.div>
            <div className="text-xl font-bold">
              <span className="text-white">CanCitizen</span>
              <span className="font-light text-gray-200">Test</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#" className="hover:text-gray-200 transition-colors">About</a>
            <Link href="/quiz" className="hover:text-gray-200 transition-colors">Practice Tests</Link>
            <a href="#" className="hover:text-gray-200 transition-colors">Study Guide</a>
            
            <SignedIn>
              <Link href="/admin" className="hover:text-gray-200 transition-colors">Admin</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <Link href="/sign-in" className="hover:text-gray-200 transition-colors">Sign In</Link>
              <Link href="/sign-up" className="bg-white text-blue-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center tracking-tight transition-colors">
                Sign Up
              </Link>
            </SignedOut>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="mt-4 flex flex-col gap-2 pb-2 md:hidden">
            <a href="#" className="hover:bg-white/10 p-2 rounded">About</a>
            <Link href="/quiz" className="hover:bg-white/10 p-2 rounded">Practice Tests</Link>
            <a href="#" className="hover:bg-white/10 p-2 rounded">Study Guide</a>
            
            <SignedIn>
              <Link href="/admin" className="hover:bg-white/10 p-2 rounded">Admin</Link>
              <div className="p-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            
            <SignedOut>
              <Link href="/sign-in" className="hover:bg-white/10 p-2 rounded">Sign In</Link>
              <Link href="/sign-up" className="bg-white text-blue-700 hover:bg-gray-100 p-2 rounded font-medium">
                Sign Up
              </Link>
            </SignedOut>
          </nav>
        )}
      </div>
    </header>
  )
};

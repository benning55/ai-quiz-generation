import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export const Header2 = () => {
  return (
    <header className='sticky top-0 bg-white shadow-sm z-20'>
      <div className='py-4'>
        <div className='container'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <motion.img
                src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg"
                alt='Canadian Flag'
                height={40}
                width={40}
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              />
              <div className='font-bold text-xl text-red-700'>
                <span>CanCitizen</span>
                <span className='font-light text-gray-600'>Test</span>
              </div>
            </div>
            <nav className='flex gap-6 text-gray-700 items-center'>
              <a href='#' className='hover:text-red-700 transition-colors'>About</a>
              <Link href='/quiz' className='hover:text-red-700 transition-colors'>Practice Tests</Link>
              <a href='#' className='hover:text-red-700 transition-colors'>Study Guide</a>
              
              <SignedIn>
                <Link href='/admin' className='hover:text-red-700 transition-colors'>Admin</Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              
              <SignedOut>
                <Link href='/sign-in' className='hover:text-red-700 transition-colors'>Sign In</Link>
                <Link href='/sign-up' className='bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center tracking-tight transition-colors'>
                  Sign Up
                </Link>
              </SignedOut>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

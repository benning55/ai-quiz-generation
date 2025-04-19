import { motion } from "framer-motion"

export const Footer = () => {
  return (
    <footer className='bg-gray-50 text-gray-600 py-10'>
      <div className='container'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          <div className='flex items-center gap-2'>
            <motion.img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg"
              alt='Canadian Flag'
              height={30}
              width={30}
            />
            <div className='font-bold text-lg text-red-700'>
              <span>CanCitizen</span>
              <span className='font-light text-gray-600'>Test</span>
            </div>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <a href='#' className='hover:text-red-700 transition-colors'>About</a>
            <a href='#' className='hover:text-red-700 transition-colors'>Practice Tests</a>
            <a href='#' className='hover:text-red-700 transition-colors'>Study Guide</a>
            <a href='#' className='hover:text-red-700 transition-colors'>Contact</a>
            <a href='#' className='hover:text-red-700 transition-colors'>Privacy Policy</a>
          </nav>
          
          <div className='flex gap-4'>
            <a href='#' aria-label='Facebook' className='text-gray-400 hover:text-red-700 transition-colors'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href='#' aria-label='Twitter' className='text-gray-400 hover:text-red-700 transition-colors'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href='#' aria-label='Instagram' className='text-gray-400 hover:text-red-700 transition-colors'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
        <div className='mt-8 text-center text-sm'>
          &copy; {new Date().getFullYear()} CanCitizenTest. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

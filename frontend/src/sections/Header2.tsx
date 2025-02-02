import ArrowRight from "@/assets/arrow-right.svg"
import Logo from "@/assets/logosaas.png"
import Image from "next/image"
import MenuIcon from "@/assets/menu.svg"
import { motion } from "framer-motion"

export const Header2 = () => {
  return (
    <header className='sticky top-0 backdrop-blur-sm z-20'>
      <div className='py-5'>
        <div className='container'>
          <div className='flex items-center justify-between'>
            <motion.img
              src={Logo.src}
              alt='Sass Logo' height={40} width={40}
            />
            {/* <MenuIcon className='h-5 w-5 md:hidden' /> */}
            <nav className='flex gap-6 text-black/60 items-center'>
              {/* <a href='#'>About</a>
              <a href='#'>Features</a>
              <a href='#'>Customer</a>
              <a href='#'>Updates</a>
              <a href='#'>Help</a> */}
              {/* <button className='bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center tracking-tight'>
                Get for free
              </button> */}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

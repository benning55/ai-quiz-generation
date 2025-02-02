import logo from "@/assets/logosaas.png"
import Image from "next/image";
import SocialX from "@/assets/social-x.svg"
import SocialInsta from "@/assets/social-insta.svg"
import SocialInkedIn from "@/assets/social-linkedin.svg"
import SocialPin from "@/assets/social-pin.svg"
import SocialYouTube from "@/assets/social-youtube.svg"
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className='bg-black text-[#BCBCBC] text-sm py-10 text-center'>
      <div className='container'>
        <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:absolute">
          <motion.img src={logo.src} alt='Sass Logo' height={40} width={40} />
        </div>
        {/* <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
          <a href='#'>About</a>
          <a href='#'>Features</a>
          <a href='#'>Customers</a>
          <a href='#'>Pricing</a>
          <a href='#'>Help</a>
          <a href='#'>Careers</a>
        </nav> */}
        {/* <div className="flex justify-center gap-6 mt-6">
          <SocialX />
          <SocialInsta />
          <SocialInkedIn />
          <SocialPin />
          <SocialYouTube />
        </div> */}
        <p className='mt-6'>
          &copy; 2025 Save Boost, All rights reserved.
        </p>
      </div>
    </footer>
  )
};

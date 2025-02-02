"use client"
import { Rocket, ShieldCheck, Target } from "lucide-react"
import { motion } from "framer-motion"
import financialGrowth from "@/assets/growth.png"

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      type: "spring",
      stiffness: 80,
    },
  },
}

export const Hero2 = () => {
  const scrollToNextSection = () => {
    const nextSection = document.querySelector("#featureDiscovery")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className='pt-8 pb-20 md:pt-5 md:pb-20 bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#7832FE,#EFF6FF_100%)] overflow-x-clip'>
      <div className='container'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={heroVariants}
          className='md:flex items-center gap-12'
        >
          <div className='md:w-[600px] space-y-6'>
            <motion.h1
              variants={itemVariants}
              className='text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text'
            >
              SaveBoost: AI-Powered Savings to Build Your Wealth
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className='text-xl text-[#010D3E] opacity-80'
            >
              Your savings account is divided into 3 strategic buckets!
            </motion.p>

            <motion.ul variants={itemVariants} className='space-y-4'>
              {[
                {
                  icon: Rocket,
                  title: "Rainy Day Fund",
                  description:
                    "Cover unexpected events. Car breakdown? We've got you covered for repair costs!",
                },
                {
                  icon: ShieldCheck,
                  title: "Stock Fund",
                  description: "Choose the Company you Love. Save to Buy it!",
                },
                {
                  icon: Target,
                  title: "Future Fund",
                  description:
                    "Dreaming of a car, travel, or a new home? Let's make it happen!",
                },
              ].map((bucket, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className='flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all'
                >
                  <bucket.icon className='h-8 w-8 text-blue-600 flex-shrink-0 mt-1' />
                  <div>
                    <h3 className='font-bold text-lg text-[#010D3E]'>
                      {bucket.title}
                    </h3>
                    <p className='text-[#010D3E]/70'>{bucket.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={itemVariants} className='flex space-x-4 mt-6'>
              <button
                onClick={scrollToNextSection}
                className='px-6 py-3 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg'
                style={{ background: "#00030f" }}
              >
                Explore Boost
              </button>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className='mt-12 md:mt-0 flex-1 relative'
          >
            <motion.img
              src={financialGrowth.src}
              alt='Financial Growth Visualization'
              className='w-full h-auto rounded-2xl shadow-2xl'
              animate={{
                translateY: [-20, 20],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 4,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

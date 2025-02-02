import {
  Banknote,
  BarChart,
  DollarSign,
  CreditCard,
  PieChart,
  Wallet,
} from "lucide-react"
import { motion } from "framer-motion"

export const LogoTicker2 = () => {
  return (
    <div className='py-8 md:py-12 bg-white'>
      <div className='container'>
        <div className='flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]'>
          <motion.div
            className='flex gap-14 flex-none pr-14'
            animate={{
              translateX: "-50%",
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
          >
            <Banknote className='logo-ticker-icon' />
            <BarChart className='logo-ticker-icon' />
            <DollarSign className='logo-ticker-icon' />
            <CreditCard className='logo-ticker-icon' />
            <PieChart className='logo-ticker-icon' />
            <Wallet className='logo-ticker-icon' />

            {/* second set of icons */}
            <Banknote className='logo-ticker-icon' />
            <BarChart className='logo-ticker-icon' />
            <DollarSign className='logo-ticker-icon' />
            <CreditCard className='logo-ticker-icon' />
            <PieChart className='logo-ticker-icon' />
            <Wallet className='logo-ticker-icon' />

            {/* third set of icons */}
            <Banknote className='logo-ticker-icon' />
            <BarChart className='logo-ticker-icon' />
            <DollarSign className='logo-ticker-icon' />
            <CreditCard className='logo-ticker-icon' />
            <PieChart className='logo-ticker-icon' />
            <Wallet className='logo-ticker-icon' />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

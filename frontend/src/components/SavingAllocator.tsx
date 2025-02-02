import React, { useState } from "react"
import { motion, Variants } from "framer-motion"
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  RefreshCcw,
  AlertCircle,
} from "lucide-react"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
}

type AccountType = "Rainy Day" | "Invest" | "Future Fund"

interface Allocations {
  [key: string]: number
}

const SavingsAllocator: React.FC = () => {
  const [payrollBalance, setPayrollBalance] = useState<number>(5000)
  const [savingsAmount, setSavingsAmount] = useState<number>(1000)
  const [allocations, setAllocations] = useState<Allocations>({
    "Rainy Day": 0.3,
    Invest: 0.4,
    "Future Fund": 0.3,
  })
  const [accountBalances, setAccountBalances] = useState<Allocations>({
    "Rainy Day": 0,
    Invest: 0,
    "Future Fund": 0,
  })
  const [error, setError] = useState<string>("")

  const distributeSavings = () => {
    setError("")

    if (savingsAmount > payrollBalance) {
      setError("Insufficient funds! Savings amount exceeds payroll balance.")
      return
    }

    const newPayrollBalance = payrollBalance - savingsAmount
    setPayrollBalance(newPayrollBalance)

    const newAccountBalances = { ...accountBalances }
    Object.keys(allocations).forEach((account) => {
      const depositAmount = savingsAmount * allocations[account]
      newAccountBalances[account] += depositAmount
    })

    setAccountBalances(newAccountBalances)
  }

  const updateAllocation = (account: AccountType, percentage: string) => {
    const newAllocations = { ...allocations }
    newAllocations[account] = parseFloat(percentage)

    const totalAllocation = Object.values(newAllocations).reduce(
      (a, b) => a + b,
      0
    )
    if (totalAllocation !== 1) {
      setError("Total allocation must equal 100%")
      return
    }

    setAllocations(newAllocations)
    setError("")
  }

  const renderAccountIcon = (account: AccountType) => {
    const iconProps = { className: "text-blue-600" }
    switch (account) {
      case "Rainy Day":
        return <PiggyBank {...iconProps} />
      case "Invest":
        return <TrendingUp {...iconProps} />
      case "Future Fund":
        return <Wallet {...iconProps} />
    }
  }

  return (
    <div>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className='max-w-2xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8'
      >
        <motion.div
          variants={itemVariants}
          className='flex items-center mb-6 space-x-4'
        >
          <Wallet className='h-8 w-8 text-blue-600' />
          <h2 className='text-2xl md:text-3xl font-bold text-[#010D3E]'>
            SaveBoost Savings Allocator
          </h2>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-50 border border-red-200 p-3 rounded-lg mb-4 flex items-center space-x-3'
          >
            <AlertCircle className='text-red-500 h-6 w-6' />
            <p className='text-red-700'>{error}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className='space-y-4'>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-[#010D3E]'>
                Payroll Balance
              </label>
              <div className='flex items-center space-x-2'>
                <input
                  type='number'
                  value={payrollBalance}
                  onChange={(e) => setPayrollBalance(Number(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 transition-all'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-[#010D3E]'>
                Monthly Savings
              </label>
              <div className='flex items-center space-x-2'>
                <input
                  type='number'
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(Number(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 transition-all'
                />
                <button
                  onClick={distributeSavings}
                  className='bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <RefreshCcw className='h-5 w-5' />
                </button>
              </div>
            </div>
          </div>

          <div className='space-y-4 mt-6'>
            {(Object.keys(allocations) as AccountType[]).map((account) => (
              <motion.div
                key={account}
                variants={itemVariants}
                className='flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 p-4 bg-blue-50/50 rounded-xl'
              >
                <div className='flex items-center space-x-3'>
                  {renderAccountIcon(account)}
                  <span className='font-medium text-[#010D3E]'>{account}</span>
                </div>
                <div className='flex items-center space-x-4'>
                  <input
                    type='number'
                    step='0.1'
                    min='0'
                    max='1'
                    value={allocations[account]}
                    onChange={(e) => updateAllocation(account, e.target.value)}
                    className='w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50'
                  />
                  <span className='text-[#010D3E]/70'>
                    Balance: ${accountBalances[account].toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SavingsAllocator

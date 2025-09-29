"use client"

import { motion } from "framer-motion"
import { Header } from "@/sections/Header"
import { PaymentButton } from "@/components/PaymentButton"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PaymentPlanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Link href="/quiz">
              <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4" />
                Back to Quiz
              </Button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 text-blue-600 mb-4">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl font-bold text-gray-800">Choose Your Plan</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock unlimited practice tests and advanced features to ace your Canadian citizenship test
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
          >
            <PaymentButton />
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">What You Will Get</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Unlimited Practice Tests</h3>
                <p className="text-gray-600 text-sm">Take as many practice tests as you need with 20 questions each</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Detailed Analytics</h3>
                <p className="text-gray-600 text-sm">Track your progress and identify areas for improvement</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Instant Results</h3>
                <p className="text-gray-600 text-sm">Get immediate feedback with detailed explanations</p>
              </div>
            </div>
          </motion.div>

          {/* Money Back Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <span className="text-2xl">🛡️</span>
                <span className="font-semibold">Money-Back Guarantee</span>
              </div>
              <p className="text-gray-600">
                Not satisfied? Get a full refund within 7 days, no questions asked.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
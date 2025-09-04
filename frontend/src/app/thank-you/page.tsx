"use client"

import { Header } from "@/sections/Header";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  useEffect(() => {
    // Check URL parameters for payment status
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('payment_success') || urlParams.get('payment_canceled');
    setPaymentStatus(status || 'success');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleStartQuiz = () => {
    router.push('/quiz');
  };

  const isSuccess = paymentStatus === 'true' || paymentStatus === 'success';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto text-center"
          >
            {/* Success/Error Icon */}
            <motion.div 
              variants={itemVariants}
              className="mb-8"
            >
              {isSuccess ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.5 
                  }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <svg 
                    className="w-12 h-12 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.5 
                  }}
                  className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <svg 
                    className="w-12 h-12 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </motion.div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              {isSuccess ? (
                <>
                  <span className="text-green-600">Payment Successful!</span>
                  <br />
                  <span className="text-gray-800">Welcome to Premium</span>
                </>
              ) : (
                <>
                  <span className="text-red-600">Payment Cancelled</span>
                  <br />
                  <span className="text-gray-800">No Problem</span>
                </>
              )}
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8 max-w-lg mx-auto"
            >
              {isSuccess ? (
                <>
                  Thank you for your purchase! Your premium membership is now active. 
                  You can now access all our premium features and unlimited practice tests.
                </>
              ) : (
                <>
                  Your payment was cancelled. No charges have been made to your account. 
                  You can try again anytime or continue with our free features.
                </>
              )}
            </motion.p>

            {/* Canadian Theme Elements */}
            <motion.div 
              variants={itemVariants}
              className="flex justify-center items-center mb-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center space-x-2"
              >
                <Image 
                  src="/images/maple-leaf.svg" 
                  width={32} 
                  height={32} 
                  alt="Maple Leaf" 
                  className="text-red-600"
                />
                <span className="text-lg font-semibold text-red-600">
                  {isSuccess ? "Ready to Study!" : "Keep Learning!"}
                </span>
                <Image 
                  src="/images/maple-leaf.svg" 
                  width={32} 
                  height={32} 
                  alt="Maple Leaf" 
                  className="text-red-600"
                />
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-md text-lg shadow-xl"
                  onClick={handleStartQuiz}
                >
                  {isSuccess ? "Start Premium Quiz" : "Try Free Quiz"}
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-4 rounded-md text-lg border-2 border-gray-300 hover:bg-gray-50"
                  onClick={handleGoHome}
                >
                  Back to Homepage
                </Button>
              </motion.div>
            </motion.div>

            {/* Additional Info for Success */}
            {isSuccess && (
              <motion.div 
                variants={itemVariants}
                className="mt-12 bg-gradient-to-br from-red-50 to-white p-8 rounded-xl shadow-lg border border-red-100"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  What is Next?
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Unlimited Access</h4>
                      <p className="text-gray-600 text-sm">Take as many practice tests as you need</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Advanced Analytics</h4>
                      <p className="text-gray-600 text-sm">Track your progress and weak areas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Study Materials</h4>
                      <p className="text-gray-600 text-sm">Access comprehensive study guides</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Support Info */}
            <motion.div 
              variants={itemVariants}
              className="mt-8 text-center"
            >
              <p className="text-gray-500 text-sm">
                Need help? Contact our support team at{" "}
                <a 
                  href="mailto:support@cancitizentest.com" 
                  className="text-red-600 hover:text-red-700 underline"
                >
                  support@cancitizentest.com
                </a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
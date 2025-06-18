"use client"

import { Header } from "@/sections/Header"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export default function StudyGuide() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const studyTopics = [
    {
      title: "Canadian History",
      description: "Learn about Canada's history from Indigenous peoples to modern times",
      icon: "📜",
      color: "bg-red-50"
    },
    {
      title: "Government & Politics",
      description: "Understand Canada's political system and democratic institutions",
      icon: "🏛️",
      color: "bg-blue-50"
    },
    {
      title: "Rights & Responsibilities",
      description: "Know your rights and responsibilities as a Canadian citizen",
      icon: "⚖️",
      color: "bg-green-50"
    },
    {
      title: "Geography & Symbols",
      description: "Explore Canada's geography, regions, and national symbols",
      icon: "🗺️",
      color: "bg-yellow-50"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 py-20 md:py-28 overflow-hidden"
        >
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl mx-auto text-center text-white"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Comprehensive Study Guide
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-xl mb-8 text-white/90"
              >
                Everything you need to know to pass your Canadian citizenship test
              </motion.p>
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap gap-4 justify-center"
              >
                <Link href="/quiz">
                  <Button size="lg" className="bg-white text-red-700 hover:bg-yellow-50 hover:text-red-800 transition-all duration-300 shadow-lg">
                    Start Practice Test
                  </Button>
                </Link>
                <SignedOut>
                  <Link href="/sign-up">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-white text-white hover:bg-white/20 hover:text-white transition-all duration-300"
                    >
                      Create Free Account
                    </Button>
                  </Link>
                </SignedOut>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Study Topics */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="py-20 bg-white"
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold text-center mb-16"
            >
              Study Topics
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {studyTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className={`${topic.color} p-6 rounded-xl shadow-lg border border-gray-100`}
                >
                  <div className="text-4xl mb-4">{topic.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                  <p className="text-gray-600">{topic.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Test Format */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="py-20 bg-gray-50"
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold text-center mb-16"
            >
              Test Format & Requirements
            </motion.h2>
            
            <div className="max-w-3xl mx-auto">
              <motion.div 
                variants={itemVariants}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-semibold mb-4">Test Details</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>20 multiple-choice questions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>30 minutes to complete the test</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Must answer 15 questions correctly to pass (75%)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Questions are based on the official study guide</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Available in English or French</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Study Tips */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="py-20 bg-white"
        >
          <div className="container mx-auto px-4">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold text-center mb-16"
            >
              Study Tips
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                variants={itemVariants}
                className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-semibold mb-4">1. Start Early</h3>
                <p className="text-gray-600">Begin studying well in advance of your test date. This gives you time to understand all the material thoroughly.</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-semibold mb-4">2. Use Practice Tests</h3>
                <p className="text-gray-600">Take advantage of our AI-powered practice tests to identify areas where you need more study.</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-semibold mb-4">3. Focus on Weak Areas</h3>
                <p className="text-gray-600">Pay special attention to topics where you make mistakes in practice tests.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 bg-gradient-to-r from-red-600 to-red-800"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-6"
            >
              Ready to Start Practicing?
            </motion.h2>
            
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/quiz">
                <Button size="lg" className="bg-white text-red-700 hover:bg-yellow-50 hover:text-red-800 transition-all duration-300 shadow-lg">
                  Start Practice Test
                </Button>
              </Link>
              <SignedOut>
                <Link href="/sign-up">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white/20 hover:text-white transition-all duration-300"
                  >
                    Create Free Account
                  </Button>
                </Link>
              </SignedOut>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  )
} 
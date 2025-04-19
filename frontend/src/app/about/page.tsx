"use client"

import { Header } from "@/sections/Header"
import { motion } from "framer-motion"
import { Brain, BookOpen, Shield, Users, Target, Award } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Our questions are generated using advanced AI to ensure they cover all important aspects of the Canadian citizenship test."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Comprehensive Coverage",
      description: "Questions cover all key areas: Canadian history, geography, government, rights and responsibilities, and cultural knowledge."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Official Test Preparation",
      description: "Prepare for the official citizenship test with questions that match the format and difficulty of the real exam."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Learning",
      description: "Join a community of future Canadians preparing for their citizenship journey together."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Track your progress and identify areas that need more study with our detailed performance analytics."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Achievement System",
      description: "Earn badges and achievements as you progress through different topics and difficulty levels."
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white">
        <div className="max-w-4xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4">About Canadian Citizenship Test Practice</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your comprehensive platform for preparing for the Canadian citizenship test. 
              We help future Canadians master the knowledge needed to pass their citizenship test with confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-red-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We believe that becoming a Canadian citizen is a significant milestone in one&apos;s life. 
              Our mission is to make the preparation process as smooth and effective as possible by providing:
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                High-quality, AI-generated practice questions that cover all aspects of the citizenship test
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                A user-friendly platform that makes learning engaging and effective
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                Detailed explanations and feedback to help you understand and remember the material
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                Progress tracking to help you identify areas that need more focus
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </>
  )
} 
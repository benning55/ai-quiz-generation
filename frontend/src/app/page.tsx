"use client"

import { Header } from "@/sections/Header";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

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

  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const handleStartNewQuiz = () => {
    router.push('/quiz');
  };

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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 bg-[url('/images/canadian-map-pattern.svg')] bg-repeat"
          ></motion.div>
          
          {/* Abstract shapes */}
          <motion.div 
            animate={{ 
              x: [0, 10, 0],
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            className="absolute top-20 right-[20%] w-64 h-64 bg-yellow-500 rounded-full blur-[120px] opacity-20 mix-blend-soft-light"
          ></motion.div>
          
          <motion.div 
            animate={{ 
              x: [0, -15, 0],
              y: [0, 15, 0],
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            className="absolute bottom-10 left-[10%] w-80 h-80 bg-blue-500 rounded-full blur-[150px] opacity-20 mix-blend-soft-light"
          ></motion.div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-16">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="md:w-1/2 text-white"
              >
                <motion.div 
                  variants={itemVariants} 
                  className="flex items-center mb-6 space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full w-fit"
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="text-white text-sm font-medium">12,000+ successful citizenship tests</span>
                </motion.div>
                
                <motion.h1 
                  variants={itemVariants}
                  className="text-5xl md:text-6xl font-bold mb-8 leading-tight"
                >
                  <span className="block">Master the</span>
                  <motion.span 
                    className="relative inline-block"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Canadian <span className="text-yellow-300">Citizenship</span>
                  </motion.span>
                  <span className="block mt-2">Test in 
                    <motion.span 
                      className="inline-flex items-center mx-2"
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      <Image src="/images/maple-leaf.svg" width={40} height={40} alt="Maple Leaf" className="mx-2" />
                    </motion.span>
                    minutes
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-xl mb-8 text-white/90 max-w-lg"
                >
                  Study smarter with AI-powered quizzes that adapt to your learning. Prepare effectively and pass your citizenship test with confidence.
                </motion.p>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex flex-wrap gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/quiz">
                      <Button size="lg" className="bg-white text-red-700 hover:bg-yellow-50 hover:text-red-800 transition-all duration-300 shadow-lg">
                        Start Practice Test →
                      </Button>
                    </Link>
                  </motion.div>
                  
                  <SignedOut>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/sign-up">
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 hover:text-white transition-all duration-300 shadow-lg"
                        >
                          Create Free Account
                        </Button>
                      </Link>
                    </motion.div>
                  </SignedOut>
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="md:w-5/12 relative"
              >
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="bg-white rounded-xl shadow-2xl p-6 relative z-10 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-white opacity-80 z-0"></div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="relative z-10"
                  >
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-sm font-medium text-gray-600">Question 1/10</div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">What is the capital city of Canada?</h3>
                        <div className="space-y-3">
                          <div className="p-3 border border-gray-200 rounded-lg hover:bg-red-50 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                              <span>Toronto</span>
                            </div>
                          </div>
                          <div className="p-3 border border-gray-200 rounded-lg hover:bg-red-50 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                              <span>Montreal</span>
                            </div>
                          </div>
                          <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-5 h-5 border-2 border-red-500 rounded-full mr-3 flex items-center justify-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                              <span className="text-red-600">Ottawa</span>
                            </div>
                          </div>
                          <div className="p-3 border border-gray-200 rounded-lg hover:bg-red-50 cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                              <span>Vancouver</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">Time remaining: 1:45</div>
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="absolute top-4 right-4 bg-yellow-400 text-red-800 font-bold py-2 px-4 rounded-md shadow-lg transform -rotate-2 z-20"
                  >
                    More access with free account!
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-1/4 right-1/4 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-20"
                ></motion.div>
                
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{ duration: 5, delay: 1, repeat: Infinity }}
                  className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>
        
        {/* Features Section */}
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
              Why CanCitizenTest Is Your <span className="text-red-600">Best Study Companion</span>
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                variants={featureVariants}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl shadow-lg border border-red-100"
              >
                <div className="mb-6 bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Learning</h3>
                <p className="text-gray-600">Our intelligent system creates personalized quizzes based on the latest citizenship test materials.</p>
              </motion.div>
              
              <motion.div 
                variants={featureVariants}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl shadow-lg border border-red-100"
              >
                <div className="mb-6 bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Real Test Simulation</h3>
                <p className="text-gray-600">Practice with questions formatted exactly like the actual citizenship test to build confidence.</p>
              </motion.div>
              
              <motion.div 
                variants={featureVariants}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl shadow-lg border border-red-100"
              >
                <div className="mb-6 bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Track Your Progress</h3>
                <p className="text-gray-600">Monitor your improvement over time with detailed analytics and focus on areas that need more attention.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>
        
        {/* Call to Action */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 bg-gradient-to-br from-gray-50 to-gray-100"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold mb-6"
            >
              Ready to Become a Canadian Citizen?
            </motion.h2>
            
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto"
            >
              Join thousands of successful applicants who prepared with our platform.
              Create your free account today and start your journey to Canadian citizenship!
            </motion.p>
            
            <SignedIn>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-red-700 hover:bg-red-800 text-white px-10 py-6 rounded-md text-lg shadow-xl"
                  onClick={handleStartNewQuiz}
                >
                  Start Practicing Now →
                </Button>
              </motion.div>
            </SignedIn>
            
            <SignedOut>
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-6 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-red-700 hover:bg-red-800 text-white px-10 py-6 rounded-md text-lg shadow-xl">
                      Create Free Account
                    </Button>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/quiz">
                    <Button variant="outline" size="lg" className="px-10 py-6 rounded-md text-lg border-2 hover:bg-gray-50">
                      Try Demo Quiz
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </SignedOut>
          </div>
        </motion.section>
        
        {/* Testimonials */}
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
              Success Stories
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-xl mr-4">
                    JD
                  </div>
                  <div>
                    <h3 className="font-semibold">John Doe</h3>
                    <p className="text-sm text-gray-500">New Canadian Citizen</p>
                  </div>
                </div>
                <p className="text-gray-600">&quot;This platform was instrumental in my preparation. The practice questions were very similar to the actual test. I passed on my first attempt!&quot;</p>
                
                <div className="mt-6 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-xl mr-4">
                    SM
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah Miller</h3>
                    <p className="text-sm text-gray-500">Permanent Resident</p>
                  </div>
                </div>
                <p className="text-gray-600">&quot;The AI quizzes adapted to my weak areas and helped me focus on what I needed to learn most. The interface is intuitive and makes studying enjoyable.&quot;</p>
                
                <div className="mt-6 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-xl mr-4">
                    RK
                  </div>
                  <div>
                    <h3 className="font-semibold">Raj Kumar</h3>
                    <p className="text-sm text-gray-500">New Canadian Citizen</p>
                  </div>
                </div>
                <p className="text-gray-600">&quot;I was nervous about the test, but after completing over 20 practice quizzes on this platform, I felt confident and well-prepared. Highly recommended!&quot;</p>
                
                <div className="mt-6 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
      
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white py-20"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-8 md:mb-0"
            >
              <h2 className="text-2xl font-bold flex items-center">
                <span className="text-red-500">Can</span>CitizenTest
                <Image src="/images/maple-leaf.svg" width={24} height={24} alt="Maple Leaf" className="ml-2" />
              </h2>
              <p className="text-gray-400 mt-2">Your path to Canadian citizenship</p>
            </motion.div>
            
            <div className="flex flex-wrap gap-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <motion.li whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/quiz" className="text-gray-400 hover:text-white">Practice Tests</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/study-guide" className="text-gray-400 hover:text-white">Study Guide</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/about" className="text-gray-400 hover:text-white">About Us</Link>
                  </motion.li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-3">
                  <motion.li whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <a href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/citizenship-test.html" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Official Citizenship Info</a>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/faqs" className="text-gray-400 hover:text-white">FAQs</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link>
                  </motion.li>
                </ul>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm"
          >
            <p>© {new Date().getFullYear()} CanCitizenTest. All rights reserved.</p>
            <p className="mt-2">Not affiliated with the Government of Canada.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { Header } from '@/sections/Header'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { User, Shield, Crown, CreditCard, CheckCircle, XCircle } from "lucide-react"
import Link from 'next/link'
import { SignedIn, SignedOut } from "@clerk/nextjs"

export default function DemoPage() {
  const { userData, setUserData, isAdmin, isLoading } = useAuth()
  const [showLocalStorage, setShowLocalStorage] = useState(false)

  const togglePaymentStatus = () => {
    if (userData) {
      const updatedUserData = {
        ...userData,
        has_active_payment: !userData.has_active_payment
      }
      setUserData(updatedUserData)
    }
  }

  const getLocalStorageData = () => {
    try {
      const data = localStorage.getItem('userData')
      return data ? JSON.parse(data) : null
    } catch (error) {
      return null
    }
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('userData')
    window.location.reload()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <User className="w-10 h-10 text-blue-600" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Auth System Demo
              </h1>
              
              <p className="text-gray-600 text-lg">
                Test the authentication system, user data management, and admin features
              </p>
            </div>

            {/* Auth Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Authentication Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SignedIn>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Signed In</span>
                        </div>
                        
                        {userData && (
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h3 className="font-semibold text-gray-800">User Data:</h3>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Email:</span> {userData.email}</p>
                              <p><span className="font-medium">User ID:</span> {userData.userId}</p>
                              <p><span className="font-medium">Payment Status:</span> 
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                  userData.has_active_payment 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {userData.has_active_payment ? 'Active' : 'Inactive'}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <Button
                          onClick={togglePaymentStatus}
                          variant="outline"
                          className="w-full"
                        >
                          Toggle Payment Status
                        </Button>
                      </div>
                    </SignedIn>
                    
                    <SignedOut>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-5 h-5" />
                          <span className="font-medium">Not Signed In</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Sign in to see user data and test features
                        </p>
                        <Link href="/sign-in" className="block">
                          <Button className="w-full bg-red-600 hover:bg-red-700">
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    </SignedOut>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      Admin Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Loading...</p>
                      </div>
                    ) : isAdmin ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Admin Access</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          You have admin privileges. Check the navbar for the Admin menu.
                        </p>
                        <Link href="/admin" className="block">
                          <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                            Go to Admin Panel
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <XCircle className="w-5 h-5" />
                          <span className="font-medium">Regular User</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          You don&apos;t have admin privileges. Only users with emails in the admin list can access admin features.
                        </p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-blue-800 text-sm">
                            <strong>Admin emails:</strong> bmaisonti@gmail.com
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Payment Test */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Payment Status Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Test how the payment status affects the quiz page access. Toggle the payment status above and then visit the quiz page.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/quiz" className="block">
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Test Quiz Page
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={() => setShowLocalStorage(!showLocalStorage)}
                      variant="outline"
                      className="w-full"
                    >
                      {showLocalStorage ? 'Hide' : 'Show'} localStorage Data
                    </Button>
                  </div>
                  
                  {showLocalStorage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">localStorage Data:</h3>
                      <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                        {JSON.stringify(getLocalStorageData(), null, 2)}
                      </pre>
                      <Button
                        onClick={clearLocalStorage}
                        variant="outline"
                        size="sm"
                        className="mt-3"
                      >
                        Clear localStorage
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Features Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">System Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Authentication</h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Clerk integration for user management</li>
                        <li>• Custom AuthContext with localStorage sync</li>
                        <li>• Automatic user data persistence</li>
                        <li>• Loading states and error handling</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Admin System</h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Admin email list: [&apos;bmaisonti@gmail.com&apos;]</li>
                        <li>• Conditional admin menu in navbar</li>
                        <li>• Admin-only page access</li>
                        <li>• User data management tools</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Payment System</h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• has_active_payment status tracking</li>
                        <li>• Conditional quiz access based on payment</li>
                        <li>• Payment status toggle for testing</li>
                        <li>• Paywall for non-paying users</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Data Management</h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• React Context for state management</li>
                        <li>• localStorage persistence</li>
                        <li>• useAuth hook for easy access</li>
                        <li>• Automatic data synchronization</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 
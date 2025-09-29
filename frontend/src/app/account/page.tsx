"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/sections/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useAuth as useClerkAuth } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  User, 
  Crown, 
  Calendar, 
  CreditCard, 
  Trophy, 
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Sparkles,
  TrendingUp,
  Award,
  RefreshCcw
} from "lucide-react"
import Link from 'next/link'
import { getUserAccessLevel, getSubscriptionStatus, getSubscriptionTierName } from '@/lib/userAccess'
import { useRouter } from 'next/navigation'

type QuizStats = {
  totalQuizzes: number
  averageScore: number
  bestScore: number
  totalQuestions: number
  correctAnswers: number
  studyStreak: number
  favoriteChapter: string
}

export default function AccountPage() {
  const router = useRouter()
  const { userData, isLoading: authLoading } = useAuth()
  const { userId, signOut, getToken } = useClerkAuth()
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    studyStreak: 0,
    favoriteChapter: 'Not available'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const accessLevel = getUserAccessLevel(userData, !!userId)
  const subscriptionStatus = getSubscriptionStatus(userData)

  // Redirect non-signed in users
  useEffect(() => {
    if (!authLoading && !userId) {
      router.push('/sign-in')
    }
  }, [authLoading, userId, router])

  // Fetch real quiz stats from backend API
  useEffect(() => {
    const loadQuizStats = async () => {
      if (!userId) return
      
      try {
        // Get Clerk token for authorization
        const token = await getToken()
        
        if (!token) {
          setIsLoading(false)
          return
        }

        // Fetch user stats from backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
        const response = await fetch(`${API_URL}/api/user/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const stats = await response.json()
          
          setQuizStats({
            totalQuizzes: stats.total_quizzes || 0,
            averageScore: stats.average_score || 0,
            bestScore: stats.best_score || 0,
            totalQuestions: stats.total_questions || 0,
            correctAnswers: stats.correct_answers || 0,
            studyStreak: stats.study_streak || 0,
            favoriteChapter: stats.favorite_chapter || 'Not available'
          })
        } else {
          console.error('Failed to fetch user stats:', response.status)
          // Use default values
          setQuizStats({
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            studyStreak: 0,
            favoriteChapter: 'Not available'
          })
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
        // Use default values on error
        setQuizStats({
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          studyStreak: 0,
          favoriteChapter: 'Not available'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadQuizStats()
    }
  }, [userId, refreshTrigger])

  // Function to refresh stats (can be called after completing a quiz)
  const refreshStats = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return 0
    try {
      const expiry = new Date(expiresAt)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    } catch {
      return 0
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              {accessLevel === 'paid' ? (
                <Crown className="w-10 h-10 text-red-600" />
              ) : (
                <User className="w-10 h-10 text-red-600" />
              )}
            </motion.div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {accessLevel === 'paid' ? 'Premium Account' : 'My Account'}
            </h1>
            
            <p className="text-gray-600 text-lg">
              Welcome back, {userData?.email}
            </p>
          </div>

          {/* Subscription Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className={`border-2 ${
              accessLevel === 'paid' 
                ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                : 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {accessLevel === 'paid' ? (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Crown className="w-6 h-6 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-yellow-600" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className={`text-xl font-bold ${
                        accessLevel === 'paid' ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {accessLevel === 'paid' 
                          ? getSubscriptionTierName(userData?.member_tier)
                          : 'Free Account'
                        }
                      </h3>
                      <p className={`text-sm ${
                        accessLevel === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {subscriptionStatus.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {accessLevel === 'paid' && userData?.expires_at && (
                      <div>
                        <p className="text-sm text-gray-600">Expires in</p>
                        <p className="text-2xl font-bold text-green-600">
                          {getDaysRemaining(userData.expires_at)} days
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(userData.expires_at)}
                        </p>
                      </div>
                    )}
                    
                    {accessLevel !== 'paid' && (
                      <Link href="/payment-plan">
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Upgrade Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Details & Quiz Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Account Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{userData?.email}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Account Type</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        accessLevel === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {accessLevel === 'paid' ? 'Premium' : 'Free'}
                      </span>
                    </div>

                    {accessLevel === 'paid' && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Plan</span>
                          <span className="font-medium">
                            {userData?.member_tier === '7days' ? '$29 CAD (7 Days)' : '$39 CAD (1 Month)'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Status</span>
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Active</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 space-y-2">
                    <Link href="/quiz">
                      <Button variant="outline" className="w-full">
                        <Target className="w-4 h-4 mr-2" />
                        Take Practice Test
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      onClick={refreshStats}
                      className="w-full"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Refresh Stats
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quiz Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{quizStats.totalQuizzes}</div>
                      <div className="text-sm text-blue-600">Tests Taken</div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{quizStats.averageScore}%</div>
                      <div className="text-sm text-green-600">Average Score</div>
                    </div>
                    
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{quizStats.bestScore}%</div>
                      <div className="text-sm text-purple-600">Best Score</div>
                    </div>
                    
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{quizStats.studyStreak}</div>
                      <div className="text-sm text-orange-600">Day Streak</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Overall Accuracy</span>
                      <span className="text-sm font-medium">
                        {Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(quizStats.correctAnswers / quizStats.totalQuestions) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {quizStats.correctAnswers} correct out of {quizStats.totalQuestions} questions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Features Based on Access Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {accessLevel === 'paid' ? (
                    <Crown className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                  {accessLevel === 'paid' ? 'Premium Features' : 'Available Features'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accessLevel === 'paid' ? (
                    // Premium features
                    <>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-800">Unlimited Practice Tests</div>
                          <div className="text-sm text-green-600">Take as many tests as you want</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-800">Full 20-Question Tests</div>
                          <div className="text-sm text-green-600">Complete practice sessions</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-800">All 10 Study Chapters</div>
                          <div className="text-sm text-green-600">Complete citizenship curriculum</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-800">Detailed Progress Tracking</div>
                          <div className="text-sm text-green-600">Monitor your improvement</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-800">Priority Support</div>
                          <div className="text-sm text-green-600">Get help when you need it</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-800">No Ads</div>
                          <div className="text-sm text-green-600">Distraction-free studying</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Free features
                    <>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-blue-800">5 Free Practice Tests</div>
                          <div className="text-sm text-blue-600">Limited trial access</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-blue-800">3 Questions per Test</div>
                          <div className="text-sm text-blue-600">Sample quiz experience</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-600">Full 20-Question Tests</div>
                          <div className="text-sm text-gray-500">Upgrade to unlock</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-600">Unlimited Tests</div>
                          <div className="text-sm text-gray-500">Upgrade to unlock</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {accessLevel !== 'paid' && (
                  <div className="mt-6 text-center">
                    <Link href="/payment-plan">
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/quiz">
                    <Button variant="outline" className="w-full h-16 flex-col gap-2">
                      <Target className="w-6 h-6" />
                      <span>Take Practice Test</span>
                    </Button>
                  </Link>
                  
                  <Link href="/study-guide">
                    <Button variant="outline" className="w-full h-16 flex-col gap-2">
                      <Award className="w-6 h-6" />
                      <span>Study Guide</span>
                    </Button>
                  </Link>
                  
                  {accessLevel !== 'paid' && (
                    <Link href="/payment-plan">
                      <Button className="w-full h-16 flex-col gap-2 bg-red-600 hover:bg-red-700">
                        <TrendingUp className="w-6 h-6" />
                        <span>Upgrade Account</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}
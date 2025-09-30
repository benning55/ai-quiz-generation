"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/sections/Header'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Shield, Users, Settings, Activity, UserCheck, Crown, Upload, Check, AlertTriangle, Loader2, BookOpen, Database } from "lucide-react"
import Link from 'next/link'
import { API_ENDPOINTS } from '@/config/api'
import FlashcardManager from '@/components/admin/FlashcardManager'
import BulkImporter from '@/components/admin/BulkImporter'
import UserManager from '@/components/admin/UserManager'

export default function AdminPage() {
  const { userData, setUserData, isAdmin, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'flashcards' | 'users' | 'import'>('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeUsers: 890,
    totalQuizzes: 3450,
    averageScore: 78
  })
  const [chapters, setChapters] = useState([])
  const [jsonContent, setJsonContent] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ 
    success?: boolean; 
    message?: string;
    imported?: number; 
    skipped?: number;
    total?: number;
    error?: string;
  } | null>(null)

  // Load chapters
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/api/chapters/`)
        if (response.ok) {
          const data = await response.json()
          setChapters(data)
        } else {
          console.error('Failed to load chapters:', response.status)
        }
      } catch (error) {
        console.error('Error loading chapters:', error)
      }
    }
    loadChapters()
  }, [])

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      window.location.href = '/'
    }
  }, [isAdmin, isLoading])

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Not admin
  if (!isAdmin) {
    return null
  }

  const togglePaymentStatus = () => {
    if (userData) {
      const updatedUserData = {
        ...userData,
        has_active_payment: !userData.has_active_payment
      }
      setUserData(updatedUserData)
    }
  }

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setJsonContent(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (!jsonContent.trim()) {
      setResult({ error: "Please enter JSON content or upload a file" })
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      // Parse JSON to validate format
      const flashcardsData = JSON.parse(jsonContent)
      
      // Make API request
      const response = await fetch(API_ENDPOINTS.IMPORT_FLASHCARDS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcardsData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error uploading flashcards:', error)
      setResult({ error: error instanceof Error ? error.message : 'Failed to upload flashcards' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Crown className="w-10 h-10 text-red-600" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Admin Dashboard
              </h1>
              
              <p className="text-gray-600 text-lg">
                Welcome back, {userData?.email}. Manage your platform from here.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-1 flex">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Activity className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    activeTab === 'flashcards' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Flashcards
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    activeTab === 'users' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    activeTab === 'import' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Database className="w-4 h-4 inline mr-2" />
                  Bulk Import
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.activeUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.totalQuizzes}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Score</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.averageScore}%</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-red-600" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Current User</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {userData?.email}</p>
                        <p><span className="font-medium">User ID:</span> {userData?.userId}</p>
                        <p><span className="font-medium">Payment Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            userData?.has_active_payment 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {userData?.has_active_payment ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={togglePaymentStatus}
                      variant="outline"
                      className="w-full"
                    >
                      Toggle Payment Status
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/quiz" className="block">
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Test Quiz Page
                      </Button>
                    </Link>
                    
                    <Link href="/" className="block">
                      <Button variant="outline" className="w-full">
                        Back to Home
                      </Button>
                    </Link>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Admin Features</h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• View user statistics</li>
                        <li>• Manage user permissions</li>
                        <li>• Monitor quiz performance</li>
                        <li>• Access admin-only features</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Import New Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-red-600" />
                    Import New Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Upload JSON File
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="file:bg-red-700 file:text-white file:px-4 file:py-2 file:border-none file:rounded-lg cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Or Paste JSON Content
                    </label>
                    <textarea
                      value={jsonContent}
                      onChange={handleJsonChange}
                      rows={8}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                      placeholder='[{"question": "What is...?", "answer": "This is...", "tags": ["tag1"], "category": "category1"}]'
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isUploading || !jsonContent.trim()}
                    className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Import Questions
                      </>
                    )}
                  </Button>

                  {result && (
                    <div className={`p-4 rounded-lg mt-4 ${
                      result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      <div className="flex items-start gap-3">
                        {result.error ? (
                          <AlertTriangle className="mt-0.5" size={20} />
                        ) : (
                          <Check className="mt-0.5" size={20} />
                        )}
                        <div>
                          <p className="font-medium">
                            {result.error || result.message}
                          </p>
                          {!result.error && (
                            <ul className="mt-2 text-sm space-y-1">
                              <li>Total questions: {result.total}</li>
                              <li>Successfully imported: {result.imported}</li>
                              <li>Skipped (duplicates): {result.skipped}</li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <h3 className="font-medium text-gray-700 mb-2">Example JSON Format:</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
{`[
  {
    "question": "What is the capital of Canada?",
    "answer": "Ottawa",
    "tags": ["citizenship", "geography"],
    "category": "canadian_citizenship"
  },
  {
    "question": "What are the two official languages of Canada?",
    "answer": "English and French",
    "tags": ["citizenship", "language"],
    "category": "canadian_citizenship"
  }
]`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Admin Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-gradient-to-r from-red-50 to-white border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">Admin Access</h3>
          </div>
                  <p className="text-red-700">
                    You have administrative privileges because your email ({userData?.email}) is in the admin list. 
                    This gives you access to special features and user management capabilities.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
              </>
            )}

            {/* Flashcard Management Tab */}
            {activeTab === 'flashcards' && (
              <FlashcardManager />
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <UserManager />
            )}

            {/* Bulk Import Tab */}
            {activeTab === 'import' && (
              <BulkImporter 
                chapters={chapters} 
                onImportComplete={() => {
                  // Refresh data if needed
                  console.log('Import completed')
                }} 
              />
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
} 
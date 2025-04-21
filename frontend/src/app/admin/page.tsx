"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Upload, Check, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs"
import { Header } from "@/sections/Header"
import { API_ENDPOINTS } from '@/config/api'

export default function AdminPage() {
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
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
          <div className="max-w-3xl mx-auto pt-24 px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-700">Admin - Import Flashcards</CardTitle>
                  <CardDescription>
                    Upload JSON file or paste JSON content to import new flashcards
                  </CardDescription>
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
                        Import Flashcards
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
                              <li>Total flashcards: {result.total}</li>
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
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
} 
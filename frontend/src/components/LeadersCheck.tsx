"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, MapPin, Crown, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  question: string
  type: string
  options: string[]
  answer: string
  explanation: string
  province?: string
}

interface Province {
  code: string
  name: string
}

interface LeadersCheckProps {
  onComplete: () => void
  onSkip?: () => void
}

export default function LeadersCheck({ onComplete, onSkip }: LeadersCheckProps) {
  const [federalQuestions, setFederalQuestions] = useState<Question[]>([])
  const [provincialQuestion, setProvincialQuestion] = useState<Question | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string>("")
  
  const [currentStep, setCurrentStep] = useState<'federal' | 'province-select' | 'provincial'>('federal')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completedFederal, setCompletedFederal] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
        const response = await fetch(`${API_URL}/api/leaders-check`)
        const data = await response.json()
        
        setFederalQuestions(data.federal_leaders || [])
        setProvinces(data.provinces_territories || [])
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load leaders check:', error)
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Fetch provincial question when province is selected
  const fetchProvincialQuestion = async (provinceCode: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      const response = await fetch(`${API_URL}/api/leaders-check?province_code=${provinceCode}`)
      const data = await response.json()
      
      if (data.provincial_question) {
        setProvincialQuestion(data.provincial_question)
        setCurrentStep('provincial')
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
      }
    } catch (error) {
      console.error('Failed to load provincial question:', error)
    }
  }

  const handleAnswerSelect = (option: string) => {
    if (showResult) return
    setSelectedAnswer(option)
  }

  const handleSubmitAnswer = () => {
    const currentQuestion = currentStep === 'federal' 
      ? federalQuestions[currentQuestionIndex]
      : provincialQuestion

    if (!currentQuestion || !selectedAnswer) return

    const correct = selectedAnswer === currentQuestion.answer
    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentStep === 'federal') {
      if (currentQuestionIndex < federalQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        setCompletedFederal(true)
        setCurrentStep('province-select')
      }
    } else if (currentStep === 'provincial') {
      // All done!
      onComplete()
    }
  }

  const handleProvinceSelect = (provinceCode: string) => {
    setSelectedProvince(provinceCode)
    fetchProvincialQuestion(provinceCode)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Province selection screen
  if (currentStep === 'province-select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-800">Canadian Leaders Check</h1>
            </div>
            <p className="text-gray-600 text-lg mb-2">Great job on the federal questions! ✅</p>
            <p className="text-gray-700 font-medium">Now, let's test your knowledge of your local leader</p>
          </motion.div>

          <Card className="shadow-xl border-2 border-red-100">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-6 h-6 text-red-600" />
                Which province or territory do you live in?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {provinces.map((province) => (
                  <motion.button
                    key={province.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleProvinceSelect(province.code)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all text-left group"
                  >
                    <span className="font-semibold text-gray-800 group-hover:text-red-700">
                      {province.name}
                    </span>
                  </motion.button>
                ))}
              </div>
              
              {onSkip && (
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-gray-500"
                  >
                    Skip this section
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Question screen (federal or provincial)
  const currentQuestion = currentStep === 'federal' 
    ? federalQuestions[currentQuestionIndex]
    : provincialQuestion

  if (!currentQuestion) return null

  const totalQuestions = currentStep === 'federal' ? federalQuestions.length : 1
  const questionNumber = currentStep === 'federal' ? currentQuestionIndex + 1 : 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {currentStep === 'federal' ? (
              <>
                <Crown className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-800">Canadian Leaders Check</h1>
              </>
            ) : (
              <>
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">Your Provincial/Territorial Leader</h1>
              </>
            )}
          </div>
          <p className="text-gray-600">
            {currentStep === 'federal' 
              ? "Test your knowledge of Canada's current federal leaders"
              : `Question about ${currentQuestion.province}`
            }
          </p>
        </motion.div>

        <Card className="shadow-xl border-2 border-red-100">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Question {questionNumber} of {totalQuestions}
              </CardTitle>
              {completedFederal && currentStep === 'provincial' && (
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Federal: Complete
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option
                const isCorrectAnswer = option === currentQuestion.answer
                const showAsCorrect = showResult && isCorrectAnswer
                const showAsWrong = showResult && isSelected && !isCorrectAnswer

                return (
                  <motion.button
                    key={index}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                      showAsCorrect
                        ? 'bg-green-100 border-green-500'
                        : showAsWrong
                        ? 'bg-red-100 border-red-500'
                        : isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                      {showAsCorrect && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      {showAsWrong && (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-lg mb-4 ${
                    isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className={`font-semibold mb-1 ${
                        isCorrect ? 'text-green-800' : 'text-orange-800'
                      }`}>
                        {isCorrect ? '✅ Correct!' : 'Not quite!'}
                      </p>
                      <p className="text-gray-700 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
              >
                {currentStep === 'federal' && currentQuestionIndex < federalQuestions.length - 1
                  ? 'Next Question'
                  : currentStep === 'federal'
                  ? 'Continue to Provincial Question'
                  : 'Complete ✓'
                }
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

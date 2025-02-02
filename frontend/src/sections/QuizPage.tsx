"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, RefreshCcw } from "lucide-react"

type QuizQuestion = {
  question: string
  type: "multiple_choice" | "true_false" | "short_answer"
  options?: string[]
  answer: string | boolean
}

export default function QuizPage() {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(
    null
  )
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [shortAnswer, setShortAnswer] = useState<string>("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!")

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(
        "https://backend-production-9417.up.railway.app/extract-text/",
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await response.json()

      if (data.quiz && data.quiz.quiz) {
        setQuiz(data.quiz.quiz)
      } else {
        alert("Invalid quiz response format.")
      }

      setCurrentIndex(0)
      setScore(0)
      setQuizCompleted(false)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file and generate quiz.")
    } finally {
      setLoading(false)
    }
  }

  const handleShortAnswer = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAnswer(shortAnswer.trim())
    }
  }

  const handleAnswer = (answer: string | boolean) => {
    setSelectedAnswer(answer)
    const isCorrect = answer === quiz[currentIndex].answer
    setFeedback(isCorrect ? "correct" : "wrong")

    if (isCorrect) setScore(score + 1)

    setTimeout(() => {
      setFeedback(null)
      setSelectedAnswer(null)

      if (currentIndex < quiz.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShortAnswer("")
      } else {
        setQuizCompleted(true)
      }
    }, 1500)
  }

  const handleRestart = () => {
    setQuiz([])
    setFile(null)
    setCurrentIndex(0)
    setScore(0)
    setFeedback(null)
    setSelectedAnswer(null)
    setQuizCompleted(false)
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6'>
      {quiz.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className='flex flex-col items-center space-y-6'
        >
          <h2 className='text-2xl font-bold'>
            Upload a File to Generate a Quiz
          </h2>
          <input
            type='file'
            accept='.pdf,.doc,.docx,.ppt,.pptx'
            onChange={handleFileChange}
            className='file:bg-indigo-600 file:text-white file:px-4 file:py-2 file:border-none file:rounded-lg cursor-pointer bg-gray-700 text-white px-4 py-2 rounded-lg'
          />
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className='bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg flex items-center gap-2'
          >
            {loading ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Upload size={18} />
            )}{" "}
            Upload & Generate Quiz
          </Button>
        </motion.div>
      ) : quizCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className='text-center w-full max-w-2xl'
        >
          <h2 className='text-3xl font-bold mb-4'>🎉 Quiz Completed! 🎉</h2>
          <p className='text-xl mb-6'>
            Your Score: {score} / {quiz.length}
          </p>
          <div className='mb-6'>
            <h3 className='text-2xl font-bold mb-4'>Review Your Answers</h3>
            {quiz.map((question, index) => (
              <Card key={index} className='bg-white p-4 rounded-lg mb-4'>
                <CardContent>
                  <h4 className='text-lg font-semibold mb-2'>
                    {question.question}
                  </h4>
                  <p className='text-sm text-gray-400'>
                    Correct Answer:{" "}
                    <span className='text-green-400'>
                      {question.type === "true_false"
                        ? question.answer.toString()
                        : question.answer}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            onClick={handleRestart}
            className='bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg flex items-center gap-2'
          >
            <RefreshCcw size={18} /> Restart Quiz
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-2xl'
        >
          <Progress
            value={((currentIndex + 1) / quiz.length) * 100}
            className='w-full mb-4 h-3 bg-gray-700'
          />

          <Card className='bg-white p-6 rounded-xl shadow-lg'>
            <CardContent>
              <h2 className='text-2xl font-bold mb-6'>
                {quiz[currentIndex].question}
              </h2>

              {quiz[currentIndex].type === "multiple_choice" &&
                quiz[currentIndex].options?.map((option, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.9 }}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
                      selectedAnswer === option
                        ? feedback === "correct"
                          ? "bg-green-500"
                          : "bg-red-500"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </motion.button>
                ))}

              {quiz[currentIndex].type === "true_false" && (
                <div className='flex space-x-4'>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className={`w-1/2 px-4 py-3 rounded-lg ${
                      selectedAnswer === true
                        ? feedback === "correct"
                          ? "bg-green-500"
                          : "bg-red-500"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                    onClick={() => handleAnswer(true)}
                  >
                    True
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className={`w-1/2 px-4 py-3 rounded-lg ${
                      selectedAnswer === false
                        ? feedback === "correct"
                          ? "bg-green-500"
                          : "bg-red-500"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                    onClick={() => handleAnswer(false)}
                  >
                    False
                  </motion.button>
                </div>
              )}

              {quiz[currentIndex].type === "short_answer" && (
                <motion.input
                  type='text'
                  placeholder='Type your answer...'
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  onKeyDown={handleShortAnswer}
                  className='w-full px-4 py-3 rounded-lg bg-yellow-500 text-white focus:outline-none focus:ring focus:ring-indigo-400 mt-4'
                />
              )}

              {feedback && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`mt-4 text-lg font-semibold ${
                    feedback === "correct" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {feedback === "correct" ? "✅ Correct!" : "❌ Wrong Answer!"}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

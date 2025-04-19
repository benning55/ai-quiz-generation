"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, X, RefreshCcw } from "lucide-react"

type QuizQuestion = {
  question: string
  type: "multiple_choice" | "true_false" | "short_answer"
  options?: string[]
  answer: string | boolean
}

export default function QuizPage() {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [shortAnswer, setShortAnswer] = useState<string>("")
  
  const handleStartQuiz = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/generate-quiz-from-flashcards/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            count: 10,
            question_types: ["multiple_choice", "true_false"]
          }),
        }
      );

      const data = await response.json();

      if (data.quiz && data.quiz.quiz) {
        setQuiz(data.quiz.quiz);
      } else {
        alert("Couldn't load quiz questions. Please try again.");
      }

      setCurrentIndex(0);
      setScore(0);
      setQuizCompleted(false);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
    setCurrentIndex(0)
    setScore(0)
    setFeedback(null)
    setSelectedAnswer(null)
    setQuizCompleted(false)
    setShortAnswer("")
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white text-gray-800 p-6'>
      {quiz.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className='flex flex-col items-center space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-xl w-full text-center'
        >
          <h2 className='text-3xl font-bold text-center text-red-700 mb-2'>
            Canadian Citizenship Test Practice
          </h2>
          
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg" 
            alt="Canadian Flag" 
            className='w-24 h-auto my-4'
          />
          
          <p className='text-center text-gray-600 mb-6'>
            Test your knowledge of Canadian history, geography, government, and culture with our practice citizenship test.
          </p>
          
          <Button
            onClick={handleStartQuiz}
            disabled={loading}
            className='bg-red-700 hover:bg-red-800 text-white px-8 py-4 text-lg rounded-lg flex items-center gap-2 w-full max-w-xs'
          >
            {loading ? (
              <Loader2 className='animate-spin' />
            ) : (
              <CheckCircle size={22} />
            )}{" "}
            Start Test
          </Button>
        </motion.div>
      ) : quizCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className='text-center w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg'
        >
          <div className='mb-6 flex flex-col items-center'>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Canada_%28Pantone%29.svg" 
              alt="Canadian Flag" 
              className='w-16 h-auto mb-4'
            />
            <h2 className='text-3xl font-bold mb-4 text-red-700'>Practice Completed!</h2>
            <p className='text-xl mb-6'>
              Your Score: <span className='font-bold'>{score}</span> / <span>{quiz.length}</span>
            </p>
          </div>
          <div className='mb-6'>
            <h3 className='text-2xl font-bold mb-4 text-gray-800'>Review Your Answers</h3>
            {quiz.map((question, index) => (
              <Card key={index} className='bg-white border border-gray-200 p-4 rounded-lg mb-4 shadow-sm'>
                <CardContent className='p-2'>
                  <h4 className='text-lg font-semibold mb-2 text-gray-800'>
                    {question.question}
                  </h4>
                  <p className='text-sm text-gray-600'>
                    Correct Answer:{" "}
                    <span className='text-green-600 font-medium'>
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
            className='bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto'
          >
            <RefreshCcw size={18} /> Try Another Quiz
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg'
        >
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-lg font-medium text-gray-600'>Question {currentIndex + 1} of {quiz.length}</h3>
            <span className='text-sm font-medium px-3 py-1 bg-red-100 text-red-700 rounded-full'>
              Score: {score}
            </span>
          </div>
          
          <Progress
            value={((currentIndex + 1) / quiz.length) * 100}
            className='w-full mb-6 h-2 bg-gray-200'
          />

          <Card className='bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-6'>
            <CardContent className='p-2'>
              <h2 className='text-xl font-bold mb-6 text-gray-800'>
                {quiz[currentIndex].question}
              </h2>

              {quiz[currentIndex].type === "multiple_choice" &&
                quiz[currentIndex].options?.map((option, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
                      selectedAnswer === option
                        ? feedback === "correct"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </motion.button>
                ))}

              {quiz[currentIndex].type === "true_false" && (
                <div className='flex space-x-4'>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className={`w-1/2 px-4 py-3 rounded-lg ${
                      selectedAnswer === true
                        ? feedback === "correct"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => handleAnswer(true)}
                  >
                    True
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className={`w-1/2 px-4 py-3 rounded-lg ${
                      selectedAnswer === false
                        ? feedback === "correct"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
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
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                />
              )}

              {feedback && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`mt-4 text-lg font-semibold flex items-center ${
                    feedback === "correct" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {feedback === "correct" ? (
                    <>
                      <CheckCircle className="mr-2" size={20} />
                      Correct!
                    </>
                  ) : (
                    <>
                      <X className="mr-2" size={20} />
                      Incorrect
                    </>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

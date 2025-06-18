"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs"
import Link from 'next/link'
import { Header } from '@/sections/Header'
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, ChevronsRight, RefreshCcw, Trophy, Timer, Sparkles, Shield } from "lucide-react"
import Image from 'next/image'
import { Progress } from "@/components/ui/progress"
import confetti from 'canvas-confetti'
import { PaymentButton } from '@/components/PaymentButton'
import { API_ENDPOINTS } from '@/config/api'

type QuizQuestion = {
  question: string;
  options?: string[];
  answer: string | boolean;
  type?: string;
};

type QuizData = {
  quiz: QuizQuestion[];
  summary?: string; 
}

export default function QuizPage() {
  const { isLoaded, userId, getToken } = useAuth();
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLimited, setIsLimited] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userStatus, setUserStatus] = useState<{ has_active_payment: boolean } | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | boolean | null)[]>([]);
  const [answerResults, setAnswerResults] = useState<boolean[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  
  // Confetti effect for correct answers
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore(0);
    setQuizCompleted(false);
    setFeedback(null);
    setSeconds(0);
    setQuiz([]);
    setUserAnswers([]);
    setAnswerResults([]);
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth token if user is signed in
      if (userId) {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const questions_amount = userStatus?.has_active_payment
        ? 20
        : userId
        ? 5
        : 3
      
      const response = await fetch(API_ENDPOINTS.GENERATE_QUIZ, {
        method: "POST",
        headers,
        body: JSON.stringify({
          count: questions_amount,
          question_types: ["multiple_choice"],
        }),
      })

      const data = await response.json();
      
      const quizQuestions = data?.quiz?.quiz;

      if (Array.isArray(quizQuestions)) {
        const filteredQuiz = quizQuestions.filter(
          (question: QuizQuestion) => question.type !== "short_answer"
        );
        setQuiz(filteredQuiz);
        setUserStatus(data.user_status || { has_active_payment: false });
        setIsSignedIn(!!userId);
      } else {
        console.error("Unexpected quiz format: ", data);
        alert("Couldn't load quiz questions. The format was unexpected.");
      }
      
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getToken]);

  // Start a timer when the quiz starts
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isLoading && quiz.length > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isLoading, quiz.length, quizCompleted]);


  const fetchUser = async () => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

    // Add auth token if user is signed in
    if (userId) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      return
    }
    const response = await fetch(API_ENDPOINTS.USER, {
      method: "GET",
      headers: headers
    })
    const data = await response.json()
    setUserStatus(data.user_status)
  }

  // Load the quiz when component mounts
  useEffect(() => {
    fetchUser()
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setFeedback(null);
    } else {
      setQuizCompleted(true);
      if (score > Math.floor(quiz.length * 0.7)) {
        setTimeout(() => {
          triggerConfetti();
        }, 500);
      }
    }
  };

  const handleOptionSelect = (option: string | boolean) => {
    if (showAnswer) return;
    
    setSelectedOption(typeof option === 'boolean' ? String(option) : option);
    setShowAnswer(true);
    
    const currentQuestion = quiz[currentQuestionIndex];
    let isCorrect = false;
    
    if (currentQuestion.type === "true_false") {
      // Convert string "true"/"false" to boolean and compare
      const userAnswer = option === "true" ? true : option === "false" ? false : option;
      const correctAnswer = currentQuestion.answer === true || currentQuestion.answer === "true";
      isCorrect = userAnswer === correctAnswer;
      console.log('True/False comparison:', { userAnswer, correctAnswer, isCorrect }); // Debug log
    } else {
      // For multiple choice, compare the full answer text
      isCorrect = option === currentQuestion.answer;
    }
    
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    // Update user answers and results arrays
    const newUserAnswers = [...userAnswers];
    const newAnswerResults = [...answerResults];
    newUserAnswers[currentQuestionIndex] = option;
    newAnswerResults[currentQuestionIndex] = isCorrect;
    setUserAnswers(newUserAnswers);
    setAnswerResults(newAnswerResults);
    
    if (isCorrect) {
      setScore(score + 1);
      setTimeout(() => {
        triggerConfetti();
      }, 300);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderLoadingScreen = () => (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white p-6">
        <div className="max-w-4xl mx-auto pt-20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-full h-[400px] bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex gap-3">
              <div className="w-1/2 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-1/2 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );

  const renderQuizCompleteScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col"
    >
      <Card className="shadow-xl overflow-hidden border-0 bg-gradient-to-tr from-white to-red-50 flex-1 flex flex-col">
        {/* <div className="absolute right-0 top-0 w-32 h-32 bg-red-200 rounded-full -mt-16 -mr-16 opacity-20" /> */}
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-yellow-200 rounded-full -mb-20 -ml-20 opacity-20" />
        
        <CardHeader className="text-center relative z-10 flex-shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: 0.2 
            }}
            className="mx-auto mb-4"
          >
            <div className="relative inline-block">
              <Trophy 
                className={`w-16 h-16 sm:w-20 sm:h-20 ${
                  score > Math.floor(quiz.length * 0.7) 
                    ? "text-yellow-500" 
                    : "text-gray-400"
                }`} 
              />
              {score > Math.floor(quiz.length * 0.7) && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-0 text-yellow-400"
                >
                  <Sparkles className="w-16 h-16 sm:w-20 sm:h-20" />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
            Quiz Complete!
          </CardTitle>
          
          <div className="mt-2 text-base sm:text-lg">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 mt-4"
            >
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Score</div>
                <div className="text-2xl sm:text-3xl font-bold text-red-600">
                  {score}/{quiz.length}
                </div>
                <div className="text-sm font-medium text-gray-500 mt-1">
                  {Math.round((score / quiz.length) * 100)}%
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Time</div>
                <div className="text-2xl sm:text-3xl font-bold text-red-600">
                  {formatTime(seconds)}
                </div>
                <div className="text-sm font-medium text-gray-500 mt-1">
                  mm:ss
                </div>
              </div>
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 px-4 sm:px-8 overflow-y-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mt-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Beginner</span>
                <span>Advanced</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / quiz.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className={`h-full rounded-full ${
                    score > Math.floor(quiz.length * 0.7) 
                      ? "bg-green-500" 
                      : score > Math.floor(quiz.length * 0.5) 
                        ? "bg-yellow-500" 
                        : "bg-red-500"
                  }`}
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {score > Math.floor(quiz.length * 0.7) ? (
                <p>Great job! You&apos;ve demonstrated excellent knowledge of Canadian citizenship materials. Keep it up!</p>
              ) : score > Math.floor(quiz.length * 0.5) ? (
                <p>Good effort! With a bit more study, you&apos;ll be well-prepared for the citizenship test.</p>
              ) : (
                <p>This is a good start. We recommend reviewing the study materials to improve your score.</p>
              )}
            </div>
          </motion.div>
        </CardContent>
        
        <CardFooter className="flex flex-col md:flex-row justify-center gap-4 pt-4 pb-8 relative z-10 px-4 sm:px-8 flex-shrink-0 bg-white/50 backdrop-blur-sm mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Button 
              onClick={() => setShowSummary(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl shadow-md flex items-center justify-center gap-2 w-full"
              size="lg"
            >
              <Trophy className="w-5 h-5" />
              View Quiz Summary
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Button 
              onClick={fetchQuiz}
              className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl shadow-md flex items-center justify-center gap-2 w-full"
              size="lg"
            >
              <RefreshCcw className="w-5 h-5" />
              Start New Quiz
            </Button>
          </motion.div>
          
          <SignedOut>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/sign-up">
                <Button 
                  variant="outline" 
                  className="px-6 sm:px-8 py-4 sm:py-5 rounded-xl border-2 w-full"
                  size="lg"
                >
                  Sign Up for More Access
                </Button>
              </Link>
            </motion.div>
          </SignedOut>
        </CardFooter>
      </Card>

      {/* Quiz Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full mx-auto max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quiz Summary</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSummary(false)}
                className="rounded-full"
              >
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {quiz.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = answerResults[index];
                
                return (
                  <div key={index} className="border-b border-gray-100 pb-4">
                    <p className="font-medium text-gray-800">{question.question}</p>
                    <div className="mt-2 space-y-1">
                      <p className={`text-sm ${
                        isCorrect ? "text-green-600" : "text-red-600"
                      }`}>
                        Your answer: {question.type === "true_false" 
                          ? (userAnswer ? "True" : "False")
                          : userAnswer}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600">
                          Correct answer: {question.type === "true_false" 
                            ? (question.answer ? "True" : "False")
                            : question.answer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  const renderQuizQuestion = () => (
    <motion.div
      key={`question-${currentQuestionIndex}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="py-8 relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl text-sm shadow-sm">
            Question {currentQuestionIndex + 1} of {quiz.length}
          </div>
          
          {score > 0 && (
            <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl text-sm shadow-sm">
              Score: {score}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
          <Timer className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{formatTime(seconds)}</span>
        </div>
      </div>
      
      <Progress 
        value={((currentQuestionIndex + 1) / quiz.length) * 100} 
        className="h-2 mb-8 bg-gray-100"
      />
      
      <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-white to-gray-50">
        <div className="absolute right-0 top-0 w-40 h-40 bg-red-50 rounded-full -mt-20 -mr-20 opacity-30" />
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-blue-50 rounded-full -mb-16 -ml-16 opacity-30" />
        
        <CardHeader className="relative z-10 p-8">
          <CardTitle className="text-2xl text-gray-800">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="font-bold"
            >
              {quiz[currentQuestionIndex].question}
            </motion.div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10 px-8">
          {quiz[currentQuestionIndex].type === "multiple_choice" && quiz[currentQuestionIndex].options ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.07
                  }
                }
              }}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {quiz[currentQuestionIndex].options.map((option, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Button
                    variant={selectedOption === option 
                      ? (showAnswer 
                          ? (option === quiz[currentQuestionIndex].answer ? "default" : "destructive") 
                          : "default") 
                      : "outline"}
                    className={`w-full justify-start text-left p-6 h-auto relative overflow-hidden whitespace-normal break-words rounded-xl text-base ${
                      showAnswer && option === quiz[currentQuestionIndex].answer 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0" 
                        : showAnswer && selectedOption === option
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
                          : "hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={showAnswer}
                  >
                    <div className="flex items-start gap-3 z-10 relative">
                      <div className="flex-shrink-0 mt-0.5">
                        {showAnswer && option === quiz[currentQuestionIndex].answer && (
                          <CheckCircle className="text-white w-5 h-5" />
                        )}
                        {showAnswer && selectedOption === option && option !== quiz[currentQuestionIndex].answer && (
                          <XCircle className="text-white w-5 h-5" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                    
                    {showAnswer && option === quiz[currentQuestionIndex].answer && (
                      <motion.div 
                        className="absolute inset-0 bg-white opacity-10"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          ) : quiz[currentQuestionIndex].type === "true_false" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 justify-center"
            >
              <Button
                variant={selectedOption === "true" 
                  ? (showAnswer 
                      ? (quiz[currentQuestionIndex].answer === true ? "default" : "destructive") 
                      : "default") 
                  : "outline"}
                className={`w-1/2 justify-center p-6 h-auto relative overflow-hidden rounded-xl text-lg font-medium ${
                  showAnswer && quiz[currentQuestionIndex].answer === true
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0" 
                    : showAnswer && selectedOption === "true"
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
                      : "hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                }`}
                onClick={() => handleOptionSelect("true")}
                disabled={showAnswer}
              >
                <div className="flex items-center gap-2 z-10 relative">
                  {showAnswer && quiz[currentQuestionIndex].answer === true && (
                    <CheckCircle className="text-white w-5 h-5 mr-1" />
                  )}
                  {showAnswer && selectedOption === "true" && quiz[currentQuestionIndex].answer !== true && (
                    <XCircle className="text-white w-5 h-5 mr-1" />
                  )}
                  True
                </div>
              </Button>
              
              <Button
                variant={selectedOption === "false" 
                  ? (showAnswer 
                      ? (quiz[currentQuestionIndex].answer === false ? "default" : "destructive") 
                      : "default") 
                  : "outline"}
                className={`w-1/2 justify-center p-6 h-auto relative overflow-hidden rounded-xl text-lg font-medium ${
                  showAnswer && quiz[currentQuestionIndex].answer === false
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0" 
                    : showAnswer && selectedOption === "false"
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
                      : "hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                }`}
                onClick={() => handleOptionSelect("false")}
                disabled={showAnswer}
              >
                <div className="flex items-center gap-2 z-10 relative">
                  {showAnswer && quiz[currentQuestionIndex].answer === false && (
                    <CheckCircle className="text-white w-5 h-5 mr-1" />
                  )}
                  {showAnswer && selectedOption === "false" && quiz[currentQuestionIndex].answer !== false && (
                    <XCircle className="text-white w-5 h-5 mr-1" />
                  )}
                  False
                </div>
              </Button>
            </motion.div>
          ) : null}
          
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-6 p-4 rounded-xl ${
                  feedback === "correct" 
                    ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-200" 
                    : "bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-700 border border-red-200"
                } flex items-center gap-3`}
              >
                {feedback === "correct" ? (
                  <>
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">Correct answer!</span>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-red-500 rounded-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">
                      Incorrect! The correct answer is: {
                        quiz[currentQuestionIndex].type === "true_false"
                          ? (quiz[currentQuestionIndex].answer ? "True" : "False")
                          : quiz[currentQuestionIndex].answer
                      }
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 p-8 relative z-10">
          {showAnswer && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full sm:w-auto"
            >
              <Button 
                onClick={handleNextQuestion}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold"
              >
                {currentQuestionIndex < quiz.length - 1 ? (
                  <div className="flex items-center gap-2">
                    Next Question
                    <ChevronsRight className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Complete Quiz
                    <Trophy className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );

  if (!hasStarted) {
    return (
      <div className='min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white'>
        <Header />

        <main className='flex-grow container mx-auto px-4 py-8 mt-16'>
          <div className='mx-auto text-center'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='space-y-8'
            >
              <div className='relative w-32 h-32 mx-auto'>
                <motion.div
                  animate={{
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src='/images/maple-leaf.svg'
                    width={128}
                    height={128}
                    alt='Canadian Maple Leaf'
                    className='mx-auto'
                  />
                </motion.div>
              </div>

              <h1 className='text-3xl font-bold text-gray-800'>
                Canadian Citizenship Practice Test
              </h1>
              <p className='text-gray-600 text-lg'>
                Test your knowledge of Canadian history, geography, government,
                and culture.
              </p>

              {!userId ? (
                <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6'>
                  <div className='flex items-center justify-center gap-3 text-yellow-600'>
                    <Shield className='w-6 h-6' />
                    <span className='font-semibold'>Limited Access</span>
                  </div>
                  <p className='text-gray-600'>
                    You can try 3 questions for free. Sign in to access all 5
                    questions and track your progress!
                  </p>
                  <div className='space-y-4'>
                    <Button
                      onClick={async () => {
                        setIsLoading(true)
                        await fetchQuiz()
                        setHasStarted(true)
                      }}
                      size='lg'
                      className='bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg w-full'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className='flex items-center gap-2'>
                          <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                          <span>Generating Quiz...</span>
                        </div>
                      ) : (
                        "Start Free Test (3 Questions)"
                      )}
                    </Button>
                    <Link href='/sign-up' className='block'>
                      <Button
                        variant='outline'
                        size='lg'
                        className='w-full border-2 border-red-600 text-red-600 hover:bg-red-50'
                      >
                        Sign Up for More Access
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : userStatus === null ? (
                <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6 animate-pulse'>
                  <div className='flex items-center justify-center gap-3'>
                    <div className='w-6 h-6 bg-gray-200 rounded-full' />
                    <div className='h-6 w-32 bg-gray-200 rounded' />
                  </div>
                  <div className='h-4 w-full bg-gray-200 rounded' />
                  <div className='h-4 w-3/4 bg-gray-200 rounded mx-auto' />
                  <div className='space-y-4'>
                    <div className='h-12 w-full bg-gray-200 rounded' />
                    <div className='h-12 w-full bg-gray-200 rounded' />
                  </div>
                </div>
              ) : !userStatus.has_active_payment ? (
                <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6'>
                  <div className='flex items-center justify-center gap-3 text-blue-600'>
                    <Sparkles className='w-6 h-6' />
                    <span className='font-semibold'>Upgrade Available</span>
                  </div>
                  <p className='text-gray-600'>
                    Get unlimited access to all practice questions and features
                    for just $25 CAD!
                  </p>
                  <div className='space-y-4'>
                    <PaymentButton />
                    <Button
                      onClick={async () => {
                        setIsLoading(true)
                        await fetchQuiz()
                        setHasStarted(true)
                      }}
                      size='lg'
                      variant='outline'
                      className='w-full border-2 border-red-600 text-red-600 hover:bg-red-50'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className='flex items-center gap-2'>
                          <div className='w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                          <span>Generating Quiz...</span>
                        </div>
                      ) : (
                        "Start Test (5 Questions)"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6'>
                  <div className='flex items-center justify-center gap-3 text-green-600'>
                    <CheckCircle className='w-6 h-6' />
                    <span className='font-semibold'>Full Access</span>
                  </div>
                  <p className='text-gray-600'>
                    You have full access to all practice questions. Start your
                    test now!
                  </p>
                  <Button
                    onClick={async () => {
                      setIsLoading(true)
                      await fetchQuiz()
                      setHasStarted(true)
                    }}
                    size='lg'
                    className='bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg w-full'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className='flex items-center gap-2'>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        <span>Generating Quiz...</span>
                      </div>
                    ) : (
                      "Start Full Test (20 Questions)"
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16'>
              {/* 7-Day Access */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='relative'
              >
                <Card className='group border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-yellow-50/30 hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:-translate-y-1'>
                  <div className='absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  <CardHeader className='bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-8 text-center relative'>
                    <span className='inline-block px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-semibold rounded-full shadow-sm'>
                      Starter Plan
                    </span>
                    <CardTitle className='text-2xl font-bold text-gray-800 mt-3 mb-1'>
                      7-Day Access
                    </CardTitle>
                    <p className='text-gray-600 text-sm'>
                      Great for short-term practice with unlimited quiz
                      attempts.
                    </p>
                  </CardHeader>
                  <CardContent className='p-8'>
                    <div className='flex items-baseline justify-center mb-4'>
                      <span className='text-4xl font-bold text-gray-900'>
                        $25
                      </span>
                    </div>
                    <div className='bg-yellow-50 text-yellow-600 text-xs font-semibold py-1.5 px-3 rounded-full w-fit mx-auto mb-6'>
                      7 Days Access
                    </div>
                    <ul className='space-y-3 text-sm text-gray-600'>
                      <li className='flex items-center bg-white/50 p-2 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-500 mr-3 flex-shrink-0' />
                        <span>100+ Practice Questions</span>
                      </li>
                      <li className='flex items-center bg-white/50 p-2 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-500 mr-3 flex-shrink-0' />
                        <span>Unlimited Quiz Attempts</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className='p-8 bg-gradient-to-br from-gray-50 to-transparent'>
                    <div className='space-y-3 w-full'>
                      <Button className='w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold'>
                        Get Instant Access
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* 1-Month Access */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='relative'
              >
                <Card className='group border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-red-50/30 hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:-translate-y-1'>
                  <div className='absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  <CardHeader className='bg-gradient-to-br from-red-50 to-red-100/50 p-8 text-center relative'>
                    <span className='inline-block px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-400 text-white text-sm font-semibold rounded-full shadow-sm'>
                      Most Popular
                    </span>
                    <CardTitle className='text-2xl font-bold text-gray-800 mt-3 mb-1'>
                      1-Month Access
                    </CardTitle>
                    <p className='text-gray-600 text-sm'>
                      Boost your knowledge with curated study content and
                      quizzes.
                    </p>
                  </CardHeader>
                  <CardContent className='p-8'>
                    <div className='flex items-baseline justify-center mb-4'>
                      <span className='text-4xl font-bold text-gray-900'>
                        $39
                      </span>
                    </div>
                    <div className='bg-red-50 text-red-600 text-xs font-semibold py-1.5 px-3 rounded-full w-fit mx-auto mb-6'>
                      1 Month Access
                    </div>
                    <ul className='space-y-3 text-sm text-gray-600'>
                      <li className='flex items-center bg-white/50 p-2 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-500 mr-3 flex-shrink-0' />
                        <span>100+ Practice Questions</span>
                      </li>
                      <li className='flex items-center bg-white/50 p-2 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-500 mr-3 flex-shrink-0' />
                        <span>Study Guides & Learning Content</span>
                      </li>
                      <li className='flex items-center bg-white/50 p-2 rounded-lg'>
                        <CheckCircle className='w-5 h-5 text-green-500 mr-3 flex-shrink-0' />
                        <span>Unlimited Quiz Attempts</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className='p-8 bg-gradient-to-br from-gray-50 to-transparent'>
                    <div className='space-y-3 w-full'>
                      <Button className='w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold'>
                        Get Instant Access
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Coming Soon */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='relative'
              >
                <Card className='group border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50/30 hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:-translate-y-1'>
                  <div className='absolute inset-0 bg-gradient-to-r from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  <CardHeader className='bg-gradient-to-br from-gray-50 to-gray-100/50 p-8 text-center relative'>
                    <CardTitle className='text-2xl font-bold text-gray-800 mt-3 mb-1'>
                      Lifetime Access
                    </CardTitle>
                    <p className='text-gray-600 text-sm'>
                      This plan is coming soon. Stay tuned for more details!
                    </p>
                  </CardHeader>
                  <CardContent className='p-8'>
                    <div className='flex items-center justify-center mb-4 text-gray-400 text-xl font-semibold'>
                      Coming Soon
                    </div>
                  </CardContent>
                  <CardFooter className='p-8 bg-gradient-to-br from-gray-50 to-transparent'>
                    <Button
                      disabled
                      className='w-full bg-gray-300 text-gray-600 py-6 rounded-xl cursor-not-allowed'
                    >
                      Coming Soon
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (isLoading) {
    return renderLoadingScreen();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <AnimatePresence mode="wait">
          {quiz.length > 0 && !quizCompleted && currentQuestionIndex < quiz.length ? (
            renderQuizQuestion()
          ) : quizCompleted && quiz.length > 0 ? (
            renderQuizCompleteScreen()
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
} 
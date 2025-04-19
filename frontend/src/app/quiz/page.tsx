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
  const [isLoading, setIsLoading] = useState(true);
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
  const [userStatus, setUserStatus] = useState({ has_active_payment: false });
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-quiz-from-flashcards/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          count: userId ? 10 : 3,
          question_types: ["multiple_choice", "true_false"]
        }),
      });

      const data = await response.json();
      
      if (data.questions && data.questions.quiz && Array.isArray(data.questions.quiz)) {
        const filteredQuiz = data.questions.quiz.filter(
          (question: QuizQuestion) => question.type !== "short_answer"
        );
        setQuiz(filteredQuiz);
        setUserStatus(data.user_status || { has_active_payment: false });
        setIsSignedIn(!!userId);
      } else {
        console.error('Unexpected quiz format:', data);
        setQuiz([]);
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

  // Load the quiz when component mounts
  useEffect(() => {
    if (isLoaded) {
      fetchQuiz();
    }
  }, [isLoaded, fetchQuiz]);

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
    
    setSelectedOption(option);
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
      className="py-8"
    >
      <Card className="shadow-xl overflow-hidden border-0 bg-gradient-to-tr from-white to-red-50">
        <div className="absolute right-0 top-0 w-32 h-32 bg-red-200 rounded-full -mt-16 -mr-16 opacity-20" />
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-yellow-200 rounded-full -mb-20 -ml-20 opacity-20" />
        
        <CardHeader className="text-center relative z-10">
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
                className={`w-20 h-20 ${
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
                  <Sparkles className="w-20 h-20" />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <CardTitle className="text-3xl font-bold text-gray-800">
            Quiz Complete!
          </CardTitle>
          
          <div className="mt-2 text-lg">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center space-x-8 mt-4"
            >
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Score</div>
                <div className="text-3xl font-bold text-red-600">
                  {score}/{quiz.length}
                </div>
                <div className="text-sm font-medium text-gray-500 mt-1">
                  {Math.round((score / quiz.length) * 100)}%
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Time</div>
                <div className="text-3xl font-bold text-red-600">
                  {formatTime(seconds)}
                </div>
                <div className="text-sm font-medium text-gray-500 mt-1">
                  mm:ss
                </div>
              </div>
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mt-6 shadow-sm"
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
        
        <CardFooter className="flex justify-center gap-4 pt-4 pb-8 relative z-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setShowSummary(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-xl shadow-md flex items-center gap-2"
              size="lg"
            >
              <Trophy className="w-5 h-5" />
              View Quiz Summary
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={fetchQuiz}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-xl shadow-md flex items-center gap-2"
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
            >
              <Link href="/sign-up">
                <Button 
                  variant="outline" 
                  className="px-8 py-5 rounded-xl border-2"
                  size="lg"
                >
                  Sign Up for Full Access
                </Button>
              </Link>
            </motion.div>
          </SignedOut>
        </CardFooter>
      </Card>

      {/* Quiz Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Quiz Summary</h2>
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
      className="py-4"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 bg-red-100 text-red-600 font-semibold rounded-full text-sm">
            Question {currentQuestionIndex + 1} of {quiz.length}
          </div>
          
          {score > 0 && (
            <div className="px-4 py-1.5 bg-green-100 text-green-600 font-semibold rounded-full text-sm">
              Score: {score}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Timer className="w-4 h-4" />
          <span className="text-sm font-medium">{formatTime(seconds)}</span>
        </div>
      </div>
      
      <Progress 
        value={((currentQuestionIndex + 1) / quiz.length) * 100} 
        className="h-2 mb-6"
      />
      
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-red-50 rounded-full -mt-20 -mr-20" />
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-red-50 rounded-full -mb-16 -ml-16" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl text-gray-800">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {quiz[currentQuestionIndex].question}
            </motion.div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
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
                    className={`w-full justify-start text-left p-4 h-auto relative overflow-hidden ${
                      showAnswer && option === quiz[currentQuestionIndex].answer 
                        ? "bg-green-100 border-2 border-green-500 text-green-700 hover:bg-green-100" 
                        : showAnswer && selectedOption === option
                          ? "bg-red-100 border-2 border-red-500 text-red-700 hover:bg-red-100"
                          : ""
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={showAnswer}
                  >
                    <div className="flex items-center gap-2 z-10 relative">
                      {showAnswer && option === quiz[currentQuestionIndex].answer && (
                        <CheckCircle className="text-green-500 w-5 h-5 mr-1" />
                      )}
                      {showAnswer && selectedOption === option && option !== quiz[currentQuestionIndex].answer && (
                        <XCircle className="text-red-500 w-5 h-5 mr-1" />
                      )}
                      {option}
                    </div>
                    
                    {showAnswer && option === quiz[currentQuestionIndex].answer && (
                      <motion.div 
                        className="absolute inset-0 bg-green-500 opacity-10 z-0"
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
                className={`w-1/2 justify-center p-4 h-auto relative overflow-hidden ${
                  showAnswer && quiz[currentQuestionIndex].answer === true
                    ? "bg-green-100 border-2 border-green-500 text-green-700 hover:bg-green-100" 
                    : showAnswer && selectedOption === "true"
                      ? "bg-red-100 border-2 border-red-500 text-red-700 hover:bg-red-100"
                      : ""
                }`}
                onClick={() => handleOptionSelect("true")}
                disabled={showAnswer}
              >
                <div className="flex items-center gap-2 z-10 relative">
                  {showAnswer && quiz[currentQuestionIndex].answer === true && (
                    <CheckCircle className="text-green-500 w-5 h-5 mr-1" />
                  )}
                  {showAnswer && selectedOption === "true" && quiz[currentQuestionIndex].answer !== true && (
                    <XCircle className="text-red-500 w-5 h-5 mr-1" />
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
                className={`w-1/2 justify-center p-4 h-auto relative overflow-hidden ${
                  showAnswer && quiz[currentQuestionIndex].answer === false
                    ? "bg-green-100 border-2 border-green-500 text-green-700 hover:bg-green-100" 
                    : showAnswer && selectedOption === "false"
                      ? "bg-red-100 border-2 border-red-500 text-red-700 hover:bg-red-100"
                      : ""
                }`}
                onClick={() => handleOptionSelect("false")}
                disabled={showAnswer}
              >
                <div className="flex items-center gap-2 z-10 relative">
                  {showAnswer && quiz[currentQuestionIndex].answer === false && (
                    <CheckCircle className="text-green-500 w-5 h-5 mr-1" />
                  )}
                  {showAnswer && selectedOption === "false" && quiz[currentQuestionIndex].answer !== false && (
                    <XCircle className="text-red-500 w-5 h-5 mr-1" />
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
                className={`mt-4 p-3 rounded-lg ${
                  feedback === "correct" 
                    ? "bg-green-50 text-green-700" 
                    : "bg-red-50 text-red-700"
                } flex items-center gap-2`}
              >
                {feedback === "correct" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Correct answer!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
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
        
        <CardFooter className="flex justify-end gap-3 pt-4 relative z-10">
          {showAnswer && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleNextQuestion} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-5 flex items-center gap-1"
              >
                {currentQuestionIndex < quiz.length - 1 ? (
                  <>
                    Next Question
                    <ChevronsRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Complete Quiz
                    <Trophy className="w-4 h-4 ml-1" />
                  </>
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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="relative w-32 h-32 mx-auto">
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
                    src="/images/maple-leaf.svg" 
                    width={128} 
                    height={128} 
                    alt="Canadian Maple Leaf"
                    className="mx-auto"
                  />
                </motion.div>
              </div>

              <h1 className="text-3xl font-bold text-gray-800">Canadian Citizenship Practice Test</h1>
              <p className="text-gray-600 text-lg">
                Test your knowledge of Canadian history, geography, government, and culture.
              </p>

              {!userId ? (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
                  <div className="flex items-center justify-center gap-3 text-yellow-600">
                    <Shield className="w-6 h-6" />
                    <span className="font-semibold">Limited Access</span>
                  </div>
                  <p className="text-gray-600">
                    You can try 3 questions for free. Sign in to access all 10 questions and track your progress!
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={async () => {
                        setIsLoading(true);
                        await fetchQuiz();
                        setHasStarted(true);
                      }}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Quiz...</span>
                        </div>
                      ) : (
                        "Start Free Test (3 Questions)"
                      )}
                    </Button>
                    <Link href="/sign-up" className="block">
                      <Button 
                        variant="outline"
                        size="lg"
                        className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Sign Up for Full Access
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : !userStatus.has_active_payment ? (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
                  <div className="flex items-center justify-center gap-3 text-blue-600">
                    <Sparkles className="w-6 h-6" />
                    <span className="font-semibold">Upgrade Available</span>
                  </div>
                  <p className="text-gray-600">
                    Get unlimited access to all practice questions and features for just $25 CAD!
                  </p>
                  <div className="space-y-4">
                    <PaymentButton />
                    <Button 
                      onClick={async () => {
                        setIsLoading(true);
                        await fetchQuiz();
                        setHasStarted(true);
                      }}
                      size="lg"
                      variant="outline"
                      className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          <span>Generating Quiz...</span>
                        </div>
                      ) : (
                        "Start Test (10 Questions)"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
                  <div className="flex items-center justify-center gap-3 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-semibold">Full Access</span>
                  </div>
                  <p className="text-gray-600">
                    You have full access to all practice questions. Start your test now!
                  </p>
                  <Button 
                    onClick={async () => {
                      setIsLoading(true);
                      await fetchQuiz();
                      setHasStarted(true);
                    }}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Quiz...</span>
                      </div>
                    ) : (
                      "Start Full Test (10 Questions)"
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    );
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
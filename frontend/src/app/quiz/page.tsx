"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth as useClerkAuth, SignedIn, SignedOut } from "@clerk/nextjs"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/sections/Header'
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, ChevronsRight, RefreshCcw, Trophy, Timer, Sparkles, Shield, Crown } from "lucide-react"
import Image from 'next/image'
import { Progress } from "@/components/ui/progress"
import confetti from 'canvas-confetti'
import { PaymentButton } from '@/components/PaymentButton'
import { API_ENDPOINTS } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'
import { canStartFreeTest, incrementFreeTestsUsed, remainingFreeTests, FREE_TEST_LIMIT } from '@/lib/freeTestGate'

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
  const router = useRouter()
  const { userData, setUserData, isLoading: authLoading } = useAuth();
  const { userId, getToken } = useClerkAuth();
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
  const [userAnswers, setUserAnswers] = useState<(string | boolean | null)[]>([]);
  const [answerResults, setAnswerResults] = useState<boolean[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [quizAttemptId, setQuizAttemptId] = useState<number | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [completionCalled, setCompletionCalled] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  
  // Confetti effect for correct answers
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  // Progress tracking functions
  const startQuizTracking = async (chapterId?: number | null) => {
    if (!userId) return null;
    
    try {
      const token = await getToken();
      if (!token) return null;
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
      const quizType = chapterId ? 'chapter_specific' : 'practice';
      const url = `${API_URL}/api/quiz/start?quiz_type=${quizType}${chapterId ? `&chapter_id=${chapterId}` : ''}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.quiz_attempt_id;
      } else {
        console.error('Failed to start quiz tracking');
        return null;
      }
    } catch (error) {
      console.error('Failed to start quiz tracking:', error);
      return null;
    }
  };

  const recordQuestionAnswer = async (questionData: any) => {
    if (!quizAttemptId || !userId) return;
    
    try {
      const token = await getToken();
      if (!token) return;
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
      const url = `${API_URL}/api/quiz/${quizAttemptId}/answer`;
      const requestData = {
        flashcard_id: questionData.id || null,
        question_text: questionData.question,
        question_type: questionData.type || 'multiple_choice',
        correct_answer: String(questionData.correct_answer),
        user_answer: String(questionData.user_answer),
        is_correct: questionData.is_correct,
        time_taken: questionData.time_taken
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        console.error('Failed to record answer');
      }
    } catch (error) {
      console.error('Failed to record answer:', error);
    }
  };

  const completeQuizTracking = useCallback(async () => {
    if (!quizAttemptId || !userId || completionCalled) return;
    
    setCompletionCalled(true);
    
    try {
      const token = await getToken();
      if (!token) return;
      
      const totalTime = quizStartTime ? Math.floor((Date.now() - quizStartTime.getTime()) / 1000) : seconds;
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
      const url = `${API_URL}/api/quiz/${quizAttemptId}/complete`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          total_time: totalTime
        })
      });
      
      if (!response.ok) {
        console.error('Failed to complete quiz tracking');
      }
    } catch (error) {
      console.error('Failed to complete quiz tracking:', error);
    }
  }, [quizAttemptId, userId, completionCalled, getToken, quizStartTime, seconds]);

  // Load chapters for premium users
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
        const response = await fetch(`${API_URL}/api/chapters/`);
        if (response.ok) {
          const data = await response.json();
          setChapters(data);
        }
      } catch (error) {
        console.error('Failed to load chapters:', error);
      }
    };

    if (userData?.has_active_payment) {
      loadChapters();
    }
  }, [userData?.has_active_payment]);

  const startQuizWithGate = async (mode: 'guest' | 'free' | 'paid', chapterId?: number | null) => {
    setIsLoading(true);
    if (mode !== 'paid') {
      if (!canStartFreeTest()) {
        setIsLoading(false);
        alert(`Free test limit reached (${FREE_TEST_LIMIT}). Please choose a plan to continue.`);
        router.push('/payment-plan');
        return;
      }
      incrementFreeTestsUsed(); // count on start to prevent abuse
    }
    
    // Store selected chapter for quiz generation
    setSelectedChapter(chapterId || null);
    
    // Start progress tracking for signed-in users
    if (userId) {
      const attemptId = await startQuizTracking(chapterId);
      setQuizAttemptId(attemptId);
      setQuizStartTime(new Date());
    }
    
    await fetchQuiz(chapterId);
    setHasStarted(true);
    setIsLoading(false);
  };

  const fetchQuiz = useCallback(async (chapterId?: number | null) => {
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

      const questions_amount = userData?.has_active_payment
        ? 20
        : userId
        ? 5
        : 3
      
      const url = chapterId 
        ? `${API_ENDPOINTS.GENERATE_QUIZ}?chapter_id=${chapterId}`
        : API_ENDPOINTS.GENERATE_QUIZ;
        
      const response = await fetch(url, {
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
  }, [userId, getToken, userData]);

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

  // Track quiz completion as a backup
  useEffect(() => {
    if (quizCompleted && userId && quizAttemptId) {
      // Add a small delay to ensure all state is updated
      setTimeout(() => {
        completeQuizTracking();
      }, 100);
    }
  }, [quizCompleted, userId, quizAttemptId, completeQuizTracking]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setFeedback(null);
    } else {
      setQuizCompleted(true);
      
      // Complete quiz tracking for signed-in users
      if (userId && quizAttemptId) {
        completeQuizTracking();
      }
      
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
    
    // Track the answer for progress tracking
    if (userId && quizAttemptId) {
      recordQuestionAnswer({
        question: currentQuestion.question,
        type: currentQuestion.type || 'multiple_choice',
        correct_answer: currentQuestion.answer,
        user_answer: option,
        is_correct: isCorrect,
        time_taken: null // Could add per-question timing later
      });
    }

    // Auto-complete quiz if this is the last question
    if (currentQuestionIndex === quiz.length - 1) {
      setTimeout(() => {
        setQuizCompleted(true);
        
        // Complete quiz tracking for signed-in users
        if (userId && quizAttemptId) {
          completeQuizTracking();
        }
      }, 2000); // 2 second delay to let user see the answer
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

  const renderQuizCompleteScreen = () => {
    const percentage = Math.round((score / quiz.length) * 100);
    const isExcellent = score > Math.floor(quiz.length * 0.7);
    const isGood = score > Math.floor(quiz.length * 0.5);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-4 sm:py-8 max-w-4xl mx-auto px-2 sm:px-4"
      >
        <Card className="shadow-xl sm:shadow-2xl overflow-visible border-0 bg-gradient-to-br from-white via-red-50/30 to-yellow-50/30">
          <div className="absolute right-0 top-0 w-32 h-32 sm:w-64 sm:h-64 bg-red-200 rounded-full -mt-16 sm:-mt-32 -mr-16 sm:-mr-32 opacity-10 blur-3xl" />
          <div className="absolute left-0 bottom-0 w-32 h-32 sm:w-64 sm:h-64 bg-yellow-200 rounded-full -mb-16 sm:-mb-32 -ml-16 sm:-ml-32 opacity-10 blur-3xl" />
          
          <CardHeader className="text-center relative z-10 pt-6 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15, 
                delay: 0.1 
              }}
              className="mx-auto mb-4 sm:mb-6"
            >
              <div className="relative inline-block">
                <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${
                  isExcellent 
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/50" 
                    : isGood
                      ? "bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/50"
                      : "bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg shadow-gray-400/50"
                }`}>
                  <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                {isExcellent && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2"
                  >
                    <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                {isExcellent ? "Excellent Work! 🎉" : isGood ? "Good Job! 👏" : "Keep Practicing! 💪"}
              </CardTitle>
              <p className="text-gray-600 text-sm sm:text-base">
                {isExcellent 
                  ? "You're well-prepared for the citizenship test!"
                  : isGood 
                    ? "You're on the right track!"
                    : "Practice makes perfect!"}
              </p>
            </motion.div>
          </CardHeader>
          
          <CardContent className="relative z-10 px-4 sm:px-6 pb-6 sm:pb-8">
            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md sm:shadow-lg border border-gray-100 min-w-0 flex flex-col items-center justify-center">
                <div className="text-sm sm:text-base font-semibold text-gray-600 mb-2">Score</div>
                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent leading-tight">
                  {score}/{quiz.length}
                </div>
                <div className="text-sm sm:text-lg font-semibold text-gray-700 mt-1">
                  {percentage}%
                </div>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md sm:shadow-lg border border-gray-100 min-w-0 flex flex-col items-center justify-center">
                <div className="text-sm sm:text-base font-semibold text-gray-600 mb-2">Time</div>
                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent leading-tight">
                  {formatTime(seconds)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  mm:ss
                </div>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md sm:shadow-lg border border-gray-100 min-w-0 flex flex-col items-center justify-center">
                <div className="text-sm sm:text-base font-semibold text-gray-600 mb-2">{percentage}%</div>
                <div className={`text-2xl sm:text-4xl font-bold leading-tight ${
                  isExcellent 
                    ? "text-green-600"
                    : isGood
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}>
                  {isExcellent ? "🎉" : isGood ? "👍" : "💪"}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                  {isExcellent ? "Excellent" : isGood ? "Good" : "Practice"}
                </div>
              </div>
            </motion.div>

            {/* Performance Bar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg border border-gray-100 mb-4 sm:mb-6"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Performance Level</h3>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  isExcellent 
                    ? "bg-green-100 text-green-700"
                    : isGood
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}>
                  {isExcellent ? "Advanced" : isGood ? "Intermediate" : "Beginner"}
                </span>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <div className="h-3 sm:h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      isExcellent 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                        : isGood 
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500" 
                          : "bg-gradient-to-r from-red-500 to-pink-500"
                    }`}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1 sm:mt-2">
                  <span>0%</span>
                  <span className="hidden sm:inline">50%</span>
                  <span>70%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {isExcellent ? (
                  <>Great job! You&apos;ve demonstrated excellent knowledge of Canadian citizenship materials. You&apos;re ready for the real test!</>
                ) : isGood ? (
                  <>Good effort! You&apos;re making solid progress. With a bit more study, you&apos;ll be fully prepared for the citizenship test.</>
                ) : (
                  <>This is a great start! We recommend reviewing the study materials and practicing more to improve your score. You&apos;ve got this!</>
                )}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-2 sm:gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button 
                  onClick={() => setShowSummary(true)}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 sm:px-6 py-4 sm:py-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 w-full text-sm sm:text-base font-semibold"
                  size="lg"
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  View Detailed Summary
                </Button>
              </motion.div>
              
              {(userData?.has_active_payment || canStartFreeTest()) && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    onClick={() => startQuizWithGate(userData?.has_active_payment ? 'paid' : (userId ? 'free' : 'guest'))}
                    className={`${
                      userData?.has_active_payment 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white' 
                        : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200'
                    } px-4 sm:px-6 py-4 sm:py-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 w-full text-sm sm:text-base font-semibold`}
                    size="lg"
                  >
                    <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">{userData?.has_active_payment ? 'Start New Test' : `Try Again (${remainingFreeTests()} left)`}</span>
                  </Button>
                </motion.div>
              )}
              
              {!userData?.has_active_payment && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Link href="/payment-plan" className="block w-full">
                    <Button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 sm:px-6 py-4 sm:py-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 w-full text-sm sm:text-base font-semibold" size="lg">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {!userData?.has_active_payment && !canStartFreeTest() && (
              <p className="text-center text-gray-600 mt-3 sm:mt-4 text-xs sm:text-sm">You&apos;ve used all {FREE_TEST_LIMIT} free tests. Upgrade to continue practicing!</p>
            )}
            
            <SignedOut>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 sm:mt-3"
              >
                <Link href="/sign-up" className="block w-full">
                  <Button 
                    variant="outline" 
                    className="px-4 sm:px-6 py-4 sm:py-6 rounded-lg sm:rounded-xl border-2 border-red-200 hover:bg-red-50 hover:border-red-300 w-full text-sm sm:text-base font-semibold"
                    size="lg"
                  >
                    Sign Up for More Access
                  </Button>
                </Link>
              </motion.div>
            </SignedOut>
          </CardContent>
        </Card>

        {/* Quiz Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-auto max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Quiz Summary</h2>
                  <p className="text-sm text-gray-500 mt-1">Review your answers and learn from mistakes</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSummary(false)}
                  className="rounded-full hover:bg-gray-100"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </Button>
              </div>
              
              <div className="overflow-y-auto flex-1 pr-2">
                <div className="space-y-4">
                  {quiz.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = answerResults[index];
                    
                    return (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border-2 ${
                          isCorrect 
                            ? "bg-green-50 border-green-200" 
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <XCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 mb-2">
                              Q{index + 1}: {question.question}
                            </p>
                            <div className="space-y-1">
                              <p className={`text-sm font-medium ${
                                isCorrect ? "text-green-700" : "text-red-700"
                              }`}>
                                Your answer: {question.type === "true_false" 
                                  ? (userAnswer ? "True" : "False")
                                  : userAnswer}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Correct answer: {question.type === "true_false" 
                                    ? (question.answer ? "True" : "False")
                                    : question.answer}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderQuizQuestion = () => {
    const currentQuestion = quiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;
    
    // Safety check - if no current question, show loading
    if (!currentQuestion) {
      return renderLoadingScreen();
    }
    
    return (
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
                {currentQuestion.question}
              </motion.div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10 px-8">
            {currentQuestion.type === "multiple_choice" && currentQuestion.options ? (
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
                {currentQuestion.options.map((option, index) => (
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
                            ? (option === currentQuestion.answer ? "default" : "destructive") 
                            : "default") 
                        : "outline"}
                      className={`w-full justify-start text-left p-6 h-auto relative overflow-hidden whitespace-normal break-words rounded-xl text-base ${
                        showAnswer && option === currentQuestion.answer 
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
                          {showAnswer && option === currentQuestion.answer && (
                            <CheckCircle className="text-white w-5 h-5" />
                          )}
                          {showAnswer && selectedOption === option && option !== currentQuestion.answer && (
                            <XCircle className="text-white w-5 h-5" />
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                      
                      {showAnswer && option === currentQuestion.answer && (
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
            ) : currentQuestion.type === "true_false" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 justify-center"
              >
                <Button
                  variant={selectedOption === "true" 
                    ? (showAnswer 
                        ? (currentQuestion.answer === true ? "default" : "destructive") 
                        : "default") 
                    : "outline"}
                  className={`w-1/2 justify-center p-6 h-auto relative overflow-hidden rounded-xl text-lg font-medium ${
                    showAnswer && currentQuestion.answer === true
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0" 
                      : showAnswer && selectedOption === "true"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
                        : "hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  }`}
                  onClick={() => handleOptionSelect("true")}
                  disabled={showAnswer}
                >
                  <div className="flex items-center gap-2 z-10 relative">
                    {showAnswer && currentQuestion.answer === true && (
                      <CheckCircle className="text-white w-5 h-5 mr-1" />
                    )}
                    {showAnswer && selectedOption === "true" && currentQuestion.answer !== true && (
                      <XCircle className="text-white w-5 h-5 mr-1" />
                    )}
                    True
                  </div>
                </Button>
                
                <Button
                  variant={selectedOption === "false" 
                    ? (showAnswer 
                        ? (currentQuestion.answer === false ? "default" : "destructive") 
                        : "default") 
                    : "outline"}
                  className={`w-1/2 justify-center p-6 h-auto relative overflow-hidden rounded-xl text-lg font-medium ${
                    showAnswer && currentQuestion.answer === false
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0" 
                      : showAnswer && selectedOption === "false"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
                        : "hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  }`}
                  onClick={() => handleOptionSelect("false")}
                  disabled={showAnswer}
                >
                  <div className="flex items-center gap-2 z-10 relative">
                    {showAnswer && currentQuestion.answer === false && (
                      <CheckCircle className="text-white w-5 h-5 mr-1" />
                    )}
                    {showAnswer && selectedOption === "false" && currentQuestion.answer !== false && (
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
                          currentQuestion.type === "true_false"
                            ? (currentQuestion.answer ? "True" : "False")
                            : currentQuestion.answer
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
  };

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
                      onClick={() => startQuizWithGate('guest')}
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
                        `Start with a free test (${remainingFreeTests()} left)`
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
              ) : userData === null ? (
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
              ) : !userData.has_active_payment ? (
                <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6'>
                  <div className='flex items-center justify-center gap-3 text-blue-600'>
                    <Sparkles className='w-6 h-6' />
                    <span className='font-semibold'>Upgrade Available</span>
                  </div>
                  <div className='space-y-4'>
                    <PaymentButton />
                    <Button
                      onClick={() => startQuizWithGate('free')}
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
                        `Start with a free test (${remainingFreeTests()} left)`
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6'>
                  <div className='flex items-center justify-center gap-3 text-green-600 mb-4'>
                    <Crown className='w-6 h-6' />
                    <span className='font-semibold text-lg'>Premium Access</span>
                  </div>
                  <p className='text-gray-600 text-center mb-6'>
                    Choose your quiz type - practice by chapter or take the full mixed test!
                  </p>
                  
                  {/* Mixed Test Option */}
                  <div className='border-2 border-red-200 rounded-xl p-4 bg-red-50 mb-6'>
                    <div className='flex items-center gap-3 mb-3'>
                      <Sparkles className='w-5 h-5 text-red-600' />
                      <h3 className='font-semibold text-red-800'>Full Mixed Test</h3>
                    </div>
                    <p className='text-red-700 text-sm mb-4'>Complete 20-question test with questions from all chapters - just like the real exam!</p>
                    <Button
                      onClick={() => startQuizWithGate('paid', null)}
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
                        "Start Full Mixed Test (20 Questions)"
                      )}
                    </Button>
                  </div>

                  {/* Chapter Selection */}
                  <div className='space-y-4'>
                    <h3 className='font-semibold text-gray-800 text-center'>Or Practice by Chapter</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      {chapters.map((chapter, index) => (
                        <motion.button
                          key={chapter.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => startQuizWithGate('paid', chapter.id)}
                          disabled={isLoading}
                          className='p-4 md:p-5 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-left group disabled:opacity-50'
                        >
                          <div className='flex items-start gap-3'>
                            <div className='w-9 h-9 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-red-200'>
                              <span className='text-red-600 font-semibold text-sm md:text-base'>{chapter.order || index + 1}</span>
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-semibold text-sm md:text-base text-gray-800 group-hover:text-red-700 mb-1 md:mb-2'>{chapter.title}</h4>
                              <p className='text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3 md:line-clamp-none'>{chapter.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>


          </div>
        </main>
      </div>
    )
  }

  if (authLoading || isLoading) {
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
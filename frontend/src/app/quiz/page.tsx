"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs"
import Link from 'next/link'
import { Header } from '@/sections/Header'

type QuizQuestion = {
  question: string;
  options?: string[];
  answer: string;
}

export default function QuizPage() {
  const { isLoaded, userId, getToken } = useAuth();
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLimited, setIsLimited] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      setIsLoading(true);
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add auth token if user is signed in
        if (userId) {
          console.log("User is logged in with ID:", userId);
          try {
            const token = await getToken();
            if (token) {
              console.log("Auth token obtained:", token.substring(0, 20) + "...");
              headers['Authorization'] = `Bearer ${token}`;
              
              // Log for debugging
              const req = new Request(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              console.log("Sample fetch request auth header:", 
                req.headers.get('Authorization')?.substring(0, 25) + "...");
            } else {
              console.log("No token received from Clerk");
            }
          } catch (error) {
            console.error("Error getting token:", error);
          }
        } else {
          console.log("User is not logged in");
        }

        console.log("Request headers:", headers);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-quiz-from-flashcards/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            count: 10,
            question_types: ["multiple_choice", "true_false"]
          }),
        });

        const data = await response.json();
        setQuiz(data.quiz);
        setIsLimited(data.limited);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded) {
      fetchQuiz();
    }
  }, [isLoaded, userId, getToken]);

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-6">
          <div className="max-w-3xl mx-auto text-center pt-20">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-40 bg-gray-200 rounded w-full mx-auto"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-6">
        <div className="max-w-3xl mx-auto">
          <SignedOut>
            {isLimited && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                <h3 className="font-bold text-lg mb-1">Free Preview Mode</h3>
                <p>You&apos;re viewing a limited set of questions. <Link href="/sign-up" className="text-red-700 font-medium underline">Sign up</Link> for free to access all questions!</p>
              </div>
            )}
          </SignedOut>

          {quiz.length > 0 && currentQuestionIndex < quiz.length ? (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">
                  Question {currentQuestionIndex + 1} of {quiz.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-lg font-medium mb-4">{quiz[currentQuestionIndex].question}</div>
                
                {quiz[currentQuestionIndex].options && (
                  <div className="space-y-2">
                    {quiz[currentQuestionIndex].options?.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedOption === option 
                          ? (showAnswer 
                              ? (option === quiz[currentQuestionIndex].answer ? "default" : "destructive") 
                              : "default") 
                          : "outline"}
                        className={`w-full justify-start text-left p-4 h-auto ${
                          showAnswer && option === quiz[currentQuestionIndex].answer 
                            ? "border-2 border-green-500" 
                            : ""
                        }`}
                        onClick={() => handleOptionSelect(option)}
                        disabled={showAnswer}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between">
                  {!showAnswer ? (
                    <Button 
                      onClick={handleShowAnswer} 
                      variant="outline"
                      disabled={!selectedOption}
                      className="flex-1"
                    >
                      Check Answer
                    </Button>
                  ) : (
                    <div className="flex-1 bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="font-medium text-green-800">Correct Answer:</div>
                      <div>{quiz[currentQuestionIndex].answer}</div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleNextQuestion} 
                    disabled={!showAnswer}
                    className="bg-red-700 hover:bg-red-800 flex-1"
                  >
                    Next Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
              <p className="text-gray-600 mb-6">You&apos;ve completed all available questions.</p>
              
              <SignedOut>
                <div className="bg-red-50 p-6 rounded-lg mb-6">
                  <h3 className="font-bold text-lg mb-2">Want More Questions?</h3>
                  <p className="mb-4">Sign up for free to access all our citizenship test preparation materials.</p>
                  <Link href="/sign-up">
                    <Button className="bg-red-700 hover:bg-red-800">
                      Sign Up for Free
                    </Button>
                  </Link>
                </div>
              </SignedOut>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Start a New Quiz
              </Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
} 
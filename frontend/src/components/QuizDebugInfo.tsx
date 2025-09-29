"use client"

import React from 'react'

type QuizDebugInfoProps = {
  userId: string | null | undefined
  quizAttemptId: number | null
  quizCompleted: boolean
  currentQuestionIndex: number
  totalQuestions: number
  score: number
}

export const QuizDebugInfo: React.FC<QuizDebugInfoProps> = ({
  userId,
  quizAttemptId,
  quizCompleted,
  currentQuestionIndex,
  totalQuestions,
  score
}) => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-xs z-50">
      <div className="font-bold mb-2">Quiz Debug Info:</div>
      <div>User ID: {userId || 'null'}</div>
      <div>Attempt ID: {quizAttemptId || 'null'}</div>
      <div>Completed: {quizCompleted ? 'true' : 'false'}</div>
      <div>Question: {currentQuestionIndex + 1}/{totalQuestions}</div>
      <div>Score: {score}</div>
      <div className="mt-2 text-yellow-300">
        Tracking: {userId && quizAttemptId ? '✅ Active' : '❌ Inactive'}
      </div>
    </div>
  )
}
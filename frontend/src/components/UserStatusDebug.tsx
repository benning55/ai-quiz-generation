"use client"

import { useAuth } from '@/contexts/AuthContext'
import { getUserAccessLevel, getSubscriptionStatus } from '@/lib/userAccess'
import { useAuth as useClerkAuth } from '@clerk/nextjs'
import { Card, CardContent } from './ui/card'

/**
 * Debug component to show user's current access status
 * Remove this in production or hide behind admin flag
 */
export function UserStatusDebug() {
  const { userData } = useAuth()
  const { userId } = useClerkAuth()
  const isSignedIn = !!userId

  const accessLevel = getUserAccessLevel(userData, isSignedIn)
  const subscriptionStatus = getSubscriptionStatus(userData)

  // Only show in development or for admins
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 text-yellow-800">🔧 User Status Debug</h3>
        <div className="text-xs space-y-1 text-yellow-700">
          <p><strong>Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {userId || 'None'}</p>
          <p><strong>Email:</strong> {userData?.email || 'None'}</p>
          <p><strong>Access Level:</strong> {accessLevel}</p>
          <p><strong>Has Active Payment:</strong> {userData?.has_active_payment ? 'Yes' : 'No'}</p>
          <p><strong>Member Tier:</strong> {userData?.member_tier || 'None'}</p>
          <p><strong>Expires At:</strong> {userData?.expires_at || 'None'}</p>
          <p><strong>Subscription Status:</strong> {subscriptionStatus.message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
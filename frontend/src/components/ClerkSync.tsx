"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useEffect } from "react"

/**
 * Component that syncs Clerk user data with our backend
 * This should be included once in the app, near the root
 */
export function ClerkSync() {
  const { isSignedIn, userId, getToken } = useAuth()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    // Only run if user is signed in and data is loaded
    if (isSignedIn && isLoaded && user) {
      const syncUserWithBackend = async () => {
        try {
          // Get auth token
          const token = await getToken()

          // Prepare user data
          const userData = {
            clerk_id: userId,
            email: user.primaryEmailAddress?.emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.imageUrl,
          }

          // Send to backend
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(userData),
            }
          )

          if (!response.ok) {
            console.error(
              "Failed to sync user with backend:",
              await response.json()
            )
          }
        } catch (error) {
          console.error("Error syncing user with backend:", error)
        }
      }

      // Sync user data
      syncUserWithBackend()
    }
  }, [isSignedIn, isLoaded, user, userId, getToken])

  // This component doesn't render anything
  return null
}

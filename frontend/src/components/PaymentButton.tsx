"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"
import { API_ENDPOINTS } from '@/config/api'

export function PaymentButton() {
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handlePayment = async () => {
    try {
      setLoading(true)

      // Get the authentication token
      const token = await getToken()
      if (!token) {
        throw new Error("Not authenticated")
      }

      // Create checkout session
      const response = await fetch(
        API_ENDPOINTS.CHECKOUT,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = sessionId
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      size='lg'
      className='bg-green-600 hover:bg-green-700 text-white transition-all duration-300 shadow-lg'
    >
      {loading ? "Processing..." : "Purchase Full Access - $25 CAD"}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { loadStripe } from "@stripe/stripe-js"
import { useAuth } from "@clerk/nextjs"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

      // Create payment intent
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const { clientSecret } = await response.json()

      // Load Stripe
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Failed to load Stripe")
      }

      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements: {
          clientSecret
        },
        confirmParams: {
          return_url: `${window.location.origin}/quiz?payment=success`
        }
      })

      if (error) {
        throw error
      }
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
      size="lg"
      className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300 shadow-lg"
    >
      {loading ? "Processing..." : "Purchase Full Access - $25 CAD"}
    </Button>
  )
} 
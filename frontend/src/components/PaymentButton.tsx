"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@clerk/nextjs"
import { API_ENDPOINTS } from '@/config/api'
import { motion } from "framer-motion"
import { CheckCircle, Crown, Zap } from "lucide-react"

const pricingTiers = [
  {
    id: "7days",
    title: "7-Day Access",
    price: "29",
    currency: "CAD",
    duration: "7 days",
    popular: false,
    features: [
      "Full access to all practice tests",
      "20 questions per test",
      "Detailed explanations",
      "Progress tracking",
      "Study recommendations"
    ]
  },
  {
    id: "1month",
    title: "1-Month Access",
    price: "39",
    currency: "CAD",
    duration: "1 month",
    popular: true,
    features: [
      "Everything in 7-Day Access",
      "Unlimited practice tests",
      "Advanced analytics",
      "Performance insights",
      "Priority support"
    ]
  }
]

export function PaymentButton() {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const { getToken } = useAuth()

  const handlePayment = async (tierId: string) => {
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
          body: JSON.stringify({
            tier: tierId
          })
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h3>
        <p className="text-gray-600">Select the perfect plan for your study needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricingTiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative h-full transition-all duration-300 hover:shadow-lg ${
              tier.popular ? 'border-2 border-red-500 shadow-lg' : 'border border-gray-200'
            }`}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  {tier.popular ? (
                    <Crown className="w-8 h-8 text-red-500" />
                  ) : (
                    <Zap className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <CardTitle className="text-xl">{tier.title}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-800">
                    ${tier.price}
                  </span>
                  <span className="text-lg text-gray-600">
                    {tier.currency}
                  </span>
                </div>
                <p className="text-sm text-gray-500">per {tier.duration}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handlePayment(tier.id)}
                  disabled={loading}
                  className={`w-full ${
                    tier.popular 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Get ${tier.title} - $${tier.price} ${tier.currency}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  )
}

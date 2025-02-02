/* eslint-disable react/no-unescaped-entities */
"use client"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { motion } from "framer-motion"

const financialFeatures = [
  "Cashback for everyday purchases goes directly into your Stock Fund.",
  "AI optimally allocates excess cash into Rainy, Stock, and Future Fund.",
  "AI analyzes transaction history and identifies spending patterns.",
  "Regularly review and cancel unnecessary subscriptions (e.g., streaming services, magazines).",
  "AI automates bill payments.",
  "AI optimally automates loan or credit card debt repayments.",
  "Provides real-time nudges to prevent impulsive spending.",
  "Smart suggestion to lower interest payments on Debts.",
  "Provide the Cheapest Gas station in real-time near you.",
  "Search grocery items, and find stores with the best sales in real-time near you.",
]

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.1, boxShadow: "0px 12px 25px rgba(0, 0, 0, 0.15)" },
}

interface FeatureDiscoveryProps {
  onFeatureDiscoverySuccess: (selectedFeatures: string[]) => void
}

export const FeatureDiscovery: React.FC<FeatureDiscoveryProps> = ({
  onFeatureDiscoverySuccess,
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const handleSelectFeature = (feature: string) => {
    setSelectedFeatures((prevFeatures) =>
      prevFeatures.includes(feature)
        ? prevFeatures.filter((f) => f !== feature)
        : prevFeatures.length < 3
        ? [...prevFeatures, feature]
        : prevFeatures
    )
  }

  const scrollToNextSection = () => {
    const nextSection = document.querySelector("#submitForm")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (selectedFeatures.length === 3) {
      onFeatureDiscoverySuccess(selectedFeatures)
      scrollToNextSection()
    }
  }, [selectedFeatures, onFeatureDiscoverySuccess])

  return (
    <section id='featureDiscovery' className='py-24 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='section-heading text-center mb-12'>
          <h2 className='section-title text-4xl font-extrabold leading-tight'>
            Choose 3 features that are most attractive
            to you.
          </h2>
        </div>
        <div className='grid grid-cols-1 gap-8 mt-10 lg:grid-cols-3'>
          {financialFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className='p-6 border border-white/20 rounded-3xl shadow-lg bg-white/90 transition-transform duration-300 ease-out'
              variants={cardVariants}
              initial='hidden'
              whileInView='visible'
              whileHover='hover'
            >
              <p className='text-lg text-black/80 font-semibold leading-relaxed mb-4'>
                {feature}
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{
                  scale: 0.9,
                  rotate: 10,
                  transition: { type: "spring", stiffness: 500, damping: 10 },
                }}
                animate={{
                  scale: selectedFeatures.includes(feature) ? 1.1 : 1,
                  backgroundColor: selectedFeatures.includes(feature)
                    ? "#4CAF50"
                    : "#7832FE",
                  transition: { duration: 0.2 },
                }}
                className={twMerge(
                  "btn btn-secondary px-5 py-3 rounded-full shadow-lg focus:ring-2 focus:ring-blue-300",
                  selectedFeatures.includes(feature)
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => handleSelectFeature(feature)}
              >
                {selectedFeatures.includes(feature) ? "Selected" : "Select"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { motion } from "framer-motion"
import SavingsAllocator from "@/components/SavingAllocator"

export const Demo = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const handleSelectFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      // If the feature is already selected, deselect it
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature))
    } else {
      // If less than 3 features are selected, allow selection
      if (selectedFeatures.length < 3) {
        setSelectedFeatures([...selectedFeatures, feature])
      }
    }
  }

  const scrollToNextSection = () => {
    const nextSection = document.querySelector("#submitForm")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (selectedFeatures.length == 3) {
      scrollToNextSection()
    }
  }, [selectedFeatures])

  return (
    <section id='featureDiscovery' className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='section-heading text-center mb-12'>
          <h2 className='section-title text-4xl font-extrabold leading-tight'>
            Demo
          </h2>
        </div>
        <SavingsAllocator />
      </div>
    </section>
  )
}

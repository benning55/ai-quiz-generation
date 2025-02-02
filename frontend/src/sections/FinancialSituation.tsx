"use client"
import { useState, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { motion } from "framer-motion"

const financialStages = [
  {
    title: "Financially Stable",
    description:
      "I have been saving occasionally and looking to automate and optimize it.",
  },
  {
    title: "At-Risk",
    description: "I want to optimize spending so I can start to save.",
  },
  {
    title: "Debt-Burdened",
    description:
      "I have a bit of debt that I’d love to get some help to manage it.",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" },
}

interface FinancialSituationProps {
  onFinancialSituationSuccess: (selectedStage: string) => void // Define prop type for callback
}

export const FinancialSituation: React.FC<FinancialSituationProps> = ({
  onFinancialSituationSuccess,
}) => {
  const [selectedStage, setSelectedStage] = useState("")

  const scrollToNextSection = () => {
    console.log("Scrolling to the next section...")
    const nextSection = document.querySelector("#featureDiscovery")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSelectStage = (stage: string) => {
    if (selectedStage === stage) {
      setSelectedStage("") // Deselect if clicked again
    } else {
      setSelectedStage(stage)
    }
  }

  useEffect(() => {
    if (selectedStage) {
      onFinancialSituationSuccess(selectedStage)
      scrollToNextSection()
    }
  }, [selectedStage])

  return (
    <section
      id='financialSituation'
      className='bg-gradient-to-b from-[#FFFFFF] to-[#7832FE] py-24 bg-white'
    >
      <div className='container mx-auto px-4'>
        <div className='section-heading text-center mb-12'>
          <h2 className='section-title text-4xl font-extrabold leading-tight'>
            User Discovery
          </h2>
          <p className='section-description mt-4 text-xl leading-relaxed'>
            Identify your current financial stage to receive tailored advice and
            support.
          </p>
        </div>
        <div className='flex flex-col gap-8 items-center mt-10 lg:flex-row lg:items-start lg:justify-center'>
          {financialStages.map(({ title, description }) => (
            <motion.div
              key={title}
              className='p-8 border border-white/20 rounded-3xl shadow-lg bg-white/90 max-w-md w-full transition-transform duration-300 ease-out'
              variants={cardVariants}
              initial='hidden'
              whileInView='visible'
              whileHover='hover'
            >
              <h3 className='text-2xl font-bold text-black/90 mb-4'>{title}</h3>
              <p className='text-lg text-black/70 leading-relaxed mb-6'>
                {description}
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{
                  scale: 0.95,
                  rotate: 10,
                  transition: { type: "spring", stiffness: 500, damping: 10 },
                }}
                animate={{
                  scale: selectedStage === title ? 1.05 : 1,
                  backgroundColor:
                    selectedStage === title ? "#4CAF50" : "#7832FE",
                  transition: { duration: 0.2 },
                }}
                className={twMerge(
                  "btn btn-primary text-white px-6 py-3 rounded-full shadow-lg focus:ring-2 ",
                  selectedStage === title && "cursor-not-allowed opacity-60"
                )}
                onClick={() => handleSelectStage(title)}
                disabled={selectedStage === title}
              >
                {selectedStage === title ? "Selected" : "Selection"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

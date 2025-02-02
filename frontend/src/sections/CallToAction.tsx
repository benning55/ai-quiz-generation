"use client"
import ArrowRight from "@/assets/arrow-right.svg"
import starImage from "@/assets/star.png"
import springImage from "@/assets/spring.png"
import Image from "next/image"
import {motion, useScroll, useTransform} from "framer-motion"
import { useRef, useState } from "react"
import SignUpButton from "@/components/SignUpButton"


interface CallToActionProps {
  onCallToActionSuccess: (
    userID: string,
    email: string,
    displayName: string
  ) => void
  onSignInFailed: (message: string) => void,
  features: string[]
}

export const CallToAction: React.FC<CallToActionProps> = ({
  onCallToActionSuccess,
  onSignInFailed,
  features
}) => {
  const [userId, setUserId] = useState<string | null>(null)
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end center"],
  })

  const handleSignInSuccess = (
    userID: string,
    email: string,
    displayName: string
  ) => {
    setUserId(userId) // Save userId in parent component
    console.log("User ID received from child:", userId)
    onCallToActionSuccess(userID, email, displayName)
  }

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150])
  return (
    <section
      id='submitForm'
      ref={sectionRef}
      className='bg-gradient-to-b from-white to-[#7832FE] py-24 overflow-x-clip'
    >
      <div className='container'>
        <div className='section-heading relative'>
          <h2 className='section-title'>Sign up for free today</h2>
          <p className='section-description mt-5'>
            Please join us and be the first to hear about our progress!
          </p>
          <motion.img
            src={starImage.src}
            alt='Star Image'
            width={360}
            className='absolute -left-[350px] -top-[137px] z-50'
            style={{
              translateY,
            }}
          />
          <motion.img
            src={springImage.src}
            alt='Spring Image'
            width={360}
            className='absolute -right-[331px] -top-[19px] z-50'
            style={{
              translateY,
            }}
          />
          <div className='flex gap-2 mt-10 justify-center'>
            {/* <button className='btn btn-primary'>Sign up with google</button> */}
            <SignUpButton onSignInSuccess={handleSignInSuccess} features={features} onSignInFailed={onSignInFailed}/>
            {/* <button className='btn btn-txt gap-1'>
              <span>Learn More</span>
              <ArrowRight className='h-5 w-5' />
            </button> */}
          </div>
        </div>
      </div>
    </section>
  )
}

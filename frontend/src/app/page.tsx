"use client"

import { CallToAction } from "@/sections/CallToAction";
import { FeatureDiscovery } from "@/sections/FeatureDiscovery";
import { FinancialSituation } from "@/sections/FinancialSituation";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import { Header2 } from "@/sections/Header2";
import { Hero } from "@/sections/Hero";
import { Hero2 } from "@/sections/Hero2";
import {Demo} from "@/sections/Demo"
import { LogoTicker } from "@/sections/LogoTicker";
import { Pricing } from "@/sections/Pricing";
import { ProductShowcase } from "@/sections/ProductShowcase";
import { Testimonials } from "@/sections/Testimonials";
import { useEffect, useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { auth } from "../firebase"; // Firebase auth setup
import { LogoTicker2 } from "@/sections/LogoTicker2";
import emailjs from "emailjs-com";
import QuizPage from "@/sections/QuizPage";
import ScheduleSection from "@/sections/ScheduleSection";

// const db = getFirestore()

export default function Home() {
  const [selectedStage, setSelectedStage] = useState("")
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {}, [selectedFeatures])

  const sendEmail = async (toEmail: string, displayName: string) => {
    try {
      await emailjs.send(
        "service_55wqo59",
        "template_51wfb0j",
        {
          to_name: displayName,
          to_email: toEmail,
        },
        "7_pe9rOfPWz4mUYIP"
      )
      console.log("SUCCESS! sending an email")
    } catch(error) {
      console.error("Error saving user data: ", error)
    }
  }

  const onFinancialSituationSuccess = (stage: string) => {
    setSelectedStage(stage)
  }

  const onFeatureDiscoverySuccess = (features: string[]) => {
    setSelectedFeatures(features)
  }

  const handleSignInSuccess = (
    userID: string,
    email: string,
    displayName: string
  ) => {
    // saveUserData(userID, email, displayName)
    console.log("Hello")
  }

  const handleSignInFailed = (message: string) => {
    console.log("*********")
    console.log(message)
    setErrorMessage(message)
  }
  return (
    <>
      <Header2 />
      {/* <QuizPage /> */}
      <ScheduleSection />
      {/* <Hero2 /> */}
      {/* <Hero /> */}
      {/* <LogoTicker /> */}
      {/* <LogoTicker2 /> */}
      {/* <ProductShowcase /> */}
      {/* <FinancialSituation onFinancialSituationSuccess={onFinancialSituationSuccess} /> */}
      {/* {errorMessage && <p style={{color: "red"}}>{errorMessage}</p>}
      <FeatureDiscovery onFeatureDiscoverySuccess={onFeatureDiscoverySuccess}/>
      <Demo /> */}
      {/* <Pricing />
      <Testimonials /> */}
      {/* <CallToAction onCallToActionSuccess={handleSignInSuccess} features={selectedFeatures} onSignInFailed={handleSignInFailed}/> */}
      <Footer />
    </>
  )
}

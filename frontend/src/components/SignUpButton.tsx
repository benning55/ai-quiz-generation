import React, { useState } from "react"
import { auth, provider } from "../firebase" // Firebase setup
import { signInWithPopup } from "firebase/auth"
import { doc, setDoc, getFirestore } from "firebase/firestore"
import { motion } from "framer-motion" // Import framer-motion for animations
import Google from "@/assets/google.svg"
import { features } from "process"

const db = getFirestore()

interface SignUpButtonProps {
  onSignInSuccess: (userID: string, email: string, displayName: string) => void // Define prop type for callback,
  onSignInFailed: (message: string) => void,
  features: string[]
}

const SignUpButton: React.FC<SignUpButtonProps> = ({
  onSignInSuccess,
  onSignInFailed, features,
}) => {
  const [user, setUser] = useState<any>(null)

  const handleSignUp = async () => {
    if (features.length >= 3) {
      onSignInFailed("Please select the interested feature first")
      return
    }
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setUser(user)

      // Store user data in Firestore when signed up
      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })
      console.log("User signed up and data saved!")

      let email = ""
      if (user.email) {
        email = user.email
      }
      let displayName = ""
      if (user.displayName) {
        displayName = user.displayName
      }

      onSignInSuccess(user.uid, email, displayName)
    } catch (error) {
      console.error("Error signing up: ", error)
    }
  }

  return (
    <div className='flex flex-col items-center'>
      {!user ? (
        <motion.button
          className='btn btn-primary'
          onClick={handleSignUp}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{
            scale: 0.95,
            rotate: 10,
            transition: { type: "spring", stiffness: 400, damping: 10 },
          }}
        >
          Sign up with Google{" "}
          <span style={{ paddingLeft: "0.25rem" }}>
            <Google />
          </span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center'
        >
          <p className='text-lg text-gray-800'>
            Thank you for your support, {user.displayName}!
          </p>
          <motion.img
            src={user.photoURL}
            alt='Profile'
            className='w-24 h-24 rounded-full mx-auto mt-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      )}
    </div>
  )
}

export default SignUpButton

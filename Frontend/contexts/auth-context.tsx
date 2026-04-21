"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth"
import { ref, get, set, onValue, off } from "firebase/database"
import { auth, database } from "@/lib/firebase"
import { logActivity } from "@/lib/activity-logger"

interface AuthContextType {
  user: User | null
  userData: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  logOut: () => Promise<void>
  isOffline: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Handle offline state
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOffline(!navigator.onLine)

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Listen to user data in Realtime Database
        const userRef = ref(database, `users/${firebaseUser.uid}`)
        
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val())
          } else {
            // Initialize user data if it doesn't exist
            const initialData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "User",
              photoURL: firebaseUser.photoURL || "",
              createdAt: new Date().toISOString(),
              role: "user",
            }
            set(userRef, initialData)
            setUserData(initialData)
          }
          setLoading(false)
        }, (error) => {
          console.error("Error reading user data:", error)
          // Fallback to auth data if DB fails
          setUserData({
            displayName: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "",
          })
          setLoading(false)
        })
      } else {
        setUserData(null)
        setLoading(false)
      }
    })

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      unsubscribe()
      if (user) {
        const userRef = ref(database, `users/${user.uid}`)
        off(userRef)
      }
    }
  }, [user?.uid])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      if (result.user) {
        await logActivity(result.user.uid, "login")
      }
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user

      // Update auth profile
      await updateProfile(newUser, { displayName })

      // Create user data in database
      const initialData = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: displayName,
        photoURL: "",
        createdAt: new Date().toISOString(),
        role: "user",
      }
      await set(ref(database, `users/${newUser.uid}`), initialData)
      
      await logActivity(newUser.uid, "login", "Account created")
    } catch (error) {
      throw error
    }
  }

  const logOut = async () => {
    if (user) {
      await logActivity(user.uid, "logout")
    }
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, logOut, isOffline }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { ref, get, set, update, query, orderByChild, limitToLast } from "firebase/database"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, database, storage } from "@/lib/firebase"
import { logActivity, type Activity, type ActivityType } from "@/lib/activity-logger"

type UserPreferences = {
  dashboardLayout?: string
  dateFormat?: string
  timeFormat?: string
}

type UserData = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: string
  organization?: string
  designation?: string
  phoneNumber?: string
  bio?: string
  preferences?: UserPreferences
  settings?: {
    darkMode?: boolean
    emailNotifications?: boolean
    pushNotifications?: boolean
    smsNotifications?: boolean
    notificationFrequency?: string
    minimumSeverity?: string
  }
  lastLogin?: number
  createdAt?: number
}

type AuthContextType = {
  user: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  updateUserProfile: (data: Partial<UserData>) => Promise<void>
  uploadProfilePicture: (file: File) => Promise<string>
  getUserActivities: (limit?: number) => Promise<Activity[]>
  logUserActivity: (type: ActivityType, details?: string) => Promise<void>
  isOffline: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  logOut: async () => {},
  updateUserProfile: async () => {},
  uploadProfilePicture: async () => "",
  getUserActivities: async () => [],
  logUserActivity: async () => {},
  isOffline: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online")
      setIsOffline(false)
    }

    const handleOffline = () => {
      console.log("App is offline")
      setIsOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial status
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    console.log("Setting up auth state listener")
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User: ${user.email}` : "No user")
      setUser(user)

      if (user) {
        try {
          // Create basic userData from auth even if database is offline
          const basicUserData: UserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: "user",
            lastLogin: Date.now(),
          }

          // Try to fetch additional user data from Realtime Database
          if (navigator.onLine) {
            try {
              const userRef = ref(database, `users/${user.uid}`)
              const snapshot = await get(userRef)

              if (snapshot.exists()) {
                console.log("User data exists, setting userData")
                const existingData = snapshot.val() as UserData

                // Update last login time
                const updatedData = {
                  ...existingData,
                  lastLogin: Date.now(),
                }

                await update(userRef, { lastLogin: Date.now() })
                setUserData(updatedData)

                // Log login activity - don't pass undefined details
                await logActivity(user.uid, "login")
              } else {
                console.log("Creating new user data")
                // Create a new user document if it doesn't exist
                const newUserData = {
                  ...basicUserData,
                  createdAt: Date.now(),
                }
                await set(userRef, newUserData)
                setUserData(newUserData)

                // Log first login with specific details
                await logActivity(user.uid, "login", "First login")
              }
            } catch (error) {
              console.error("Error fetching user data:", error)
              // Use basic user data from auth if database fails
              setUserData(basicUserData)
            }
          } else {
            console.log("Offline mode: Using basic user data from auth")
            setUserData(basicUserData)
          }
        } catch (error) {
          console.error("Error processing user data:", error)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
      setAuthInitialized(true)
    })

    return () => {
      console.log("Cleaning up auth state listener")
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true)
      console.log("Signing up user:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, { displayName })

      // Create user data in Realtime Database
      const newUserData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName,
        photoURL: null,
        role: "user",
        createdAt: Date.now(),
        lastLogin: Date.now(),
      }

      if (navigator.onLine) {
        try {
          await set(ref(database, `users/${user.uid}`), newUserData)
          console.log("User data created in database")

          // Log signup activity with specific details
          await logActivity(user.uid, "login", "Initial signup")
        } catch (error) {
          console.error("Error creating user data:", error)
          // Continue even if database fails
        }
      } else {
        console.log("Offline: User data will be created when online")
      }

      setUserData(newUserData)
      console.log("User signed up successfully")
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log("Signing in user:", email)
      await signInWithEmailAndPassword(auth, email, password)
      console.log("User signed in successfully")
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logOut = async () => {
    try {
      setLoading(true)
      console.log("Logging out user")

      // Log logout activity before signing out
      if (user) {
        await logActivity(user.uid, "logout")
      }

      await signOut(auth)
      console.log("User logged out successfully")
    } catch (error) {
      console.error("Error logging out:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) return

    try {
      setLoading(true)
      console.log("Updating user profile:", data)

      // Update display name in Firebase Auth if provided
      if (data.displayName) {
        await updateProfile(user, { displayName: data.displayName })
      }

      // Update photo URL in Firebase Auth if provided
      if (data.photoURL) {
        await updateProfile(user, { photoURL: data.photoURL })
      }

      // Update user data in Realtime Database if online
      if (navigator.onLine) {
        try {
          const userRef = ref(database, `users/${user.uid}`)
          await update(userRef, data)
          console.log("User profile updated in database")

          // Log profile update activity
          await logActivity(user.uid, "profile_update")
        } catch (error) {
          console.error("Error updating profile in database:", error)
          // Continue even if database update fails
        }
      } else {
        console.log("Offline: Profile updates will sync when online")
      }

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...data } : null))
      console.log("User profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated")
    if (!navigator.onLine) throw new Error("Cannot upload while offline")

    try {
      setLoading(true)
      console.log("Uploading profile picture")

      // Create a storage reference
      const fileRef = storageRef(storage, `profile-pictures/${user.uid}/${Date.now()}_${file.name}`)

      // Upload the file
      const snapshot = await uploadBytes(fileRef, file)
      console.log("Profile picture uploaded")

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log("Profile picture URL:", downloadURL)

      // Update user profile with new photo URL
      await updateProfile(user, { photoURL: downloadURL })

      // Update in database
      const userRef = ref(database, `users/${user.uid}`)
      await update(userRef, { photoURL: downloadURL })

      // Update local state
      setUserData((prev) => (prev ? { ...prev, photoURL: downloadURL } : null))

      // Log activity
      await logActivity(user.uid, "profile_picture_update")

      return downloadURL
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUserActivities = async (limit = 10): Promise<Activity[]> => {
    if (!user) return []
    if (!navigator.onLine) return []

    try {
      let activities: Activity[] = []

      try {
        // First try with orderByChild (this will fail if index is not set up)
        const activitiesRef = query(
          ref(database, `users/${user.uid}/activities`),
          orderByChild("timestamp"),
          limitToLast(limit),
        )

        const snapshot = await get(activitiesRef)

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            activities.push({
              ...childSnapshot.val(),
              id: childSnapshot.key,
            })
          })
        }
      } catch (error) {
        console.warn("Error using orderByChild, falling back to client-side sorting:", error)

        // Fallback: get all activities without ordering
        const activitiesRef = ref(database, `users/${user.uid}/activities`)
        const snapshot = await get(activitiesRef)

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            activities.push({
              ...childSnapshot.val(),
              id: childSnapshot.key,
            })
          })
        }
      }

      // Sort by timestamp on the client side (newest first)
      activities.sort((a, b) => b.timestamp - a.timestamp)

      // Limit the results if we have more than requested
      if (activities.length > limit) {
        activities = activities.slice(0, limit)
      }

      return activities
    } catch (error) {
      console.error("Error fetching user activities:", error)
      return []
    }
  }

  const logUserActivity = async (type: ActivityType, details?: string): Promise<void> => {
    if (!user) return

    // Only pass details if it's defined
    if (details !== undefined) {
      await logActivity(user.uid, type, details)
    } else {
      await logActivity(user.uid, type)
    }
  }

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    logOut,
    updateUserProfile,
    uploadProfilePicture,
    getUserActivities,
    logUserActivity,
    isOffline,
  }

  // Don't render children until auth is initialized
  if (!authInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


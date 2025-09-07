import { ref, push } from "firebase/database"
import { database } from "./firebase"

export type ActivityType =
  | "login"
  | "logout"
  | "profile_update"
  | "profile_picture_update"
  | "password_change"
  | "view_incident"
  | "create_incident"
  | "update_incident"
  | "delete_incident"
  | "create_alert"
  | "update_alert"
  | "delete_alert"
  | "generate_report"

export interface Activity {
  type: ActivityType
  timestamp: number
  timestampFormatted?: string
  details?: string
  ip?: string
  device?: string
  userId: string
}

export const logActivity = async (userId: string, type: ActivityType, details?: string) => {
  if (!userId || !navigator.onLine) return

  try {
    // Get basic device info
    const userAgent = navigator.userAgent
    const device = getUserDevice(userAgent)

    // Get current timestamp
    const now = new Date()
    const timestamp = now.getTime()

    // Format timestamp in a human-readable format
    const timestampFormatted = now.toISOString()

    // Create activity data object, ensuring no undefined values
    const activityData: Record<string, string | number | boolean> = {
      type,
      userId,
      device,
      timestamp,
      timestampFormatted,
      // Add a sortKey that can be used for client-side sorting if the index is not available
      sortKey: -timestamp, // Negative timestamp for descending order
    }

    // Only add details if it's defined and not null
    if (details !== undefined && details !== null) {
      activityData.details = details
    }

    // Add to user's activity log
    const activityRef = ref(database, `users/${userId}/activities`)
    await push(activityRef, activityData)

    console.log(`Activity logged: ${type}`)
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}

// Helper to extract device info from user agent
function getUserDevice(userAgent: string): string {
  let browser = "Unknown"
  let os = "Unknown"

  // Detect browser
  if (userAgent.indexOf("Chrome") > -1) browser = "Chrome"
  else if (userAgent.indexOf("Safari") > -1) browser = "Safari"
  else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox"
  else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) browser = "Internet Explorer"
  else if (userAgent.indexOf("Edge") > -1) browser = "Edge"

  // Detect OS
  if (userAgent.indexOf("Windows") > -1) os = "Windows"
  else if (userAgent.indexOf("Mac") > -1) os = "macOS"
  else if (userAgent.indexOf("Linux") > -1) os = "Linux"
  else if (userAgent.indexOf("Android") > -1) os = "Android"
  else if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) os = "iOS"

  return `${browser} on ${os}`
}

export const getActivityDescription = (type: ActivityType): string => {
  const descriptions: Record<ActivityType, string> = {
    login: "Logged in",
    logout: "Logged out",
    profile_update: "Updated profile information",
    profile_picture_update: "Updated profile picture",
    password_change: "Changed password",
    view_incident: "Viewed incident details",
    create_incident: "Created a new incident",
    update_incident: "Updated an incident",
    delete_incident: "Deleted an incident",
    create_alert: "Created a new alert",
    update_alert: "Updated an alert",
    delete_alert: "Deleted an alert",
    generate_report: "Generated a report",
  }

  return descriptions[type] || type.replace(/_/g, " ")
}


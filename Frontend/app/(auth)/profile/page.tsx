"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Edit, Save, Shield, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { getActivityDescription } from "@/lib/activity-logger"
import { FirebaseRulesHelper } from "@/components/firebase-rules-helper"

export default function ProfilePage() {
  const { userData, updateUserProfile, uploadProfilePicture, getUserActivities, logUserActivity, loading, isOffline } =
    useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    organization: "",
    designation: "",
    phoneNumber: "",
    bio: "",
  })

  // State for preferences
  const [preferences, setPreferences] = useState({
    dashboardLayout: "default",
    dateFormat: "dd/mm/yyyy",
    timeFormat: "12",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data when userData is loaded
  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || "",
        organization: userData.organization || "",
        designation: userData.designation || "",
        phoneNumber: userData.phoneNumber || "",
        bio: userData.bio || "",
      })

      // Initialize preferences if they exist
      if (userData.preferences) {
        setPreferences({
          dashboardLayout: userData.preferences.dashboardLayout || "default",
          dateFormat: userData.preferences.dateFormat || "dd/mm/yyyy",
          timeFormat: userData.preferences.timeFormat || "12",
        })
      }

      // Load activities
      loadActivities()
    }
  }, [userData])

  const loadActivities = async () => {
    if (isOffline) return

    try {
      setLoadingActivities(true)
      const userActivities = await getUserActivities(20)
      setActivities(userActivities)
    } catch (error) {
      console.error("Error loading activities:", error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target
    setPreferences((prev) => ({ ...prev, [id]: value }))
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form
      if (userData) {
        setFormData({
          displayName: userData.displayName || "",
          organization: userData.organization || "",
          designation: userData.designation || "",
          phoneNumber: userData.phoneNumber || "",
          bio: userData.bio || "",
        })
      }
    }
    setIsEditing(!isEditing)
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (isOffline) {
      setError("Cannot update profile while offline")
      return
    }

    try {
      await updateUserProfile(formData)
      await logUserActivity("profile_update")
      setSuccess("Profile updated successfully")
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    }
  }

  const handleSavePreferences = async () => {
    if (isOffline) {
      setError("Cannot update preferences while offline")
      return
    }

    setSavingPreferences(true)
    setError("")
    setSuccess("")

    try {
      // Update user profile with preferences
      await updateUserProfile({ preferences })
      await logUserActivity("profile_update", "Updated preferences")
      setSuccess("Preferences saved successfully")
    } catch (error: any) {
      setError(error.message || "Failed to save preferences")
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleProfilePictureClick = () => {
    if (isOffline) {
      setError("Cannot upload profile picture while offline")
      return
    }

    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setError("")
    setSuccess("")

    try {
      setUploadingImage(true)
      await uploadProfilePicture(file)
      setSuccess("Profile picture updated successfully")
    } catch (error: any) {
      setError(error.message || "Failed to upload profile picture")
    } finally {
      setUploadingImage(false)
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Get initials from display name
  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: number) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true })
    } catch (error) {
      return "Unknown time"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <Button onClick={handleEditToggle} disabled={isOffline}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isOffline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You are currently offline. Some features may be limited.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_3fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData?.photoURL || ""} alt={userData?.displayName || "User"} />
                  <AvatarFallback>{getInitials(userData?.displayName)}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={handleProfilePictureClick}
                  disabled={uploadingImage || isOffline}
                >
                  {uploadingImage ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium">{userData?.displayName || "User"}</div>
                <div className="text-sm text-muted-foreground">{userData?.email}</div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Shield className="h-3 w-3" />
                {userData?.role || "User"}
              </div>
              <Separator />
              <div className="w-full space-y-1 text-sm">
                <div className="flex justify-between">
                  <div className="text-muted-foreground">Member since</div>
                  <div>{userData?.createdAt ? formatTimestamp(userData.createdAt) : "Unknown"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-muted-foreground">Last login</div>
                  <div>{userData?.lastLogin ? formatTimestamp(userData.lastLogin) : "Today"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-muted-foreground">Status</div>
                  <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${isOffline ? "bg-yellow-500" : "bg-green-500"}`}></div>
                    {isOffline ? "Offline" : "Active"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Full Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={userData?.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        placeholder="Tell us about yourself"
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                  {isEditing && (
                    <CardFooter>
                      <Button type="submit" disabled={loading || isOffline}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  )}
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent activity on your account</CardDescription>
                </CardHeader>
                {activities.length === 0 && !loadingActivities && !isOffline && <FirebaseRulesHelper />}
                <CardContent>
                  {loadingActivities ? (
                    <div className="flex justify-center py-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : isOffline ? (
                    <div className="py-4 text-center text-muted-foreground">
                      Activity log is not available while offline
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity, i) => (
                        <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                          <div>
                            <div className="font-medium">{getActivityDescription(activity.type)}</div>
                            {activity.details && (
                              <div className="text-sm text-muted-foreground">{activity.details}</div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              {activity.timestampFormatted
                                ? new Date(activity.timestampFormatted).toLocaleString()
                                : formatTimestamp(activity.timestamp)}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {activity.device && <div>{activity.device}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">No activity recorded yet</div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={loadActivities} disabled={isOffline || loadingActivities}>
                    Refresh Activity Log
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
                      <div className="text-sm text-muted-foreground">Choose your preferred dashboard layout</div>
                    </div>
                    <select
                      id="dashboardLayout"
                      value={preferences.dashboardLayout}
                      onChange={handlePreferenceChange}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="default">Default</option>
                      <option value="compact">Compact</option>
                      <option value="expanded">Expanded</option>
                    </select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <div className="text-sm text-muted-foreground">Choose your preferred date format</div>
                    </div>
                    <select
                      id="dateFormat"
                      value={preferences.dateFormat}
                      onChange={handlePreferenceChange}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <div className="text-sm text-muted-foreground">Choose your preferred time format</div>
                    </div>
                    <select
                      id="timeFormat"
                      value={preferences.timeFormat}
                      onChange={handlePreferenceChange}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="12">12-hour (AM/PM)</option>
                      <option value="24">24-hour</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePreferences} disabled={isOffline || savingPreferences}>
                    <Save className="mr-2 h-4 w-4" />
                    {savingPreferences ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


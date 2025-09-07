"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

interface UserAvatarProps {
  className?: string
}

export function UserAvatar({ className }: UserAvatarProps) {
  const { userData } = useAuth()

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

  return (
    <Avatar className={className}>
      <AvatarImage src={userData?.photoURL || ""} alt={userData?.displayName || "User"} />
      <AvatarFallback>{getInitials(userData?.displayName || null)}</AvatarFallback>
    </Avatar>
  )
}


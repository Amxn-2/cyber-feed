"use client"

import type React from "react"
import { AppSidebar } from "@/components/sidebar"
import { PWAInstall } from "@/components/pwa-install"
import { ProtectedRoute } from "@/components/protected-route"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AppSidebar>{children}</AppSidebar>
      <PWAInstall />
    </ProtectedRoute>
  )
}


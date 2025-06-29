"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  AlertCircle,
  BarChart3,
  Bell,
  ChevronDown,
  Home,
  LineChart,
  LogOut,
  Map,
  Menu,
  Settings,
  Shield,
  Timer,
  User,
  WifiOff,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { UserAvatar } from "@/components/user-avatar"
import { ModeToggle } from "@/components/mode-toggle"

export function AppSidebar({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  const pathname = usePathname()
  const { userData, logOut, isOffline } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Incidents",
      icon: AlertCircle,
      href: "/incidents",
      color: "text-red-500",
    },
    {
      label: "Alerts",
      icon: Bell,
      href: "/alerts",
      color: "text-yellow-500",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      color: "text-green-500",
      href: "/analytics",
      subItems: [
        {
          label: "Trends",
          icon: LineChart,
          href: "/analytics/trends",
        },
        {
          label: "Reports",
          icon: BarChart3,
          href: "/analytics/reports",
        },
        {
          label: "Timeline",
          icon: Timer,
          href: "/analytics/timeline",
        },
        {
          label: "Threat Map",
          icon: Map,
          href: "/analytics/map",
        },
      ],
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
    },
  ]

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label)
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
          <Link href="/dashboard" className="ml-3 flex items-center">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="ml-2 text-lg font-semibold tracking-tight">CyberFeed</h2>
          </Link>
        </div>
        <ModeToggle />
      </div>

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto bg-background transition duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="ml-2 text-lg font-semibold tracking-tight">CyberFeed</h2>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <div className="space-y-4 py-4">
          <div className="px-3">
            <div className="space-y-1">
              {routes.map((route) => (
                <div key={route.label}>
                  {route.subItems ? (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => toggleSubmenu(route.label)}
                      >
                        <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                        {route.label}
                        <ChevronDown
                          className={cn(
                            "ml-auto h-4 w-4 transition-transform",
                            openSubmenu === route.label ? "rotate-180" : "",
                          )}
                        />
                      </Button>
                      {openSubmenu === route.label && (
                        <div className="ml-4 mt-1 space-y-1">
                          {route.subItems.map((subItem) => (
                            <Link key={subItem.label} href={subItem.href}>
                              <Button
                                variant={pathname === subItem.href ? "secondary" : "ghost"}
                                className="w-full justify-start"
                              >
                                <subItem.icon className="mr-2 h-4 w-4" />
                                {subItem.label}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={route.href}>
                      <Button
                        variant={pathname === route.href ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        data-current={pathname === route.href}
                      >
                        <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                        {route.label}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-3">
          {isOffline && (
            <div className="mb-2 flex items-center justify-center rounded-md bg-yellow-500/10 py-1 text-xs text-yellow-500">
              <WifiOff className="mr-1 h-3 w-3" />
              Offline Mode
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar className="h-8 w-8" />
              <div className="text-sm">
                <p className="font-medium">{userData?.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground">{userData?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <aside className={cn("pb-12 w-64 hidden md:block border-r", className)}>
        <div className="space-y-4 py-4">
          <div className="px-4 py-2">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="ml-2 text-lg font-semibold tracking-tight">CyberFeed</h2>
              </Link>
            </div>
          </div>
          <div className="px-3">
            <div className="space-y-1 sidebar-nav">
              {routes.map((route) => (
                <div key={route.label}>
                  {route.subItems ? (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => toggleSubmenu(route.label)}
                      >
                        <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                        {route.label}
                        <ChevronDown
                          className={cn(
                            "ml-auto h-4 w-4 transition-transform",
                            openSubmenu === route.label ? "rotate-180" : "",
                          )}
                        />
                      </Button>
                      {openSubmenu === route.label && (
                        <div className="ml-4 mt-1 space-y-1">
                          {route.subItems.map((subItem) => (
                            <Link key={subItem.label} href={subItem.href}>
                              <Button
                                variant={pathname === subItem.href ? "secondary" : "ghost"}
                                className="w-full justify-start"
                              >
                                <subItem.icon className="mr-2 h-4 w-4" />
                                {subItem.label}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={route.href}>
                      <Button
                        variant={pathname === route.href ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        data-current={pathname === route.href}
                      >
                        <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                        {route.label}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-3">
          {isOffline && (
            <div className="mb-2 flex items-center justify-center rounded-md bg-yellow-500/10 py-1 text-xs text-yellow-500">
              <WifiOff className="mr-1 h-3 w-3" />
              Offline Mode
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar className="h-8 w-8" />
              <div className="text-sm">
                <p className="font-medium">{userData?.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground">{userData?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="ghost" size="icon" onClick={() => logOut()}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  )
}


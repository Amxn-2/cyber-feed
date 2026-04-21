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
      color: "text-cyan-400",
    },
    {
      label: "Live Feed",
      icon: Timer,
      href: "/incidents",
      color: "text-emerald-400",
    },
    {
      label: "Sector Risk",
      icon: BarChart3,
      href: "/sectors",
      color: "text-orange-400",
    },
    {
      label: "Global Monitor",
      icon: Map,
      href: "/global-monitor",
      color: "text-pink-500",
    },
    {
      label: "Analytics",
      icon: LineChart,
      color: "text-blue-400",
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
      ],
    },
  ]

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label)
  }

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
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
                        <div className="ml-6 mt-1 space-y-1">
                          {route.subItems.map((subItem) => (
                            <Button
                              key={subItem.label}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start text-sm",
                                pathname === subItem.href
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground",
                              )}
                              asChild
                            >
                              <Link href={subItem.href}>
                                <subItem.icon className="mr-2 h-4 w-4" />
                                {subItem.label}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === route.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground",
                      )}
                      asChild
                    >
                      <Link href={route.href}>
                        <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                        {route.label}
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono font-bold text-primary tracking-widest">CYBERFEED_v1.0</span>
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Sidebar for desktop - Fixed height, no scrolling */}
      <aside className={cn("w-64 hidden md:block border-r h-screen sticky top-0", className)}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b">
            <Link href="/dashboard" className="flex items-center">
              <Shield className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
              <h2 className="ml-2 text-lg font-bold tracking-widest text-primary glowing-text">CYBERFEED</h2>
            </Link>
          </div>
          
          {/* Navigation - Fixed height, no scrolling */}
          <div className="flex-1 px-3 py-4">
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
          
          <div className="border-t p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary tracking-widest">CYBERFEED_OS_v1.0</span>
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  )
}
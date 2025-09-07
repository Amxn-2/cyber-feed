"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstall() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      // Hide the app-provided install promotion
      setIsInstallable(false)
      setIsInstalled(true)
      // Clear the deferredPrompt
      setDeferredPrompt(null)
      // Log the installation to analytics
      console.log("PWA was installed")
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = () => {
    setIsOpen(true)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsOpen(false)
  }

  if (!isInstallable || isInstalled) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full shadow-lg"
        onClick={handleInstallClick}
      >
        <Download className="h-4 w-4" />
        <span>Install App</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install CyberFeed</DialogTitle>
            <DialogDescription>
              Install this application on your device for quick and easy access when you&apos;re on the go.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                CF
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium">CyberFeed</h4>
              <p className="text-sm text-muted-foreground">Real-time cyber incident monitoring for Indian cyberspace</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInstall}>
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


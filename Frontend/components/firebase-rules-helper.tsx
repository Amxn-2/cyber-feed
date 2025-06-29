"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

export function FirebaseRulesHelper() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Alert variant="warning" className="mb-4">
        <AlertTitle>Firebase Rules Update Required</AlertTitle>
        <AlertDescription>
          To enable activity sorting, you need to update your Firebase Realtime Database rules.
          <Button variant="link" className="p-0 h-auto font-normal" onClick={() => setOpen(true)}>
            View required rules
          </Button>
        </AlertDescription>
      </Alert>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firebase Rules Update</DialogTitle>
            <DialogDescription>
              Add the following rules to your Firebase Realtime Database rules in the Firebase console:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
            <pre className="text-xs">
              {`{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "activities": {
          ".indexOn": ["timestamp"],
          "$activityId": {
            ".validate": "newData.hasChildren(['type', 'timestamp', 'userId'])"
          }
        }
      }
    }
  }
}`}
            </pre>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


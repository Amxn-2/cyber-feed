"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, ExternalLink, Globe, Shield, Tag } from "lucide-react"
import { Incident } from "@/lib/api"
import { formatDistanceToNow, format } from "date-fns"

interface IncidentDetailModalProps {
  incident: Incident | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IncidentDetailModal({ incident, open, onOpenChange }: IncidentDetailModalProps) {
  if (!incident) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Advisory':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'News':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Alert':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Report':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-gray-700 shadow-2xl z-50 p-6">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold leading-tight">
                {incident.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Detailed information about this cyber incident
              </DialogDescription>
            </div>
            <div className="flex gap-2 ml-4">
              <Badge className={getSeverityColor(incident.severity)}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {incident.severity}
              </Badge>
              <Badge className={getCategoryColor(incident.category)}>
                {incident.category}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Incident Overview */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Incident Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Source:</span>
                    <span>{incident.source}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Published:</span>
                    <span>{format(new Date(incident.published_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Location:</span>
                    <span>{incident.location}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Verified:</span>
                    <Badge variant={incident.is_verified ? "default" : "secondary"}>
                      {incident.is_verified ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Time Ago:</span>
                    <span>{formatDistanceToNow(new Date(incident.published_date))} ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none prose-invert">
                <p className="text-gray-300 leading-relaxed">
                  {incident.description || "No detailed description available for this incident."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {incident.tags && incident.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {incident.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* External Link */}
          {incident.url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Source Article
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => window.open(incident.url, '_blank')}
                  className="w-full justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original Article
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-400">Incident ID:</span>
                  <span className="font-mono">{incident._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hash:</span>
                  <span className="font-mono text-xs">{incident.hash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span>{incident.createdAt ? format(new Date(incident.createdAt), 'PPP p') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span>{incident.updatedAt ? format(new Date(incident.updatedAt), 'PPP p') : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

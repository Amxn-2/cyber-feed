"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ChevronLeft, ChevronRight, Filter, RefreshCw } from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { ProtectedRoute } from "@/components/protected-route"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { formatDistanceToNow, format } from "date-fns"
import { Incident } from "@/lib/api"

export default function TimelinePage() {
  const { incidents, loading, error, refreshIncidents } = useIncidents()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500"
      case "High":
        return "bg-amber-500"
      case "Medium":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "High":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getSeverityIconColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-500"
      case "High":
        return "text-amber-500"
      case "Medium":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Incident Timeline</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshIncidents} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DatePicker />
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full h-auto inline-flex">
              <TabsTrigger value="all" className="flex-1">
                All Incidents
              </TabsTrigger>
              <TabsTrigger value="critical" className="flex-1">
                Critical
              </TabsTrigger>
              <TabsTrigger value="high" className="flex-1">
                High
              </TabsTrigger>
              <TabsTrigger value="medium" className="flex-1">
                Medium
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="min-h-[500px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Timeline</CardTitle>
                <CardDescription>Chronological view of cyber incidents</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-red-600">Error loading incidents: {error}</p>
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No incidents found</p>
                  </div>
                ) : (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                    {incidents
                      .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
                      .map((incident) => (
                        <div key={incident._id} className="relative">
                          <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                            <div className={`absolute inset-0 m-1 rounded-full ${getSeverityColor(incident.severity)}`}></div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                {format(new Date(incident.published_date), 'MMM dd, yyyy')} • {format(new Date(incident.published_date), 'HH:mm')}
                              </div>
                              <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityBadgeColor(incident.severity)}`}>
                                {incident.severity}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`h-4 w-4 ${getSeverityIconColor(incident.severity)}`} />
                              <div className="font-medium">{incident.title}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{incident.description}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Source: {incident.source}</span>
                              <span>•</span>
                              <span>Category: {incident.category}</span>
                            </div>
                            <div className="pt-1">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="critical" className="min-h-[500px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Critical Incidents</CardTitle>
                <CardDescription>Timeline of critical severity incidents</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-red-600">Error loading incidents: {error}</p>
                  </div>
                ) : incidents.filter(incident => incident.severity === 'Critical').length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No critical incidents found</p>
                  </div>
                ) : (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                    {incidents
                      .filter(incident => incident.severity === 'Critical')
                      .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
                      .map((incident) => (
                        <div key={incident._id} className="relative">
                          <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                            <div className="absolute inset-0 m-1 rounded-full bg-red-500"></div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                {format(new Date(incident.published_date), 'MMM dd, yyyy')} • {format(new Date(incident.published_date), 'HH:mm')}
                              </div>
                              <div className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                                {incident.severity}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <div className="font-medium">{incident.title}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{incident.description}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Source: {incident.source}</span>
                              <span>•</span>
                              <span>Category: {incident.category}</span>
                            </div>
                            <div className="pt-1">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="high" className="min-h-[500px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>High Severity Incidents</CardTitle>
                <CardDescription>Timeline of high severity incidents</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-red-600">Error loading incidents: {error}</p>
                  </div>
                ) : incidents.filter(incident => incident.severity === 'High').length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No high severity incidents found</p>
                  </div>
                ) : (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                    {incidents
                      .filter(incident => incident.severity === 'High')
                      .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
                      .map((incident) => (
                        <div key={incident._id} className="relative">
                          <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                            <div className="absolute inset-0 m-1 rounded-full bg-amber-500"></div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                {format(new Date(incident.published_date), 'MMM dd, yyyy')} • {format(new Date(incident.published_date), 'HH:mm')}
                              </div>
                              <div className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                                {incident.severity}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <div className="font-medium">{incident.title}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{incident.description}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Source: {incident.source}</span>
                              <span>•</span>
                              <span>Category: {incident.category}</span>
                            </div>
                            <div className="pt-1">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="medium" className="min-h-[500px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medium Severity Incidents</CardTitle>
                <CardDescription>Timeline of medium severity incidents</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-red-600">Error loading incidents: {error}</p>
                  </div>
                ) : incidents.filter(incident => incident.severity === 'Medium').length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No medium severity incidents found</p>
                  </div>
                ) : (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                    {incidents
                      .filter(incident => incident.severity === 'Medium')
                      .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
                      .map((incident) => (
                        <div key={incident._id} className="relative">
                          <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                            <div className="absolute inset-0 m-1 rounded-full bg-blue-500"></div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                {format(new Date(incident.published_date), 'MMM dd, yyyy')} • {format(new Date(incident.published_date), 'HH:mm')}
                              </div>
                              <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {incident.severity}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-blue-500" />
                              <div className="font-medium">{incident.title}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{incident.description}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Source: {incident.source}</span>
                              <span>•</span>
                              <span>Category: {incident.category}</span>
                            </div>
                            <div className="pt-1">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}


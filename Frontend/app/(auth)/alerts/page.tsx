"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, Clock, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const initialAlerts = [
  {
    title: "Critical Vulnerability in Apache Log4j",
    description:
      "CERT-In has issued an advisory about a critical vulnerability in Apache Log4j that affects multiple systems.",
    source: "CERT-In",
    time: "2 hours ago",
    priority: "Critical",
    read: false,
  },
  {
    title: "Phishing Campaign Targeting Banking Customers",
    description: "A new phishing campaign is targeting customers of major Indian banks through SMS and email.",
    source: "Threat Intelligence",
    time: "5 hours ago",
    priority: "High",
    read: false,
  },
  {
    title: "DDoS Attack on Government Services",
    description: "Multiple government services are experiencing disruptions due to an ongoing DDoS attack.",
    source: "NCIIPC",
    time: "Yesterday",
    priority: "High",
    read: true,
  },
  {
    title: "Data Breach at Healthcare Provider",
    description: "A major healthcare provider has reported a data breach affecting patient records.",
    source: "Social Media",
    time: "2 days ago",
    priority: "Medium",
    read: true,
  },
  {
    title: "New Ransomware Variant Detected",
    description: "Security researchers have identified a new ransomware variant targeting Indian organizations.",
    source: "Threat Intelligence",
    time: "3 days ago",
    priority: "Medium",
    read: true,
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [activeTab, setActiveTab] = useState("all")
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<(typeof initialAlerts)[0] | null>(null)
  const [filters, setFilters] = useState({
    priority: {
      Critical: true,
      High: true,
      Medium: true,
      Low: true,
    },
    source: {
      "CERT-In": true,
      NCIIPC: true,
      "Threat Intelligence": true,
      "Social Media": true,
    },
  })
  const [alertSettings, setAlertSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    frequency: "realtime",
    minimumSeverity: "high",
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !alert.read
    if (activeTab === "critical") return alert.priority === "Critical"
    return true
  })

  const markAsRead = (index: number) => {
    const newAlerts = [...alerts]
    newAlerts[index].read = true
    setAlerts(newAlerts)
  }

  const handleFilterChange = (category: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [value]: !prev[category as keyof typeof prev][value as any],
      },
    }))
  }

  const handleSettingChange = (setting: string, value: any) => {
    setAlertSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleSaveSettings = () => {
    setConfigureDialogOpen(false)
    setSaveSuccess(true)

    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
  }

  const handleViewDetails = (alert: (typeof initialAlerts)[0]) => {
    setSelectedAlert(alert)
    setViewDetailsDialogOpen(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "High":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
  }

  const getPriorityIconColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
      case "High":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
      case "Medium":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Alerts</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Alerts</DialogTitle>
                <DialogDescription>Select which alerts to display</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Priority</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(filters.priority).map(([priority, checked]) => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Switch
                          id={`priority-${priority}`}
                          checked={checked}
                          onCheckedChange={() => handleFilterChange("priority", priority)}
                        />
                        <Label htmlFor={`priority-${priority}`}>{priority}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Source</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(filters.source).map(([source, checked]) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Switch
                          id={`source-${source}`}
                          checked={checked}
                          onCheckedChange={() => handleFilterChange("source", source)}
                        />
                        <Label htmlFor={`source-${source}`}>{source}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Configure Alerts</span>
                <span className="sm:hidden">Configure</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Configure Alert Settings</DialogTitle>
                <DialogDescription>Customize how you receive alerts and notifications</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alert-email" className="col-span-2">
                    Email Notifications
                  </Label>
                  <div className="col-span-2 flex justify-end">
                    <Switch
                      id="alert-email"
                      checked={alertSettings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alert-push" className="col-span-2">
                    Push Notifications
                  </Label>
                  <div className="col-span-2 flex justify-end">
                    <Switch
                      id="alert-push"
                      checked={alertSettings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alert-sms" className="col-span-2">
                    SMS Notifications
                  </Label>
                  <div className="col-span-2 flex justify-end">
                    <Switch
                      id="alert-sms"
                      checked={alertSettings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alert-frequency" className="col-span-2">
                    Alert Frequency
                  </Label>
                  <Select
                    value={alertSettings.frequency}
                    onValueChange={(value) => handleSettingChange("frequency", value)}
                  >
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alert-severity" className="col-span-2">
                    Minimum Severity
                  </Label>
                  <Select
                    value={alertSettings.minimumSeverity}
                    onValueChange={(value) => handleSettingChange("minimumSeverity", value)}
                  >
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical Only</SelectItem>
                      <SelectItem value="high">High & Above</SelectItem>
                      <SelectItem value="medium">Medium & Above</SelectItem>
                      <SelectItem value="all">All Alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfigureDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {saveSuccess && (
        <Alert className="mb-4">
          <AlertDescription>Alert settings saved successfully</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Notifications and alerts from your monitored sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className={cn("flex flex-col rounded-lg border p-4", !alert.read ? "bg-muted/50" : "")}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("rounded-full p-1 shrink-0", getPriorityIconColor(alert.priority))}>
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium leading-none">{alert.title}</h4>
                            <Badge className={cn("self-start shrink-0", getPriorityColor(alert.priority))}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{alert.description}</p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>Source: {alert.source}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.time}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alert)}>
                                View Details
                              </Button>
                              {!alert.read && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsRead(i)}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Mark as Read</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No alerts found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unread Alerts</CardTitle>
              <CardDescription>Alerts that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert, i) => (
                    <div key={i} className="flex flex-col rounded-lg border p-4 bg-muted/50">
                      <div className="flex items-start gap-4">
                        <div className={cn("rounded-full p-1 shrink-0", getPriorityIconColor(alert.priority))}>
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium leading-none">{alert.title}</h4>
                            <Badge className={cn("self-start shrink-0", getPriorityColor(alert.priority))}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{alert.description}</p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>Source: {alert.source}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.time}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alert)}>
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsRead(i)}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Mark as Read</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No unread alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Alerts</CardTitle>
              <CardDescription>High priority alerts that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className={cn("flex flex-col rounded-lg border p-4", !alert.read ? "bg-muted/50" : "")}
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-red-100 p-1 text-red-600 dark:bg-red-900 dark:text-red-300 shrink-0">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium leading-none">{alert.title}</h4>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 self-start shrink-0">
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{alert.description}</p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>Source: {alert.source}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.time}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alert)}>
                                View Details
                              </Button>
                              {!alert.read && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsRead(i)}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Mark as Read</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">No critical alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle>{selectedAlert.title}</DialogTitle>
                  <Badge className={getPriorityColor(selectedAlert.priority)}>{selectedAlert.priority}</Badge>
                </div>
                <DialogDescription>
                  Source: {selectedAlert.source} • {selectedAlert.time}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>{selectedAlert.description}</p>
                <div className="rounded-md bg-muted p-4">
                  <h4 className="mb-2 text-sm font-medium">Recommended Actions</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Verify the affected systems and assess the impact</li>
                    <li>Implement the recommended mitigation measures</li>
                    <li>Monitor for any suspicious activities</li>
                    <li>Update security protocols as necessary</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Affected Systems</h4>
                    <p className="text-sm text-muted-foreground">All systems running vulnerable software</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Potential Impact</h4>
                    <p className="text-sm text-muted-foreground">Data breach, service disruption</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setViewDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button>Download Full Report</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


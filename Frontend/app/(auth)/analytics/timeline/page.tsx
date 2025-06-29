import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { ProtectedRoute } from "@/components/protected-route"

export default function TimelinePage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Incident Timeline</h2>
          <div className="flex flex-wrap items-center gap-2">
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
                <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                  {[
                    {
                      date: "Mar 15, 2023",
                      time: "14:32",
                      title: "Ransomware Attack",
                      description: "Major financial institution targeted by ransomware",
                      severity: "Critical",
                    },
                    {
                      date: "Mar 14, 2023",
                      time: "09:15",
                      title: "DDoS Attack",
                      description: "Government portal experiencing DDoS attack",
                      severity: "High",
                    },
                    {
                      date: "Mar 12, 2023",
                      time: "18:45",
                      title: "Data Breach",
                      description: "Healthcare provider reported data breach affecting patient records",
                      severity: "High",
                    },
                    {
                      date: "Mar 10, 2023",
                      time: "11:20",
                      title: "Phishing Campaign",
                      description: "New phishing campaign targeting banking customers",
                      severity: "Medium",
                    },
                    {
                      date: "Mar 8, 2023",
                      time: "15:10",
                      title: "Zero-day Exploit",
                      description: "Zero-day vulnerability being exploited in popular software",
                      severity: "Critical",
                    },
                    {
                      date: "Mar 5, 2023",
                      time: "08:30",
                      title: "Malware Detection",
                      description: "New malware variant detected in the wild",
                      severity: "Medium",
                    },
                  ].map((incident, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                        <div
                          className={`absolute inset-0 m-1 rounded-full ${
                            incident.severity === "Critical"
                              ? "bg-red-500"
                              : incident.severity === "High"
                                ? "bg-amber-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            {incident.date} • {incident.time}
                          </div>
                          <div
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              incident.severity === "Critical"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : incident.severity === "High"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {incident.severity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              incident.severity === "Critical"
                                ? "text-red-500"
                                : incident.severity === "High"
                                  ? "text-amber-500"
                                  : "text-blue-500"
                            }`}
                          />
                          <div className="font-medium">{incident.title}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{incident.description}</div>
                        <div className="pt-1">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                  {[
                    {
                      date: "Mar 15, 2023",
                      time: "14:32",
                      title: "Ransomware Attack",
                      description: "Major financial institution targeted by ransomware",
                      severity: "Critical",
                    },
                    {
                      date: "Mar 8, 2023",
                      time: "15:10",
                      title: "Zero-day Exploit",
                      description: "Zero-day vulnerability being exploited in popular software",
                      severity: "Critical",
                    },
                  ].map((incident, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                        <div className="absolute inset-0 m-1 rounded-full bg-red-500"></div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            {incident.date} • {incident.time}
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
                        <div className="pt-1">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                  {[
                    {
                      date: "Mar 14, 2023",
                      time: "09:15",
                      title: "DDoS Attack",
                      description: "Government portal experiencing DDoS attack",
                      severity: "High",
                    },
                    {
                      date: "Mar 12, 2023",
                      time: "18:45",
                      title: "Data Breach",
                      description: "Healthcare provider reported data breach affecting patient records",
                      severity: "High",
                    },
                  ].map((incident, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                        <div className="absolute inset-0 m-1 rounded-full bg-amber-500"></div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            {incident.date} • {incident.time}
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
                        <div className="pt-1">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="relative space-y-8 before:absolute before:inset-0 before:left-9 before:border-l-2 before:border-dashed pl-10">
                  {[
                    {
                      date: "Mar 10, 2023",
                      time: "11:20",
                      title: "Phishing Campaign",
                      description: "New phishing campaign targeting banking customers",
                      severity: "Medium",
                    },
                    {
                      date: "Mar 5, 2023",
                      time: "08:30",
                      title: "Malware Detection",
                      description: "New malware variant detected in the wild",
                      severity: "Medium",
                    },
                  ].map((incident, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-10 mt-1.5 h-5 w-5 rounded-full border border-background bg-background">
                        <div className="absolute inset-0 m-1 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            {incident.date} • {incident.time}
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
                        <div className="pt-1">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}


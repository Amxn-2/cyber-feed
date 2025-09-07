"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Bell, Download, Filter, Shield, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardCharts } from "@/components/dashboard-charts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProtectedRoute } from "@/components/protected-route"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { formatDistanceToNow } from "date-fns"
import { AIAnalysis } from "@/components/ai-analysis"

export default function DashboardPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    severity: {
      critical: true,
      high: true,
      medium: true,
      low: true,
    },
    timeframe: "all",
  })

  // Use real data from backend
  const { incidents, stats, loading, error, refreshIncidents, collectData } = useIncidents({
    limit: 10
  })

  // Function to handle filter changes
  const handleFilterChange = (category: string, value: string) => {
    if (category === "severity") {
      setFilters((prev) => ({
        ...prev,
        severity: {
          ...prev.severity,
          [value]: !prev.severity[value as keyof typeof prev.severity],
        },
      }))
    } else if (category === "timeframe") {
      setFilters((prev) => ({
        ...prev,
        timeframe: value,
      }))
    }
  }

  // Function to handle export
  const handleExport = (format: string) => {
    // In a real app, this would trigger an API call to generate the export
    alert(`Exporting dashboard data in ${format} format`)
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Severity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.severity.critical}
                  onCheckedChange={() => handleFilterChange("severity", "critical")}
                >
                  Critical
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.severity.high}
                  onCheckedChange={() => handleFilterChange("severity", "high")}
                >
                  High
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.severity.medium}
                  onCheckedChange={() => handleFilterChange("severity", "medium")}
                >
                  Medium
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.severity.low}
                  onCheckedChange={() => handleFilterChange("severity", "low")}
                >
                  Low
                </DropdownMenuCheckboxItem>

                <DropdownMenuLabel className="mt-2">Timeframe</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.timeframe === "all"}
                  onCheckedChange={() => handleFilterChange("timeframe", "all")}
                >
                  All Time
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.timeframe === "today"}
                  onCheckedChange={() => handleFilterChange("timeframe", "today")}
                >
                  Today
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.timeframe === "week"}
                  onCheckedChange={() => handleFilterChange("timeframe", "week")}
                >
                  This Week
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.timeframe === "month"}
                  onCheckedChange={() => handleFilterChange("timeframe", "month")}
                >
                  This Month
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshIncidents}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={collectData}
              disabled={loading}
            >
              <Zap className="mr-2 h-4 w-4" />
              Collect Data
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem onCheckedChange={() => handleExport("pdf")}>PDF</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem onCheckedChange={() => handleExport("csv")}>CSV</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem onCheckedChange={() => handleExport("excel")}>Excel</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error loading data</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.today || 0} incidents today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats?.recent || 0}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats?.bySeverity?.find(s => s.severity === 'Critical')?.count || 0}
              </div>
              <p className="text-xs text-destructive">High priority incidents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats?.bySource?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active sources</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">
              Reports
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="flex-1">
              AI Analysis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>Showing the latest cyber incidents across Indian cyberspace</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {incidents.slice(0, 5).map((incident) => (
                        <div key={incident._id} className="flex items-center gap-4 rounded-lg border p-3">
                          <div
                            className={`rounded-full p-1 ${
                              incident.severity === 'Critical'
                                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                : incident.severity === 'High'
                                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {incident.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {incident.source} • {incident.category}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(incident.published_date))} ago
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Threat Distribution</CardTitle>
                  <CardDescription>Breakdown by attack vector</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <DashboardCharts stats={stats} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="min-h-[400px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Incident trends over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DashboardCharts type="trends" incidents={incidents} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="min-h-[400px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>Download or view detailed reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: "Monthly Incident Summary",
                      description: "Overview of all incidents from the past month",
                      date: "Generated on Mar 1, 2023",
                      type: "PDF",
                    },
                    {
                      title: "Ransomware Threat Analysis",
                      description: "Detailed analysis of ransomware threats",
                      date: "Generated on Feb 15, 2023",
                      type: "PDF",
                    },
                    {
                      title: "Financial Sector Vulnerabilities",
                      description: "Assessment of vulnerabilities in the financial sector",
                      date: "Generated on Feb 10, 2023",
                      type: "XLSX",
                    },
                  ].map((report, i) => (
                    <div key={i} className="flex flex-col rounded-lg border p-4">
                      <div className="mb-2 text-lg font-medium">{report.title}</div>
                      <div className="mb-4 text-sm text-muted-foreground">{report.description}</div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="text-sm font-medium">{report.type}</div>
                        <Button size="sm">Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ai-analysis" className="min-h-[400px] space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <AIAnalysis type="threat-summary" />
              <AIAnalysis type="insights" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}


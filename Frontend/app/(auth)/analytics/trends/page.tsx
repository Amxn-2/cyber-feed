"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Filter, Download, RefreshCw } from "lucide-react"
import { TrendsCharts } from "@/components/trends-charts"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { ProtectedRoute } from "@/components/protected-route"

export default function TrendsPage() {
  const { incidents, stats, loading, error, refreshIncidents } = useIncidents()

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Trends Analysis</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshIncidents} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full h-auto inline-flex">
            <TabsTrigger value="incidents" className="flex-1">
              Incident Trends
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex-1">
              Threat Types
            </TabsTrigger>
            <TabsTrigger value="sectors" className="flex-1">
              Affected Sectors
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="incidents" className="min-h-[500px] space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Frequency</CardTitle>
              <CardDescription>Trend of cyber incidents over time</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-sm text-red-600">Error loading data: {error}</p>
                </div>
              ) : (
                <>
                  <TrendsCharts type="incidents" incidents={incidents} stats={stats} />
                  <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 p-4">
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold">{stats?.total || incidents.length}</div>
                      <div className="text-sm text-muted-foreground">Total Incidents</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold">{stats?.bySeverity?.find(s => s.severity === 'Critical')?.count || 0}</div>
                      <div className="text-sm text-muted-foreground">Critical Alerts</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold">{stats?.bySource?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Active Sources</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="threats" className="min-h-[500px] space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Distribution</CardTitle>
              <CardDescription>Breakdown of incidents by threat type</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-sm text-red-600">Error loading data: {error}</p>
                </div>
              ) : (
                <>
                  <TrendsCharts type="threats" incidents={incidents} stats={stats} />
                  <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {stats?.bySeverity ? stats.bySeverity.map((item) => {
                      const colors = {
                        Critical: "bg-red-500",
                        High: "bg-yellow-500", 
                        Medium: "bg-blue-500",
                        Low: "bg-green-500"
                      }
                      const percentage = stats.total ? Math.round((item.count / stats.total) * 100) : 0
                      return (
                        <div key={item.severity} className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${colors[item.severity as keyof typeof colors] || 'bg-gray-500'}`}></div>
                          <div className="text-sm">{item.severity} ({percentage}%)</div>
                        </div>
                      )
                    }) : (
                      <div className="col-span-full text-center text-sm text-muted-foreground">No data available</div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sectors" className="min-h-[500px] space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affected Sectors</CardTitle>
              <CardDescription>Distribution of incidents across different sectors</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-sm text-red-600">Error loading data: {error}</p>
                </div>
              ) : (
                <>
                  <TrendsCharts type="sectors" incidents={incidents} stats={stats} />
                  <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {stats?.bySource ? stats.bySource.map((item, index) => {
                      const colors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-gray-500"]
                      const percentage = stats.total ? Math.round((item.count / stats.total) * 100) : 0
                      return (
                        <div key={item.source} className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}></div>
                          <div className="text-sm">{item.source} ({percentage}%)</div>
                        </div>
                      )
                    }) : (
                      <div className="col-span-full text-center text-sm text-muted-foreground">No data available</div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ProtectedRoute>
  )
}


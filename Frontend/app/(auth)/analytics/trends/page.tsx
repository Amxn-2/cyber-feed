"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Filter, Download } from "lucide-react"
import { TrendsCharts } from "@/components/trends-charts"

export default function TrendsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Trends Analysis</h2>
        <div className="flex flex-wrap items-center gap-2">
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
              <TrendsCharts type="incidents" />
              <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 p-4">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">1,248</div>
                  <div className="text-sm text-muted-foreground">Total Incidents</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">+12%</div>
                  <div className="text-sm text-muted-foreground">Monthly Growth</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">42</div>
                  <div className="text-sm text-muted-foreground">Active Threats</div>
                </div>
              </div>
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
              <TrendsCharts type="threats" />
              <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="text-sm">Ransomware (32%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <div className="text-sm">DDoS (24%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="text-sm">Phishing (18%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="text-sm">Data Breach (14%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <div className="text-sm">Malware (8%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                  <div className="text-sm">Other (4%)</div>
                </div>
              </div>
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
              <TrendsCharts type="sectors" />
              <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <div className="text-sm">Financial (28%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="text-sm">Government (22%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="text-sm">Healthcare (18%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="text-sm">Technology (15%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <div className="text-sm">Education (10%)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                  <div className="text-sm">Other (7%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


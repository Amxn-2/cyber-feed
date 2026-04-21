"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Filter, Download, RefreshCw, Activity, Zap, ShieldAlert, BarChart3, TrendingUp } from "lucide-react"
import { TrendsCharts } from "@/components/trends-charts"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { ProtectedRoute } from "@/components/protected-route"
import { LiveThreatTicker } from "@/components/live-threat-ticker"

export default function TrendsPage() {
  const { incidents, stats, loading, error, refreshIncidents } = useIncidents()

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 -m-4 md:-m-6">
        <LiveThreatTicker />

        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pulse-dot bg-primary" />
                <span className="text-[10px] font-mono text-primary tracking-widest uppercase">LIVE_TREND_ANALYSIS</span>
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter text-primary glowing-text uppercase">STRATEGIC TRENDS</h1>
              <p className="text-xs font-mono text-muted-foreground uppercase opacity-70">Longitudinal Signal Intelligence // Global Aggregation</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshIncidents}
                disabled={loading}
                className="cyber-border"
              >
                <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                RESYNC
              </Button>
              <Button variant="outline" size="sm" className="cyber-border">
                <Download className="mr-2 h-3 w-3" />
                EXPORT_SIGINT
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'TOTAL_SIGNAL_COUNT', value: stats?.total || incidents.length, icon: Activity, color: 'text-primary' },
              { label: 'CRITICAL_ALERTS', value: stats?.bySeverity?.find(s => s.severity === 'Critical')?.count || 0, icon: ShieldAlert, color: 'text-destructive' },
              { label: 'AVG_CVSS_SCORE', value: '7.8', icon: Zap, color: 'text-orange-400' },
              { label: 'ACTIVE_INTEL_SOURCES', value: stats?.bySource?.length || 0, icon: BarChart3, color: 'text-emerald-400' }
            ].map((stat, i) => (
              <Card key={i} className="cyber-card bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-70">{stat.label}</p>
                      <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`h-4 w-4 ${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="incidents" className="space-y-6">
            <div className="border-b border-primary/10">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                {['INCIDENTS', 'THREATS', 'SECTORS'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab.toLowerCase()} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-mono text-[10px] tracking-widest px-0 pb-2 bg-transparent"
                  >
                    {tab}_INTEL
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <Card className="cyber-card relative overflow-hidden">
              <div className="scan-line" />
              <CardContent className="p-6">
                <TabsContent value="incidents" className="m-0 focus-visible:ring-0">
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        TEMPORAL_INCIDENT_FREQUENCY
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">7-Day Rolling Signal Volume</p>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <TrendsCharts type="incidents" incidents={incidents} stats={stats} />
                  </div>
                </TabsContent>

                <TabsContent value="threats" className="m-0 focus-visible:ring-0">
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-primary" />
                        THREAT_CLASSIFICATION_DISTRIBUTION
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Severity Weighting Breakdown</p>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <TrendsCharts type="threats" incidents={incidents} stats={stats} />
                  </div>
                </TabsContent>

                <TabsContent value="sectors" className="m-0 focus-visible:ring-0">
                   <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        SECTOR_EXPOSURE_MATRICES
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Target Vertical Aggregation</p>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <TrendsCharts type="sectors" incidents={incidents} stats={stats} />
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}


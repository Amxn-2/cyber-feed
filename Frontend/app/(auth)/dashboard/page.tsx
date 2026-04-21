"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Bell, Download, Filter, Shield, Zap, RefreshCw, Activity, Target, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardCharts } from "@/components/dashboard-charts"
import { ProtectedRoute } from "@/components/protected-route"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { formatDistanceToNow, format } from "date-fns"
import { AIAnalysis } from "@/components/ai-analysis"
import { LiveThreatTicker } from "@/components/live-threat-ticker"
import { IncidentDetailModal } from "@/components/incident-detail-modal"
import { Incident } from "@/lib/api"

export default function DashboardPage() {
  const { incidents, stats, loading, collecting, refreshIncidents, collectData } = useIncidents({
    limit: 20
  })

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 -m-4 md:-m-6">
        <LiveThreatTicker />
        
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-primary glowing-text">CYBER COMMAND CENTER</h1>
              <p className="text-xs font-mono text-muted-foreground uppercase opacity-70">Strategic Intelligence Dashboard // Location: India</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshIncidents}
                className="cyber-border bg-card/50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                RESYNC
              </Button>

              <Button 
                onClick={collectData}
                disabled={collecting}
                className="bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                size="sm"
              >
                <Zap className={`mr-2 h-4 w-4 ${collecting ? 'animate-pulse' : ''}`} />
                {collecting ? 'SCANNING...' : 'NEW SCAN'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "NET THREATS", val: stats?.total || 0, icon: Activity, sub: `${stats?.today || 0} TODAY`, color: "text-primary" },
              { label: "7D MOMENTUM", val: stats?.recent || 0, icon: Zap, sub: "ACTIVE VECTORS", color: "text-emerald-400" },
              { label: "CRITICAL NODES", val: stats?.bySeverity?.find(s => s.severity === 'Critical')?.count || 0, icon: ShieldAlert, sub: "IMMEDIATE ATTENTION", color: "text-destructive" },
              { label: "INTEL SOURCES", val: stats?.bySource?.length || 0, icon: Target, sub: "VERIFIED API", color: "text-blue-400" }
            ].map((s, i) => (
              <Card key={i} className="cyber-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <s.icon className="h-12 w-12" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-[10px] font-mono tracking-widest uppercase">{s.label}</CardDescription>
                  <CardTitle className={`text-3xl font-black ${s.color} glowing-text`}>{loading ? "..." : s.val}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] font-mono text-muted-foreground">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4 cyber-card border-l-4 border-l-primary/50 relative flex flex-col h-[600px]">
              <div className="scan-line" />
              <CardHeader className="flex flex-row items-center justify-between flex-none">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(0,212,255,0.8)]" />
                    <span className="text-[10px] font-mono text-primary tracking-[0.2em] uppercase">LIVE_TACTICAL_DATA</span>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight">TACTICAL FEED</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-mono opacity-50">Pulse monitoring // Sequential ingestion</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] font-mono opacity-50 border border-primary/10 hover:bg-primary/5">VIEW_ALL</Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 w-full animate-pulse bg-muted/20 rounded-lg" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Increased limit to show scrolling */}
                    {incidents.map((incident) => (
                      <div 
                        key={incident._id} 
                        onClick={() => setSelectedIncident(incident)}
                        className="group relative flex items-center gap-4 rounded-lg border border-primary/5 p-4 bg-card/30 hover:bg-primary/10 transition-all cyber-table-row cursor-pointer active:scale-[0.98]"
                      >
                        <div className={`w-1 self-stretch rounded-full ${
                          incident.severity === 'Critical' ? 'bg-destructive shadow-[0_0_8px_hsl(var(--threat-critical))]' :
                          incident.severity === 'High' ? 'bg-orange-500' : 'bg-primary'
                        }`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-primary/60">ID:{incident._id.slice(-6).toUpperCase()}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-tighter ${
                              incident.severity === 'Critical' ? 'border-destructive/30 text-destructive' : 'border-primary/30 text-primary'
                            }`}>{incident.severity.toUpperCase()}</span>
                          </div>
                          <p className="text-sm font-bold leading-none tracking-tight group-hover:text-primary transition-colors uppercase">
                            {incident.title}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-70">
                            SIG:{incident.source.slice(0,10)} // CAT:{incident.category}
                          </p>
                        </div>
                        <div className="text-[9px] font-mono text-muted-foreground/40 whitespace-nowrap">
                          {formatDistanceToNow(new Date(incident.published_date)).toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
              <Card className="cyber-card flex-1 flex flex-col min-h-[400px]">
                <CardHeader className="flex-none">
                   <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">VECTOR_ANALYSIS</span>
                  </div>
                  <CardTitle className="text-xl font-bold uppercase italic">Threat Vectors</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <Tabs defaultValue="severity" className="h-full flex flex-col">
                    <TabsList className="bg-transparent h-auto p-0 gap-4 border-b border-primary/10 rounded-none mb-4">
                      {['SEVERITY', 'SOURCES', 'MITRE'].map(t => (
                        <TabsTrigger 
                          key={t}
                          value={t.toLowerCase()} 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-mono text-[9px] px-0 pb-1 uppercase tracking-widest"
                        >
                          {t}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="severity" className="flex-1 min-h-[250px] m-0">
                      <DashboardCharts stats={stats} />
                    </TabsContent>
                    <TabsContent value="sources" className="flex-1 min-h-[250px] m-0">
                      <DashboardCharts type="sources" stats={stats} />
                    </TabsContent>
                    <TabsContent value="mitre" className="flex-1 min-h-[250px] m-0">
                      <DashboardCharts type="mitre" stats={stats} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card className="cyber-card relative overflow-hidden bg-primary/5 border-primary/20 flex-none">
                <CardHeader>
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">STRATEGIC_INSIGHT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-xs italic text-primary/80 leading-relaxed font-mono uppercase">
                      Analysis indicates high-probability credential harvesting campaign targeting government nodes using phishing vectors.
                    </p>
                    <Button variant="outline" className="w-full text-[10px] cyber-border text-primary uppercase font-bold tracking-widest h-8">Full Analysis Dossier</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <IncidentDetailModal 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
        />
      </div>
    </ProtectedRoute>
  )
}


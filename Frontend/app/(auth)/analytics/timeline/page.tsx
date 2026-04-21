"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, History, Calendar, Clock, Layers } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { format, formatDistanceToNow } from "date-fns"
import { LiveThreatTicker } from "@/components/live-threat-ticker"

export default function TimelinePage() {
  const { incidents, loading, error, refreshIncidents } = useIncidents()

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 -m-4 md:-m-6">
        <LiveThreatTicker />

        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <History className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-mono text-primary tracking-widest uppercase">HISTORICAL_TIMELINE</span>
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter text-primary glowing-text uppercase">INCIDENT CHRONOLOGY</h1>
              <p className="text-xs font-mono text-muted-foreground uppercase opacity-70">Temporal Signal Audit // Sequential Threat Mapping</p>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 cyber-border px-2 py-1 bg-card/30">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10">
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-[10px] font-mono text-primary px-2">{format(new Date(), 'MMM_yyyy').toUpperCase()}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10">
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshIncidents}
                disabled={loading}
                className="cyber-border ml-2"
              >
                <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                SYNC
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <div className="border-b border-primary/10">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab.toLowerCase()} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-mono text-[10px] tracking-widest px-0 pb-2 bg-transparent uppercase"
                  >
                    {tab}_SEVERITY
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0 focus-visible:ring-0">
               {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_15px_rgba(0,212,255,0.5)]"></div>
                </div>
              ) : (
                <div className="relative space-y-6 before:absolute before:inset-0 before:left-[11px] before:border-l before:border-primary/20 pl-8">
                  {incidents
                    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
                    .map((incident, i) => (
                      <div key={incident._id} className="relative group">
                        {/* Timeline Node */}
                        <div className={`absolute -left-[30px] mt-1.5 h-[15px] w-[15px] rounded-full border-2 border-background z-10 ${
                            incident.severity === 'Critical' ? 'bg-destructive shadow-[0_0_10px_rgba(255,59,59,0.5)]' : 
                            incident.severity === 'High' ? 'bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.5)]' : 
                            'bg-primary shadow-[0_0_10px_rgba(0,212,255,0.5)]'
                        }`}>
                            <div className="absolute inset-0 animate-ping rounded-full bg-inherit opacity-20" />
                        </div>
                        
                        <Card className="cyber-card bg-card/30 group-hover:bg-primary/[0.03] transition-colors">
                          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                            {/* Timestamp */}
                            <div className="md:col-span-1 space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-mono text-primary uppercase">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(incident.published_date), 'yyyy-MM-dd')}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase opacity-70">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(incident.published_date), 'HH:mm:ss')} UTC
                                </div>
                                <div className="text-[9px] font-mono text-muted-foreground/50 uppercase mt-2">
                                    {formatDistanceToNow(new Date(incident.published_date)).toUpperCase()} AGO
                                </div>
                            </div>

                            {/* Content */}
                            <div className="md:col-span-3 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-sm font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                                        {incident.title}
                                    </h3>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                        incident.severity === 'Critical' ? 'border-destructive text-destructive' :
                                        incident.severity === 'High' ? 'border-orange-500 text-orange-500' : 'border-primary text-primary'
                                    }`}>
                                        {incident.severity.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {incident.description}
                                </p>
                                <div className="flex flex-wrap gap-4 pt-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                                        <Layers className="h-3 w-3 opacity-50" />
                                        SOURCE: <span className="text-primary/70">{incident.source.toUpperCase()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                                        <AlertTriangle className="h-3 w-3 opacity-50" />
                                        CAT: <span className="text-emerald-400/70">{incident.category.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}


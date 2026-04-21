"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Download, Filter, Search, RefreshCw, Layers, ShieldCheck, Cpu } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { formatDistanceToNow } from "date-fns"
import { IncidentDetailModal } from "@/components/incident-detail-modal"
import { Incident } from "@/lib/api"
import { LiveThreatTicker } from "@/components/live-threat-ticker"

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  
  const { incidents, loading, error, refreshIncidents } = useIncidents({
    limit: 50
  })

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident)
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = !searchQuery.trim() || 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.sector_tags?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesSearch
  })

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 -m-4 md:-m-6">
        <LiveThreatTicker />

        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-primary glowing-text uppercase">TACTICAL INCIDENT FEED</h1>
              <p className="text-xs font-mono text-muted-foreground uppercase opacity-70">Direct stream from Cyber Command // Verified Threats Only</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="EXECUTIVE SEARCH: ID, TITLE, OR SECTOR..."
                  className="pl-10 h-10 w-full md:w-80 bg-card/50 cyber-border font-mono text-[10px] tracking-widest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshIncidents}
                disabled={loading}
                className="cyber-border"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                RESYNC
              </Button>
            </div>
          </div>

          <Card className="cyber-card overflow-hidden border-t-0 rounded-t-none relative">
            <div className="scan-line" />
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b-primary/10 hover:bg-transparent">
                    <TableHead className="w-[100px] font-mono text-[10px] tracking-tighter uppercase text-primary/60">SEVERITY</TableHead>
                    <TableHead className="w-[120px] font-mono text-[10px] tracking-tighter uppercase text-primary/60">SECTOR</TableHead>
                    <TableHead className="font-mono text-[10px] tracking-tighter uppercase text-primary/60">INCIDENT_IDENTIFIER & SUMMARY</TableHead>
                    <TableHead className="w-[150px] font-mono text-[10px] tracking-tighter uppercase text-primary/60">MITRE_TACTIC</TableHead>
                    <TableHead className="w-[120px] font-mono text-[10px] tracking-tighter uppercase text-primary/60 text-right">TIMESTAMP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1,2,3,4,5,6,7,8].map(i => (
                      <TableRow key={i} className="animate-pulse opacity-50">
                        <TableCell colSpan={5} className="h-16 bg-muted/5" />
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-destructive font-mono text-xs">
                        CRITICAL_ERROR: SYSTEM_LINK_FAILURE // {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredIncidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-mono text-xs">
                        NO_MATCHES_FOUND_IN_DATABANKS
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIncidents.map((incident) => (
                      <TableRow 
                        key={incident._id} 
                        className="cyber-table-row border-b-primary/5 cursor-pointer group"
                        onClick={() => handleViewIncident(incident)}
                      >
                        <TableCell>
                          <div className={`flex items-center gap-2 font-bold text-[10px] ${
                            incident.severity === 'Critical' ? 'text-destructive' :
                            incident.severity === 'High' ? 'text-orange-500' : 'text-primary'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              incident.severity === 'Critical' ? 'bg-destructive pulse-dot' :
                              incident.severity === 'High' ? 'bg-orange-500' : 'bg-primary'
                            }`} />
                            {incident.severity.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {incident.sector_tags?.slice(0, 2).map((s, i) => (
                              <span key={i} className="text-[9px] font-mono bg-primary/10 text-primary px-1 border border-primary/20 rounded">
                                {s.toUpperCase()}
                              </span>
                            )) || <span className="text-[9px] font-mono opacity-30">GENERAL</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                              {incident.title.toUpperCase()}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                              <span className="text-primary/40">ID: {incident._id.slice(-8)}</span>
                              <span>//</span>
                              <span>{incident.source}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1">
                            {incident.mitre_techniques?.[0] ? (
                              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                                <Layers className="h-3 w-3" />
                                {incident.mitre_techniques[0].tactic.toUpperCase()}
                              </div>
                            ) : (
                                <span className="text-[10px] font-mono opacity-30 uppercase line-clamp-1">UNMAPPED</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(incident.published_date)).toUpperCase()} AGO
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      </div>
    </ProtectedRoute>
  )
}


"use client"

import { Download, Shield } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Incident } from "@/lib/api"

interface IncidentDetailModalProps {
  incident: Incident | null
  onClose: () => void
}

export function IncidentDetailModal({ incident, onClose }: IncidentDetailModalProps) {
  if (!incident) return null

  return (
    <Dialog open={!!incident} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="cyber-card w-[95vw] sm:max-w-6xl border-primary/20 bg-[#080c14]/98 backdrop-blur-2xl p-0 overflow-hidden gap-0">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header Section */}
          <div className="p-7 border-b border-primary/10 bg-primary/5 relative">
            <div className="scan-line" />
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 font-bold border ${
                  incident.severity === 'Critical' ? 'border-destructive text-destructive bg-destructive/10' : 'border-primary text-primary bg-primary/10'
                }`}>
                  {incident.severity.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                  INTEL_REPORT // NODE_{incident._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => incident.url && window.open(incident.url, '_blank')}
                className="text-[10px] font-mono h-8 cyber-border bg-transparent hover:bg-primary/20"
                disabled={!incident.url}
              >
                <Download className="mr-2 h-3 w-3" />
                DUMP_SOURCE
              </Button>
            </div>
            <DialogTitle className="text-4xl font-black italic tracking-tighter text-white leading-[1.05] uppercase max-w-[95%]">
              {incident.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Tactical intelligence report for {incident.title}
            </DialogDescription>
          </div>

          {/* Body Section */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Metadata */}
            <div className="w-80 border-r border-primary/10 p-7 space-y-8 overflow-y-auto custom-scrollbar bg-black/20">
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-primary tracking-[0.3em] uppercase opacity-80">Signal Metadata</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Source:</span>
                    <span className="text-[10px] font-mono text-white uppercase">{incident.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Published:</span>
                    <span className="text-[10px] font-mono text-white italic">{format(new Date(incident.published_date), 'yyyy-MM-dd')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Category:</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">{incident.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Intel Status:</span>
                    <span className={`text-[9px] font-mono font-black ${incident.is_verified ? 'text-emerald-400' : 'text-orange-500'}`}>
                      {incident.is_verified ? 'VERIFIED' : 'TRUE'}
                    </span>
                  </div>
                </div>
              </section>

              {incident.sector_tags && incident.sector_tags.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-[10px] font-mono font-bold text-orange-500 tracking-[0.3em] uppercase opacity-80">Sector Impact</h3>
                  <div className="flex flex-wrap gap-2">
                    {incident.sector_tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono px-2 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xs uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* {incident.mitre_techniques && incident.mitre_techniques.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-[10px] font-mono font-bold text-emerald-400 tracking-[0.3em] uppercase opacity-80">MITRE Mapping</h3>
                  <div className="space-y-2">
                    {incident.mitre_techniques.map((tech, idx) => (
                      <div key={idx} className="p-2 bg-emerald-400/5 border border-emerald-400/20 rounded-xs">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase">
                          {tech.technique_id} - {tech.technique}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )} */}
            </div>

            {/* Main Content - Summary */}
            <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-mono font-bold tracking-[0.3em] text-primary uppercase">Intelligence_Summary</h3>
                </div>
                <div className="h-0.5 w-12 bg-primary/30" />
              </div>
              
              <div className="space-y-8">
                <div className="prose prose-invert max-w-none">
                  <p className="text-xl font-bold leading-relaxed text-white font-mono uppercase tracking-tight selection:bg-primary/30">
                    {incident.description || "DANGER: INTELLIGENCE PURGED OR UNAVAILABLE FOR THIS NODE."}
                  </p>
                </div>

                <div className="p-6 border border-primary/20 bg-primary/5 rounded-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <h4 className="text-[10px] font-mono font-black text-primary tracking-widest uppercase mb-4">Tactical_Narrative</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-mono uppercase opacity-90">
                    Signal origin detected from {incident.source}. The payload shows characteristics of a targeted {incident.category} campaign. Current mitigation status: MONITORING. No immediate action required for non-affected nodes, but high-alert standing is advised for the {incident.sector_tags?.[0] || 'GENERAL'} sector.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                   <div className="space-y-1">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Correlation_Confidence</span>
                      <div className="flex gap-1">
                          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`h-1 flex-1 ${i <= 6 ? 'bg-primary' : 'bg-primary/20'}`} />)}
                      </div>
                   </div>
                   <div className="space-y-1 text-right">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Source_Reliability</span>
                      <p className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">High_Grade</p>
                   </div>
                </div>
              </div>

              <div className="pt-8">
                 <Button 
                  className="bg-primary text-primary-foreground font-black text-xs tracking-[0.3em] h-12 px-10 rounded-none uppercase shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:bg-primary/90 transition-all active:scale-[0.98]"
                  onClick={onClose}
                >
                  CLOSE_DOSSIER
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="px-6 py-3 border-t border-primary/10 bg-black flex justify-between items-center bg-black/40">
            <span className="text-[9px] font-mono text-muted-foreground/50 tracking-widest uppercase">
              SIG_HASH: {incident.hash?.toUpperCase() || 'UNA_SIG_D892'}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/50 tracking-widest uppercase">
              System_Time: {format(new Date(), 'HH:mm:ss')} UTC
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

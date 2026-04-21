'use client';

import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ExternalLink, Shield, Activity, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalMonitorPage() {
  // Use the external URL provided by the user (simulated here)
  const monitorUrl = "https://cyberfeedmap.vercel.app/"; // Placeholder, user will replace with actual if needed

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-primary glowing-text uppercase line-clamp-1">STRATEGIC GLOBAL MONITOR</h1>
              <p className="text-xs font-mono text-muted-foreground uppercase opacity-70">Cross-domain threat assessment // Cyber // Kinetic // Geopolitical</p>
            </div>
            <Button variant="outline" size="sm" className="cyber-border" asChild>
                <a href={monitorUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    OPEN FULLSCREEN
                </a>
            </Button>
        </div>

        <Card className="flex-1 cyber-card overflow-hidden relative border-primary/20">
          <div className="scan-line" />
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center -z-10">
             <div className="flex flex-col items-center gap-4 text-primary/20 animate-pulse">
                <Globe className="h-24 w-24" />
                <span className="font-mono text-sm tracking-widest">INITIALIZING GLOBAL MAPPING ENGINE...</span>
             </div>
          </div>
          <CardContent className="p-0 h-full">
            <iframe 
              src={monitorUrl} 
              className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
              title="Global Threat Map"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="cyber-card p-4 flex items-center gap-4 bg-primary/5">
                <div className="h-10 w-10 rounded bg-primary/20 flex items-center justify-center">
                    <Shield className="text-primary h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-mono opacity-60">GEOPOLITICAL_SYNC</p>
                    <p className="text-xs font-bold uppercase">ACTIVE</p>
                </div>
            </div>
            <div className="cyber-card p-4 flex items-center gap-4 bg-emerald-500/5">
                <div className="h-10 w-10 rounded bg-emerald-500/20 flex items-center justify-center">
                    <Activity className="text-emerald-500 h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-mono opacity-60">POLYMARKET_FEED</p>
                    <p className="text-xs font-bold uppercase">REALTIME TRENDS</p>
                </div>
            </div>
             <div className="cyber-card p-4 flex items-center gap-4 bg-destructive/5">
                <div className="h-10 w-10 rounded bg-destructive/20 flex items-center justify-center">
                    <ShieldAlert className="text-destructive h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-mono opacity-60">KINETIC_ALERTS</p>
                    <p className="text-xs font-bold uppercase">MONITORING CONFLICT ZONES</p>
                </div>
            </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

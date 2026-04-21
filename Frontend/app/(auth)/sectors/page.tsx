'use client';

import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSectors } from "@/lib/hooks/useSectors";
import { ShieldAlert, TrendingUp, Activity, Lock } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line 
} from "recharts";

export default function SectorRiskPage() {
  const { sectors, history, loading } = useSectors();

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-destructive";
    if (score >= 50) return "text-orange-500";
    if (score >= 20) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "CRITICAL";
    if (score >= 50) return "HIGH";
    if (score >= 20) return "MODERATE";
    return "LOW";
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-primary glowing-text">SECTORAL RISK ANALYSIS</h1>
          <p className="text-xs font-mono text-muted-foreground uppercase opacity-70">Impact assessment across critical Indian infrastructure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3,4,5,6].map(i => <div key={i} className="h-48 cyber-card animate-pulse" />)
          ) : (
            sectors.map((s, i) => (
              <Card key={i} className="cyber-card group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Lock className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-mono tracking-widest text-primary uppercase">{s.sector}</CardTitle>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-current ${getRiskColor(s.score)}`}>
                      {getRiskLabel(s.score)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black tracking-tighter ${getRiskColor(s.score)}`}>
                      {s.score}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground pb-1">RISK_INDEX / 100</span>
                  </div>

                  <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        s.score >= 80 ? 'bg-destructive' : s.score >= 50 ? 'bg-orange-500' : 'bg-primary'
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono opacity-60">
                    <span>ACTIVE_INCIDENTS: {s.incident_count}</span>
                    <span>TREND: {s.score > 50 ? 'STABLE' : 'IMPROVING'}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-tight">CUMULATIVE RISK TREND (7D)</CardTitle>
              <CardDescription>Sector-specific exposure history</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={3} dot={{ r: 4, fill: '#00d4ff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="cyber-card border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-tight">CRITICAL INFRASTRUCTURE MATRIX</CardTitle>
              <CardDescription>Inter-sector vulnerability correlation</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectors}>
                  <XAxis dataKey="sector" stroke="#64748b" fontSize={8} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Bar dataKey="score" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

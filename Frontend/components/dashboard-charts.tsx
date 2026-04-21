"use client"
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from "recharts"
import { IncidentStats, Incident } from "@/lib/api"

interface DashboardChartsProps {
  type?: "distribution" | "trends" | "sources" | "mitre"
  stats?: IncidentStats | null
  incidents?: Incident[]
}

export function DashboardCharts({ type = "distribution", stats, incidents }: DashboardChartsProps) {
  if (type === "trends") {
    return <TrendAnalysisChart incidents={incidents} />
  }
  
  if (type === "sources") {
    return <SourceDistributionChart stats={stats} />
  }

  if (type === "mitre") {
    return <MitreTacticChart stats={stats} />
  }

  return <ThreatDistributionChart stats={stats} />
}

function ThreatDistributionChart({ stats }: { stats?: IncidentStats | null }) {
  const data = stats?.bySeverity?.map((severity) => ({
    name: severity.severity.toUpperCase(),
    value: severity.count,
    color: severity.severity === 'Critical' ? '#ff3b3b' :
           severity.severity === 'High' ? '#ffa500' :
           severity.severity === 'Medium' ? '#00d4ff' :
           '#10b981'
  })) || []

  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">Global_Load</span>
        <span className="text-3xl font-black text-primary tracking-tighter">{total}</span>
        <span className="text-[8px] font-mono text-primary/60 tracking-widest uppercase">Nodes</span>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={8}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={450}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                fillOpacity={0.9}
                className="hover:fill-opacity-100 transition-all duration-300 outline-none"
                style={{ filter: `drop-shadow(0 0 5px ${entry.color}44)` }}
              />
            ))}
          </Pie>
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                return (
                  <div className="bg-slate-950/90 border border-primary/20 p-2 rounded shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] font-mono text-primary font-bold">{item.name}</p>
                    <p className="text-xs font-black text-white">{item.value} INCIDENTS</p>
                    <div className="h-1 w-full bg-primary/10 mt-1">
                      <div className="h-full bg-primary" style={{ width: `${(Number(item.value) / total * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center justify-between border-b border-primary/5 pb-1">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[9px] font-mono text-muted-foreground uppercase">{entry.name}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-primary">
              {((entry.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SourceDistributionChart({ stats }: { stats?: IncidentStats | null }) {
  const data = stats?.bySource?.map((source, index) => ({
    name: source.source.toUpperCase(),
    value: source.count,
    color: ['#00d4ff', '#10b981', '#a855f7', '#fbbf24', '#f43f5e'][index % 5]
  })) || []

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              borderColor: "rgba(0, 212, 255, 0.2)",
            }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "9px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function MitreTacticChart({ stats }: { stats?: IncidentStats | null }) {
    const data = stats?.byMitreTactic?.map(t => ({
        name: t.tactic.split(' ')[0].toUpperCase(),
        count: t.count
    })) || [];

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" fontSize={8} stroke="#64748b" />
                    <YAxis fontSize={8} stroke="#64748b" />
                    <Tooltip 
                         contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(0, 212, 255, 0.2)" }}
                    />
                    <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} opacity={0.6} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

function TrendAnalysisChart({ incidents }: { incidents?: Incident[] }) {
  const generateTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => {
      const dayIncidents = incidents?.filter(incident => 
        incident.published_date.startsWith(date)
      ) || []

      return {
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        CRITICAL: dayIncidents.filter(i => i.severity === 'Critical').length,
        HIGH: dayIncidents.filter(i => i.severity === 'High').length,
        NORMAL: dayIncidents.filter(i => i.severity !== 'Critical' && i.severity !== 'High').length,
      }
    })
  }

  const data = generateTrendData()

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="day" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
          <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              borderColor: "rgba(0, 212, 255, 0.2)",
              borderRadius: "8px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey="CRITICAL"
            stroke="#ff3b3b"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="HIGH"
            stroke="#ffa500"
            strokeWidth={2}
            dot={false}
          />
           <Line
            type="monotone"
            dataKey="NORMAL"
            stroke="#00d4ff"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


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
} from "recharts"
import { IncidentStats, Incident } from "@/lib/api"

interface DashboardChartsProps {
  type?: "distribution" | "trends" | "sources"
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

  return <ThreatDistributionChart stats={stats} />
}

function ThreatDistributionChart({ stats }: { stats?: IncidentStats | null }) {
  const data = stats?.bySeverity?.map((severity) => ({
    name: severity.severity,
    value: severity.count,
    color: severity.severity === 'Critical' ? '#ef4444' :
           severity.severity === 'High' ? '#eab308' :
           severity.severity === 'Medium' ? '#3b82f6' :
           '#22c55e'
  })) || [
    { name: "Critical", value: 0, color: "#ef4444" },
    { name: "High", value: 0, color: "#eab308" },
    { name: "Medium", value: 0, color: "#3b82f6" },
    { name: "Low", value: 0, color: "#22c55e" },
  ]

  return (
    <div className="h-[300px] w-full p-4">
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, "Percentage"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function SourceDistributionChart({ stats }: { stats?: IncidentStats | null }) {
  const data = stats?.bySource?.map((source, index) => ({
    name: source.source,
    value: source.count,
    color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'][index % 5]
  })) || []

  return (
    <div className="h-[300px] w-full p-4">
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}`, "Incidents"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendAnalysisChart({ incidents }: { incidents?: Incident[] }) {
  // Generate trend data from incidents (last 7 days)
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
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        critical: dayIncidents.filter(i => i.severity === 'Critical').length,
        high: dayIncidents.filter(i => i.severity === 'High').length,
        medium: dayIncidents.filter(i => i.severity === 'Medium').length,
        low: dayIncidents.filter(i => i.severity === 'Low').length,
      }
    })
  }

  const data = generateTrendData()

  return (
    <div className="h-[400px] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey="critical"
            name="Critical"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="high"
            name="High"
            stroke="#eab308"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="medium"
            name="Medium"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


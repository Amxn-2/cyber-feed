"use client"
import {
  Bar,
  BarChart,
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
import { Incident, IncidentStats } from "@/lib/api"

interface TrendsChartsProps {
  type?: "incidents" | "threats" | "sectors"
  incidents?: Incident[]
  stats?: IncidentStats | null
}

export function TrendsCharts({ type = "incidents", incidents = [], stats }: TrendsChartsProps) {
  if (type === "threats") {
    return <ThreatTypesChart stats={stats} />
  }

  if (type === "sectors") {
    return <SectorDistributionChart stats={stats} />
  }

  return <IncidentFrequencyChart incidents={incidents} />
}

function IncidentFrequencyChart({ incidents }: { incidents: Incident[] }) {
  // Generate trend data from incidents for the last 7 days
  const generateTrendData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const dayIncidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.published_date)
        return incidentDate.toDateString() === date.toDateString()
      })
      
      const critical = dayIncidents.filter(incident => incident.severity === 'Critical').length
      const high = dayIncidents.filter(incident => incident.severity === 'High').length
      const medium = dayIncidents.filter(incident => incident.severity === 'Medium').length
      
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        critical,
        high,
        medium
      })
    }
    
    return data
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
            dataKey="day"
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

function ThreatTypesChart({ stats }: { stats?: IncidentStats | null }) {
  const data = stats?.bySeverity ? stats.bySeverity.map(item => ({
    name: item.severity,
    value: item.count,
    color: item.severity === 'Critical' ? "#ef4444" : 
           item.severity === 'High' ? "#eab308" :
           item.severity === 'Medium' ? "#3b82f6" : "#22c55e"
  })) : [
    { name: "Critical", value: 0, color: "#ef4444" },
    { name: "High", value: 0, color: "#eab308" },
    { name: "Medium", value: 0, color: "#3b82f6" },
    { name: "Low", value: 0, color: "#22c55e" },
  ]

  return (
    <div className="h-[400px] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
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

function SectorDistributionChart({ stats }: { stats?: IncidentStats | null }) {
  const data = stats?.bySource ? stats.bySource.map((item, index) => ({
    name: item.source,
    value: item.count,
    color: ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#6b7280"][index % 6]
  })) : [
    { name: "No Data", value: 0, color: "#6b7280" },
  ]

  return (
    <div className="h-[400px] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 70,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
            domain={[0, "dataMax + 5"]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
            width={60}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Percentage"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


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

interface TrendsChartsProps {
  type?: "incidents" | "threats" | "sectors"
}

export function TrendsCharts({ type = "incidents" }: TrendsChartsProps) {
  if (type === "threats") {
    return <ThreatTypesChart />
  }

  if (type === "sectors") {
    return <SectorDistributionChart />
  }

  return <IncidentFrequencyChart />
}

function IncidentFrequencyChart() {
  const data = [
    { month: "Jan", critical: 12, high: 24, medium: 45 },
    { month: "Feb", critical: 15, high: 28, medium: 52 },
    { month: "Mar", critical: 18, high: 32, medium: 48 },
    { month: "Apr", critical: 14, high: 38, medium: 58 },
    { month: "May", critical: 22, high: 35, medium: 62 },
    { month: "Jun", critical: 19, high: 42, medium: 55 },
    { month: "Jul", critical: 25, high: 38, medium: 65 },
    { month: "Aug", critical: 28, high: 45, medium: 68 },
    { month: "Sep", critical: 22, high: 48, medium: 72 },
    { month: "Oct", critical: 18, high: 52, medium: 75 },
    { month: "Nov", critical: 24, high: 48, medium: 80 },
    { month: "Dec", critical: 30, high: 55, medium: 85 },
  ]

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

function ThreatTypesChart() {
  const data = [
    { name: "Ransomware", value: 32, color: "#ef4444" },
    { name: "DDoS", value: 24, color: "#3b82f6" },
    { name: "Phishing", value: 18, color: "#22c55e" },
    { name: "Data Breach", value: 14, color: "#eab308" },
    { name: "Malware", value: 8, color: "#a855f7" },
    { name: "Other", value: 4, color: "#6b7280" },
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

function SectorDistributionChart() {
  const data = [
    { name: "Financial", value: 28, color: "#3b82f6" },
    { name: "Government", value: 22, color: "#ef4444" },
    { name: "Healthcare", value: 18, color: "#22c55e" },
    { name: "Technology", value: 15, color: "#eab308" },
    { name: "Education", value: 10, color: "#a855f7" },
    { name: "Other", value: 7, color: "#6b7280" },
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


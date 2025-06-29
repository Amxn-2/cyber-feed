"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Download, Filter, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProtectedRoute } from "@/components/protected-route"

const initialIncidents = [
  {
    severity: "Critical",
    type: "Ransomware",
    target: "Financial Institution",
    source: "CERT-In",
    detected: "2 hours ago",
    status: "Active",
  },
  {
    severity: "High",
    type: "DDoS",
    target: "Government Portal",
    source: "NCIIPC",
    detected: "5 hours ago",
    status: "Mitigated",
  },
  {
    severity: "Medium",
    type: "Data Breach",
    target: "Healthcare Provider",
    source: "Social Media",
    detected: "Yesterday",
    status: "Investigating",
  },
  {
    severity: "High",
    type: "Phishing Campaign",
    target: "Multiple Organizations",
    source: "CERT-In",
    detected: "2 days ago",
    status: "Contained",
  },
  {
    severity: "Critical",
    type: "Zero-day Exploit",
    target: "Technology Company",
    source: "Threat Intelligence",
    detected: "3 days ago",
    status: "Patched",
  },
]

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [incidents, setIncidents] = useState(initialIncidents)
  const [filters, setFilters] = useState({
    severity: {
      Critical: true,
      High: true,
      Medium: true,
    },
    status: {
      Active: true,
      Mitigated: true,
      Investigating: true,
      Contained: true,
      Patched: true,
    },
  })

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search is empty, just apply filters
      applyFilters()
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = initialIncidents.filter((incident) => {
      // Check if incident matches search query
      const matchesSearch =
        incident.type.toLowerCase().includes(query) ||
        incident.target.toLowerCase().includes(query) ||
        incident.source.toLowerCase().includes(query) ||
        incident.status.toLowerCase().includes(query)

      // Check if incident matches filters
      const matchesFilters = filters.severity[incident.severity] && filters.status[incident.status]

      return matchesSearch && matchesFilters
    })

    setIncidents(filtered)
  }

  const applyFilters = () => {
    const filtered = initialIncidents.filter(
      (incident) => filters.severity[incident.severity] && filters.status[incident.status],
    )
    setIncidents(filtered)
  }

  const toggleFilter = (category: "severity" | "status", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [value]: !prev[category][value],
      },
    }))
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Incidents</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Severity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.severity.Critical}
                  onCheckedChange={() => toggleFilter("severity", "Critical")}
                >
                  Critical
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.severity.High}
                  onCheckedChange={() => toggleFilter("severity", "High")}
                >
                  High
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.severity.Medium}
                  onCheckedChange={() => toggleFilter("severity", "Medium")}
                >
                  Medium
                </DropdownMenuCheckboxItem>

                <DropdownMenuLabel className="mt-2">Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.status.Active}
                  onCheckedChange={() => toggleFilter("status", "Active")}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.Mitigated}
                  onCheckedChange={() => toggleFilter("status", "Mitigated")}
                >
                  Mitigated
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.Investigating}
                  onCheckedChange={() => toggleFilter("status", "Investigating")}
                >
                  Investigating
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.Contained}
                  onCheckedChange={() => toggleFilter("status", "Contained")}
                >
                  Contained
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status.Patched}
                  onCheckedChange={() => toggleFilter("status", "Patched")}
                >
                  Patched
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <div className="flex items-center justify-between p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        severity: {
                          Critical: true,
                          High: true,
                          Medium: true,
                        },
                        status: {
                          Active: true,
                          Mitigated: true,
                          Investigating: true,
                          Contained: true,
                          Patched: true,
                        },
                      })
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      applyFilters()
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search incidents..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>A comprehensive list of cyber incidents detected across Indian cyberspace</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            incident.severity === "Critical"
                              ? "text-red-500"
                              : incident.severity === "High"
                                ? "text-amber-500"
                                : "text-blue-500"
                          }`}
                        />
                        <span>{incident.severity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{incident.type}</TableCell>
                    <TableCell>{incident.target}</TableCell>
                    <TableCell>{incident.source}</TableCell>
                    <TableCell>{incident.detected}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          incident.status === "Active"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : incident.status === "Mitigated"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : incident.status === "Investigating"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : incident.status === "Contained"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {incident.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {incidents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No incidents found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}


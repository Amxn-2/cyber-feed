"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Download, Filter, Search, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProtectedRoute } from "@/components/protected-route"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { formatDistanceToNow } from "date-fns"
import { IncidentDetailModal } from "@/components/incident-detail-modal"
import { Incident } from "@/lib/api"


export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  
  // Use real data from backend
  const { incidents, loading, error, refreshIncidents, collectData } = useIncidents({
    limit: 50
  })
  
  const [filters, setFilters] = useState({
    severity: {
      Critical: true,
      High: true,
      Medium: true,
      Low: true,
    },
    source: {
      'CERT-In': true,
      'Economic Times CISO': true,
      'The Hacker News': true,
      'Business Standard': true,
    },
  })


  const toggleFilter = (category: "severity" | "source", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [value]: !(prev[category] as Record<string, boolean>)[value],
      },
    }))
  }

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident)
    setDetailModalOpen(true)
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSeverity = filters.severity[incident.severity as keyof typeof filters.severity]
    const matchesSource = filters.source[incident.source as keyof typeof filters.source]
    const matchesSearch = !searchQuery.trim() || 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSeverity && matchesSource && matchesSearch
  })

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Incidents</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze cyber security incidents in real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshIncidents}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                          Low: true,
                        },
                        source: {
                          'CERT-In': true,
                          'Economic Times CISO': true,
                          'The Hacker News': true,
                          'Business Standard': true,
                        },
                      })
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Filters are applied automatically via filteredIncidents
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

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search incidents by title, description, or category..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredIncidents.length} of {incidents.length} incidents
            </span>
          </div>
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
                  <TableHead className="w-[120px]">Severity</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[150px]">Source</TableHead>
                  <TableHead className="w-[120px]">Published</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-600">
                      Error loading incidents: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No incidents found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncidents.map((incident) => (
                    <TableRow key={incident._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              incident.severity === "Critical"
                                ? "text-red-500"
                                : incident.severity === "High"
                                  ? "text-amber-500"
                                  : incident.severity === "Medium"
                                    ? "text-blue-500"
                                    : "text-green-500"
                            }`}
                          />
                          <span>{incident.severity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{incident.category}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{incident.title}</TableCell>
                      <TableCell>{incident.source}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(incident.published_date))} ago</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewIncident(incident)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <IncidentDetailModal
          incident={selectedIncident}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />
      </div>
    </ProtectedRoute>
  )
}


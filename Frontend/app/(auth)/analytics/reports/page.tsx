import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Filter, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Monthly Incident Summary",
                  description: "Overview of all incidents from the past month",
                  date: "Generated on Mar 1, 2023",
                  type: "PDF",
                },
                {
                  title: "Ransomware Threat Analysis",
                  description: "Detailed analysis of ransomware threats",
                  date: "Generated on Feb 15, 2023",
                  type: "PDF",
                },
                {
                  title: "Financial Sector Vulnerabilities",
                  description: "Assessment of vulnerabilities in the financial sector",
                  date: "Generated on Feb 10, 2023",
                  type: "XLSX",
                },
                {
                  title: "Government Portal Security",
                  description: "Security assessment of government portals",
                  date: "Generated on Feb 5, 2023",
                  type: "PDF",
                },
                {
                  title: "Healthcare Data Breach Analysis",
                  description: "Analysis of recent healthcare data breaches",
                  date: "Generated on Jan 28, 2023",
                  type: "PDF",
                },
                {
                  title: "Quarterly Threat Intelligence",
                  description: "Comprehensive quarterly threat intelligence report",
                  date: "Generated on Jan 15, 2023",
                  type: "PPTX",
                },
              ].map((report, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{report.date}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm font-medium">{report.type}</div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Reports that are generated automatically on a schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">Scheduled reports will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Templates for generating custom reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">Report templates will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}


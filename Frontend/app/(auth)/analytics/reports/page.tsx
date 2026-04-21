"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Plus, FileSignature, Database, HardDrive, Share2, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { LiveThreatTicker } from "@/components/live-threat-ticker"
import { useIncidents } from "@/lib/hooks/useIncidents"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { incidents } = useIncidents()

  const generateReport = () => {
    if (!incidents || incidents.length === 0) {
      toast({
        title: "SIGNAL_VOID",
        description: "No intelligence data available for export.",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF()
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      
      // Cyber Header
      doc.setFillColor(8, 12, 20)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(0, 212, 255)
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.text("CYBERFEED INTELLIGENCE REPORT", 14, 25)
      
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`GENERATED: ${timestamp} UTC // CONFIDENTIAL_SIGINT`, 14, 35)

      // Summary Section
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.text("EXECUTIVE SUMMARY", 14, 55)
      doc.line(14, 57, 200, 57)
      
      doc.setFontSize(10)
      doc.text(`This document contains an automated aggregation of ${incidents.length} cyber incidents collected from global monitoring nodes. Detailed analysis of tactical trends, MITRE mappings, and sector-specific risk scoring follows.`, 14, 65, { maxWidth: 180 })

      // Statistics Table
      const tableData = incidents.slice(0, 20).map(inc => [
        inc.published_date ? format(new Date(inc.published_date), 'yyyy-MM-dd') : 'N/A',
        (inc.title || 'Untitled').substring(0, 50) + ((inc.title || '').length > 50 ? '...' : ''),
        (inc.severity || 'UNKNOWN').toUpperCase(),
        (inc.source || 'EXTERNAL').toUpperCase()
      ])

      autoTable(doc, {
        startY: 85,
        head: [['DATE', 'TITLE', 'SEVERITY', 'SOURCE']],
        body: tableData,
        headStyles: { fillColor: [0, 212, 255], textColor: [8, 12, 20], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      })

      doc.save(`CyberFeed_Intel_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
      toast({
        title: "REPORT_GENERATED",
        description: "Intelligence dossier has been exported successfully.",
        variant: "success"
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "EXPORT_FAILED",
        description: "Failed to generate PDF report.",
        variant: "destructive"
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 -m-4 md:-m-6">
        <LiveThreatTicker />

        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileSignature className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-mono text-primary tracking-widest uppercase">REPORT_GENERATION_ENGINE</span>
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter text-primary glowing-text uppercase">INTEL DOSSIERS</h1>
              <p className="text-xs font-mono text-muted-foreground uppercase opacity-70">Automated Signal Documentation // SIGINT Archival</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={generateReport}
                className="bg-primary text-background font-black italic uppercase tracking-tighter hover:bg-primary/90 transition-all rounded-none px-6"
              >
                <Plus className="mr-2 h-4 w-4" />
                GENERATE_NEW_DOSSIER
              </Button>
            </div>
          </div>

          <Tabs defaultValue="recent" className="space-y-6">
             <div className="border-b border-primary/10">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                {['RECENT', 'SCHEDULED', 'ARCHIVE'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab.toLowerCase()} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-mono text-[10px] tracking-widest px-0 pb-2 bg-transparent uppercase"
                  >
                    {tab}_FILES
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="recent" className="m-0 focus-visible:ring-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "MONTHLY_INCIDENT_SYNC", desc: "Global aggregation of signals for MAR_2023", size: "2.4MB", type: "PDF", icon: Database },
                  { title: "RANSOMWARE_VECTORS_Q1", desc: "Tactical analysis of encrypted file extortion", size: "1.1MB", type: "PDF", icon: HardDrive },
                  { title: "FINANCIAL_CORRIDOR_AUDIT", desc: "Vulnerability assessment of banking gateways", size: "4.8MB", type: "XLSX", icon: Share2 },
                ].map((report, i) => (
                  <Card key={i} className="cyber-card group overflow-hidden">
                    <div className="scan-line" />
                    <CardHeader className="pb-2">
                       <div className="flex justify-between items-start mb-2">
                        <report.icon className="h-4 w-4 text-primary opacity-50" />
                        <span className="text-[9px] font-mono text-primary/50">{report.type}</span>
                      </div>
                      <CardTitle className="text-sm font-black italic tracking-tighter text-primary group-hover:glowing-text transition-all">
                        {report.title}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground font-mono leading-tight uppercase opacity-70">
                        {report.desc}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2H_AGO</span>
                        <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {report.size}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        onClick={generateReport}
                        variant="outline" 
                        size="sm" 
                        className="w-full cyber-border text-[10px] font-mono tracking-widest hover:bg-primary/10"
                      >
                        <Download className="mr-2 h-3 w-3" />
                        ACCESS_FILE
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}


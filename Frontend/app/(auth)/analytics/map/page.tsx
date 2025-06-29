import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { ThreatMap } from "@/components/threat-map"
import { ProtectedRoute } from "@/components/protected-route"

export default function ThreatMapPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Threat Map</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="live" className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full h-auto inline-flex">
              <TabsTrigger value="live" className="flex-1">
                Live Map
              </TabsTrigger>
              <TabsTrigger value="historical" className="flex-1">
                Historical
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="flex-1">
                Heatmap
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="live" className="min-h-[500px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Threat Map</CardTitle>
                <CardDescription>Real-time visualization of cyber threats across Indian cyberspace</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden rounded-b-lg bg-muted">
                  <ThreatMap />
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-md bg-background/80 p-2 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span>Critical (24)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        <span>High (42)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>Medium (78)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Low (103)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Attack Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">China</div>
                      <div className="text-sm font-medium">32%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Russia</div>
                      <div className="text-sm font-medium">24%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">North Korea</div>
                      <div className="text-sm font-medium">18%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Unknown</div>
                      <div className="text-sm font-medium">26%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Most Targeted Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Delhi NCR</div>
                      <div className="text-sm font-medium">28%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Mumbai</div>
                      <div className="text-sm font-medium">22%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Bangalore</div>
                      <div className="text-sm font-medium">18%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Hyderabad</div>
                      <div className="text-sm font-medium">12%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Attack Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">DDoS</div>
                      <div className="text-sm font-medium">35%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Ransomware</div>
                      <div className="text-sm font-medium">28%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Phishing</div>
                      <div className="text-sm font-medium">22%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Other</div>
                      <div className="text-sm font-medium">15%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="historical" className="min-h-[500px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historical Threat Map</CardTitle>
                <CardDescription>View historical cyber threat data</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <ThreatMap historical={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="heatmap" className="min-h-[500px] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Threat Heatmap</CardTitle>
                <CardDescription>Intensity-based visualization of threat concentration</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <ThreatMap heatmap={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}


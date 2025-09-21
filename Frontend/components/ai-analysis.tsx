"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Loader2, AlertTriangle, TrendingUp, Shield, Target, Lightbulb } from "lucide-react"
import { api, ThreatSummary, IncidentInsights } from "@/lib/api"

interface AIAnalysisProps {
  type: 'threat-summary' | 'insights'
  className?: string
}

interface AnalysisSectionProps {
  icon: React.ReactNode
  title: string
  content: string
  color: string
}

function AnalysisSection({ icon, title, content, color }: AnalysisSectionProps) {
  // Format the content for better readability
  const formatContent = (text: string) => {
    if (!text) return "No information available.";
    
    // Clean up the text and improve formatting
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>') // Italic text
      .replace(/\n\n/g, '</p><p class="mt-3">') // Paragraph breaks
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/•/g, '<span class="text-blue-600">•</span>') // Bullet points
      .replace(/^\s*[-*]\s*/gm, '<span class="text-blue-600">•</span> ') // Convert dashes to bullets
      .replace(/(\d+\.\s)/g, '<br><span class="font-semibold text-blue-600">$1</span>') // Numbered lists
      .replace(/\*\*(\d+\.\s.*?)\*\*/g, '<div class="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-4 border-blue-500"><strong class="text-blue-700 dark:text-blue-300">$1</strong></div>') // Highlight numbered sections
    
    // Wrap in paragraph tags
    if (!formatted.startsWith('<p>')) {
      formatted = `<p class="text-muted-foreground leading-relaxed">${formatted}</p>`
    }
    
    return formatted
  }

  return (
    <div className="border rounded-lg p-5 bg-card hover:bg-muted/30 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 ${color}`}>
          {icon}
        </div>
        <h4 className="font-semibold text-lg text-foreground">{title}</h4>
      </div>
      <div 
        className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-em:text-muted-foreground prose-a:text-blue-600 prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  )
}

export function AIAnalysis({ type, className }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ThreatSummary | IncidentInsights | null>(null)
  const [aiAvailable, setAiAvailable] = useState(false)
  const [serviceInfo, setServiceInfo] = useState<any>(null)

  useEffect(() => {
    checkAIServiceStatus()
  }, [])

  const checkAIServiceStatus = async () => {
    try {
      const status = await api.getAIServiceStatus()
      setAiAvailable(status.available)
      setServiceInfo(status)
    } catch (error) {
      console.error('Failed to check AI service status:', error)
      setAiAvailable(false)
      setServiceInfo(null)
    }
  }

  const fetchAnalysis = async () => {
    if (!aiAvailable) return

    setLoading(true)
    setError(null)

    try {
      if (type === 'threat-summary') {
        const result = await api.getThreatSummary(7, 20)
        setData(result.summary)
      } else {
        const result = await api.getInsights(20)
        setData(result.insights)
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch AI analysis'
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          errorMessage = 'AI service quota exceeded. Please try again later.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'AI analysis timed out. Please try again.'
        } else if (error.message.includes('permission')) {
          errorMessage = 'AI service permission denied. Please check configuration.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!aiAvailable) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis
          </CardTitle>
          <CardDescription>
            Google Gemini AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              AI analysis service is not available. Please configure your Gemini API key in the backend.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} border-2 shadow-lg`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          AI Analysis
        </CardTitle>
        <CardDescription className="text-base">
          Google Gemini AI-powered insights for Indian cybersecurity
          {serviceInfo && (
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Model: {serviceInfo.model}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Cache: {serviceInfo.cache?.size || 0} entries
              </span>
            </div>
          )}
        </CardDescription>
        <div className="flex items-center gap-3 mt-4">
          <Button 
            onClick={fetchAnalysis} 
            disabled={loading}
            className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Analysis
              </>
            )}
          </Button>
          {data && (
            <Button 
              onClick={fetchAnalysis} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Loader2 className="mr-2 h-3 w-3" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      
      {loading && (
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
            <div className="animate-pulse bg-muted h-4 w-32 rounded"></div>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="animate-pulse bg-muted h-8 w-8 rounded-lg"></div>
                <div className="animate-pulse bg-muted h-6 w-32 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="animate-pulse bg-muted h-4 w-full rounded"></div>
                <div className="animate-pulse bg-muted h-4 w-3/4 rounded"></div>
                <div className="animate-pulse bg-muted h-4 w-1/2 rounded"></div>
              </div>
            </div>
          ))}
        </CardContent>
      )}

      {error && (
        <CardContent>
          <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}

      {data && !loading && (
        <CardContent className="space-y-6">
          {/* Confidence indicator */}
          {(data as any).confidence && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline" className="text-xs">
                Confidence: {(data as any).confidence}%
              </Badge>
              {(data as any).timestamp && (
                <span className="text-xs text-muted-foreground">
                  Generated: {new Date((data as any).timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
          
          {type === 'threat-summary' ? (
            <>
              <AnalysisSection
                icon={<TrendingUp className="h-4 w-4" />}
                title="Threat Landscape"
                content={(data as ThreatSummary).threatLandscape}
                color="text-blue-600"
              />
              
              <AnalysisSection
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Trending Threats"
                content={(data as ThreatSummary).trendingThreats}
                color="text-red-600"
              />
              
              <AnalysisSection
                icon={<Target className="h-4 w-4" />}
                title="Sector Analysis"
                content={(data as ThreatSummary).sectorAnalysis}
                color="text-orange-600"
              />
              
              <AnalysisSection
                icon={<Shield className="h-4 w-4" />}
                title="Recommendations"
                content={(data as ThreatSummary).recommendations}
                color="text-green-600"
              />
              
              <AnalysisSection
                icon={<Lightbulb className="h-4 w-4" />}
                title="Future Outlook"
                content={(data as ThreatSummary).futureOutlook}
                color="text-purple-600"
              />
            </>
          ) : (
            <>
              <AnalysisSection
                icon={<TrendingUp className="h-4 w-4" />}
                title="Pattern Analysis"
                content={(data as IncidentInsights).patternAnalysis}
                color="text-blue-600"
              />
              
              <AnalysisSection
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Risk Correlation"
                content={(data as IncidentInsights).riskCorrelation}
                color="text-red-600"
              />
              
              <AnalysisSection
                icon={<Target className="h-4 w-4" />}
                title="Impact Prediction"
                content={(data as IncidentInsights).impactPrediction}
                color="text-orange-600"
              />
              
              <AnalysisSection
                icon={<Shield className="h-4 w-4" />}
                title="Mitigation Strategies"
                content={(data as IncidentInsights).mitigationStrategies}
                color="text-green-600"
              />
              
              <AnalysisSection
                icon={<Lightbulb className="h-4 w-4" />}
                title="Intelligence Summary"
                content={(data as IncidentInsights).intelligenceSummary}
                color="text-purple-600"
              />
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

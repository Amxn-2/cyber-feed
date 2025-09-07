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

export function AIAnalysis({ type, className }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ThreatSummary | IncidentInsights | null>(null)
  const [aiAvailable, setAiAvailable] = useState(false)

  useEffect(() => {
    checkAIServiceStatus()
  }, [])

  const checkAIServiceStatus = async () => {
    try {
      const status = await api.getAIServiceStatus()
      setAiAvailable(status.available)
    } catch (error) {
      console.error('Failed to check AI service status:', error)
      setAiAvailable(false)
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
      setError(error instanceof Error ? error.message : 'Failed to fetch AI analysis')
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Analysis
        </CardTitle>
        <CardDescription>
          Google Gemini AI-powered insights for Indian cybersecurity
        </CardDescription>
        <Button 
          onClick={fetchAnalysis} 
          disabled={loading}
          className="w-fit"
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
      </CardHeader>
      
      {error && (
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}

      {data && (
        <CardContent className="space-y-6">
          {type === 'threat-summary' ? (
            <>
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Threat Landscape
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as ThreatSummary).threatLandscape}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Trending Threats
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as ThreatSummary).trendingThreats}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4" />
                  Sector Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as ThreatSummary).sectorAnalysis}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Recommendations
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as ThreatSummary).recommendations}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" />
                  Future Outlook
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as ThreatSummary).futureOutlook}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Pattern Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as IncidentInsights).patternAnalysis}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Correlation
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as IncidentInsights).riskCorrelation}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4" />
                  Impact Prediction
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as IncidentInsights).impactPrediction}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Mitigation Strategies
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as IncidentInsights).mitigationStrategies}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" />
                  Intelligence Summary
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(data as IncidentInsights).intelligenceSummary}
                </p>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

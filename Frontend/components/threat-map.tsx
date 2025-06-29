"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface ThreatMapProps {
  historical?: boolean
  heatmap?: boolean
}

export function ThreatMap({ historical = false, heatmap = false }: ThreatMapProps) {
  const { theme } = useTheme()
  const mapRef = React.useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = React.useState(false)

  React.useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Determine which map to show based on props
  const mapType = heatmap ? "heatmap" : historical ? "historical" : "live"
  const mapSrc = `/maps/india-${mapType}-${theme === "dark" ? "dark" : "light"}.svg`

  return (
    <div ref={mapRef} className="relative flex h-full w-full items-center justify-center bg-muted">
      {!mapLoaded ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      ) : (
        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={`/placeholder.svg?height=400&width=600`}
              alt={`India ${mapType} map`}
              width={600}
              height={400}
              className="h-full w-full object-contain"
            />

            {/* Overlay threat indicators */}
            <div className="absolute inset-0">
              {/* Delhi */}
              <div className="absolute left-[45%] top-[30%]">
                <ThreatIndicator severity={mapType === "live" ? "critical" : "high"} />
              </div>

              {/* Mumbai */}
              <div className="absolute left-[30%] top-[60%]">
                <ThreatIndicator severity="high" />
              </div>

              {/* Bangalore */}
              <div className="absolute left-[40%] top-[70%]">
                <ThreatIndicator severity="medium" />
              </div>

              {/* Chennai */}
              <div className="absolute left-[50%] top-[75%]">
                <ThreatIndicator severity="low" />
              </div>

              {/* Kolkata */}
              <div className="absolute left-[70%] top-[45%]">
                <ThreatIndicator severity="medium" />
              </div>

              {/* Hyderabad */}
              <div className="absolute left-[45%] top-[65%]">
                <ThreatIndicator severity="high" />
              </div>

              {/* Add more random threat indicators */}
              {Array.from({ length: 15 }).map((_, i) => {
                const left = 20 + Math.random() * 60
                const top = 20 + Math.random() * 60
                const severities = ["critical", "high", "medium", "low"] as const
                const severity = severities[Math.floor(Math.random() * severities.length)]

                return (
                  <div
                    key={i}
                    className={`absolute left-[${left}%] top-[${top}%]`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    <ThreatIndicator severity={severity} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ThreatIndicator({ severity }: { severity: "critical" | "high" | "medium" | "low" }) {
  const colors = {
    critical: "bg-red-500",
    high: "bg-amber-500",
    medium: "bg-blue-500",
    low: "bg-green-500",
  }

  const pulseColors = {
    critical: "bg-red-500/20",
    high: "bg-amber-500/20",
    medium: "bg-blue-500/20",
    low: "bg-green-500/20",
  }

  const sizes = {
    critical: "h-4 w-4",
    high: "h-3 w-3",
    medium: "h-2.5 w-2.5",
    low: "h-2 w-2",
  }

  const shouldPulse = severity === "critical" || severity === "high"

  return (
    <div className="relative flex items-center justify-center">
      <div className={`rounded-full ${colors[severity]} ${sizes[severity]}`}></div>

      {shouldPulse && (
        <>
          <div className={`absolute -inset-1 animate-pulse rounded-full ${pulseColors[severity]} opacity-75`}></div>
          <div className={`absolute -inset-2 animate-pulse rounded-full ${pulseColors[severity]} opacity-50`}></div>
        </>
      )}
    </div>
  )
}


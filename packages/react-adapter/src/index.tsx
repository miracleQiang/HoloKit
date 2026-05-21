import React, { useRef, useEffect } from 'react'

interface HoloChartProps {
  chartClass: any
  data: any[]
  theme?: string | object
  options?: Record<string, any>
  style?: React.CSSProperties
  className?: string
}

export function HoloChart({ chartClass: ChartClass, data, theme = 'cyberpunk', options = {}, style, className }: HoloChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = new ChartClass(containerRef.current, { ...options, theme, data })
    }
    return () => { chartRef.current?.dispose(); chartRef.current = null }
  }, [])

  useEffect(() => { chartRef.current?.setData(data) }, [data])
  useEffect(() => { chartRef.current?.setTheme(theme) }, [theme])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }} className={className} />
}

export default HoloChart

"use client"

import { useState, useEffect } from "react"

export function ActivityHeatmap() {
  const [heatmapData, setHeatmapData] = useState<number[][]>([])

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  useEffect(() => {
    // Generate mock heatmap data
    const mockData = days.map(() => 
      hours.map(() => Math.floor(Math.random() * 50))
    )
    setHeatmapData(mockData)
  }, [])

  const getHeatmapColor = (value: number) => {
    if (value === 0) return "bg-purple-900/20"
    if (value < 10) return "bg-purple-800/40"
    if (value < 20) return "bg-purple-700/60"
    if (value < 30) return "bg-purple-600/80"
    if (value < 40) return "bg-purple-500"
    return "bg-purple-400"
  }

  const maxValue = Math.max(...heatmapData.flat())

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max space-y-2">
        {/* Hour labels */}
        <div className="flex gap-1 pl-20">
          {hours.map((hour) => (
            <div key={hour} className="w-6 text-xs text-purple-300 text-center">
              {hour % 4 === 0 ? `${hour}:00` : ""}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center gap-1">
            <div className="w-20 text-sm text-purple-300 text-left">{day.slice(0, 3)}</div>
            {hours.map((hour) => {
              const value = heatmapData[dayIndex]?.[hour] || 0
              const intensity = maxValue > 0 ? value / maxValue : 0
              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className={`w-6 h-6 rounded ${getHeatmapColor(value)} hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer relative group`}
                  title={`${day} - ${hour}:00 - ${value} users`}
                >
                  {value > 30 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                      {value}
                    </div>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    {day} {hour}:00 - {value} users
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 pt-4 pl-20">
          <span className="text-xs text-purple-300">Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-purple-900/20" />
            <div className="w-4 h-4 rounded bg-purple-800/40" />
            <div className="w-4 h-4 rounded bg-purple-700/60" />
            <div className="w-4 h-4 rounded bg-purple-600/80" />
            <div className="w-4 h-4 rounded bg-purple-500" />
            <div className="w-4 h-4 rounded bg-purple-400" />
          </div>
          <span className="text-xs text-purple-300">More</span>
        </div>
      </div>
    </div>
  )
}

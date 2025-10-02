"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, Clock, Mic, TrendingUp } from "lucide-react"

interface ServerStats {
  totalUsers: number
  activeUsers: number
  currentVoiceUsers: number
  totalVoiceTime: number
  totalSessions: number
  averageSessionTime: number
}

interface StatsCardsProps {
  stats: ServerStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-black/20 border-purple-800/50 hover:border-purple-600/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-300">Total Members</CardTitle>
          <Users className="h-5 w-5 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{formatNumber(stats.totalUsers)}</div>
          <p className="text-xs text-purple-400 mt-1">
            {formatNumber(stats.activeUsers)} active members
          </p>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-purple-800/50 hover:border-purple-600/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-300">Voice Sessions</CardTitle>
          <Activity className="h-5 w-5 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{formatNumber(stats.totalSessions)}</div>
          <p className="text-xs text-purple-400 mt-1">completed voice sessions</p>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-purple-800/50 hover:border-purple-600/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-300">Total Voice Time</CardTitle>
          <Clock className="h-5 w-5 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{formatTime(stats.totalVoiceTime)}</div>
          <p className="text-xs text-purple-400 mt-1">
            avg: {formatTime(stats.averageSessionTime)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-purple-800/50 hover:border-purple-600/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-300">Currently Online</CardTitle>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Mic className="h-5 w-5 text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{formatNumber(stats.currentVoiceUsers)}</div>
          <p className="text-xs text-purple-400 mt-1">in voice channels now</p>
        </CardContent>
      </Card>
    </div>
  )
}

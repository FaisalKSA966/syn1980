'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  Gamepad2, 
  Mic, 
  Search,
  BarChart3,
  Calendar,
  Globe,
  Zap,
  Target,
  Award,
  Eye,
  MessageSquare
} from 'lucide-react'
import { ActivityHeatmap } from '@/components/activity-heatmap'
import { Leaderboard } from '@/components/leaderboard'
import { StatsCards } from '@/components/stats-cards'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  // Mock data for demonstration
  const serverStats = {
    totalUsers: 4827,
    activeUsers: 1243,
    currentVoiceUsers: 89,
    totalVoiceTime: 2847392,
    totalSessions: 15847,
    averageSessionTime: 1847
  }

  const users = [
    {
      id: '1',
      username: 'Ahmed_1980',
      avatar: '/placeholder-user.jpg',
      totalVoiceTime: 125847,
      totalSessions: 342,
      averageSessionTime: 368,
      lastSeen: '2024-01-15T10:30:00Z',
      favoriteChannels: [
        { name: 'General Voice', time: 45000, sessions: 120 },
        { name: 'Gaming Hub', time: 38000, sessions: 95 },
        { name: 'Study Room', time: 25000, sessions: 67 }
      ],
      topGames: [
        { name: 'Valorant', time: 28000, sessions: 45 },
        { name: 'Minecraft', time: 22000, sessions: 38 },
        { name: 'Apex Legends', time: 18000, sessions: 29 }
      ],
      activityScore: 95,
      rank: 1
    },
    {
      id: '2',
      username: 'Sarah_Dev',
      avatar: '/placeholder-user.jpg',
      totalVoiceTime: 98234,
      totalSessions: 287,
      averageSessionTime: 342,
      lastSeen: '2024-01-15T08:15:00Z',
      favoriteChannels: [
        { name: 'Dev Talk', time: 42000, sessions: 98 },
        { name: 'General Voice', time: 31000, sessions: 87 },
        { name: 'Music Lounge', time: 19000, sessions: 54 }
      ],
      topGames: [
        { name: 'Visual Studio Code', time: 35000, sessions: 67 },
        { name: 'Among Us', time: 15000, sessions: 23 },
        { name: 'Fall Guys', time: 12000, sessions: 18 }
      ],
      activityScore: 88,
      rank: 2
    }
  ]

  const popularGames = [
    { name: 'Valorant', players: 234, totalTime: '1,247h', growth: 12 },
    { name: 'Minecraft', players: 189, totalTime: '987h', growth: 8 },
    { name: 'Apex Legends', players: 156, totalTime: '743h', growth: -3 },
    { name: 'Among Us', players: 98, totalTime: '456h', growth: 15 }
  ]

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const authStatus = localStorage.getItem('syn1980_auth')
      const authTime = localStorage.getItem('syn1980_auth_time')
      
      if (authStatus === 'authenticated' && authTime) {
        const timeDiff = Date.now() - parseInt(authTime)
        const hoursDiff = timeDiff / (1000 * 60 * 60)
        
        // Session expires after 24 hours
        if (hoursDiff < 24) {
          setAuthenticated(true)
          setTimeout(() => setLoading(false), 1000)
        } else {
          // Clear expired session
          localStorage.removeItem('syn1980_auth')
          localStorage.removeItem('syn1980_auth_time')
          router.push('/auth')
        }
      } else {
        router.push('/auth')
      }
    }
    
    checkAuth()
  }, [router])

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const handleLogout = () => {
    localStorage.removeItem('syn1980_auth')
    localStorage.removeItem('syn1980_auth_time')
    // Clear cookie
    document.cookie = 'syn1980_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading 1980 Synthesis</h2>
          <p className="text-purple-300">Analyzing server data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">1980 Synthesis</h1>
                <p className="text-purple-300 text-sm">
                  Powered by <span className="font-semibold">1980 Foundation</span> × <span className="font-semibold">Flowline Data Solutions</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
              <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                <Globe className="w-4 h-4 mr-2" />
                syn.ksa1980.lol
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-300 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <Eye className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <StatsCards stats={serverStats} />

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 border border-purple-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-purple-600">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
              <Target className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-purple-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-400" />
                    Server Activity Heatmap
                  </CardTitle>
                  <CardDescription className="text-purple-300">
                    Weekly activity patterns across all channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityHeatmap />
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="w-5 h-5 mr-2 text-purple-400" />
                    Top Contributors
                  </CardTitle>
                  <CardDescription className="text-purple-300">
                    Most active members this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Leaderboard users={users.slice(0, 5)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-black/20 border-purple-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-400" />
                      All Members Analytics
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Comprehensive member activity analysis and rankings
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-purple-400" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 bg-black/20 border-purple-800/50 text-white placeholder:text-purple-400"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-16 h-16 border-2 border-purple-500">
                              <AvatarImage src={user.avatar} alt={user.username} />
                              <AvatarFallback className="bg-purple-600 text-white">
                                {user.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-bold text-white">{user.username}</h3>
                                <Badge className="bg-purple-600 text-white">
                                  #{user.rank}
                                </Badge>
                              </div>
                              <p className="text-purple-300 text-sm flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                Last seen: {new Date(user.lastSeen).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-400 mb-1">
                              {user.activityScore}
                            </div>
                            <p className="text-purple-300 text-sm">Activity Score</p>
                          </div>
                        </div>

                        <Separator className="my-4 bg-purple-800/50" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Voice Stats */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-white flex items-center">
                              <Mic className="w-4 h-4 mr-2 text-purple-400" />
                              Voice Activity
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-purple-300">Total Time:</span>
                                <span className="text-white font-semibold">{formatTime(user.totalVoiceTime)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-300">Sessions:</span>
                                <span className="text-white font-semibold">{formatNumber(user.totalSessions)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-300">Avg Session:</span>
                                <span className="text-white font-semibold">{formatTime(user.averageSessionTime)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Favorite Channels */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-white flex items-center">
                              <MessageSquare className="w-4 h-4 mr-2 text-purple-400" />
                              Top Channels
                            </h4>
                            <div className="space-y-2">
                              {user.favoriteChannels.slice(0, 3).map((channel, index) => (
                                <div key={channel.name} className="flex items-center justify-between text-sm">
                                  <span className="text-purple-300 truncate">
                                    #{index + 1} {channel.name}
                                  </span>
                                  <span className="text-white font-semibold ml-2">
                                    {formatTime(channel.time)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Top Games */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-white flex items-center">
                              <Gamepad2 className="w-4 h-4 mr-2 text-purple-400" />
                              Top Games
                            </h4>
                            <div className="space-y-2">
                              {user.topGames.slice(0, 3).map((game, index) => (
                                <div key={game.name} className="flex items-center justify-between text-sm">
                                  <span className="text-purple-300 truncate">
                                    #{index + 1} {game.name}
                                  </span>
                                  <span className="text-white font-semibold ml-2">
                                    {formatTime(game.time)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Activity Progress */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-300 text-sm">Activity Level</span>
                            <span className="text-white text-sm font-semibold">{user.activityScore}%</span>
                          </div>
                          <Progress value={user.activityScore} className="h-2 bg-purple-900/50" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs content would go here */}
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-800/50 bg-black/20 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-purple-300 text-sm">
              © 2024 1980 Foundation × Flowline Data Solutions. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-purple-400 text-sm">
              <span>Powered by 1980 Synthesis</span>
              <Separator orientation="vertical" className="h-4 bg-purple-800" />
              <span>syn.ksa1980.lol</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

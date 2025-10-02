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
  MessageSquare,
  Bot,
  AlertCircle
} from 'lucide-react'
import { ActivityHeatmap } from '@/components/activity-heatmap'
import { Leaderboard } from '@/components/leaderboard'
import { StatsCards } from '@/components/stats-cards'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Real data state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    currentVoiceUsers: 0,
    totalVoiceTime: 0,
    totalSessions: 0,
    averageSessionTime: 0
  })

  const [leaderboard, setLeaderboard] = useState([])
  const [users, setUsers] = useState([])

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
          loadData()
          
          // Set up real-time data updates every 5 seconds
          const interval = setInterval(() => {
            loadData()
          }, 5000)

          // Cleanup interval on unmount
          return () => clearInterval(interval)
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

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch real data from API
      const [statsRes, leaderboardRes, usersRes] = await Promise.all([
        fetch('/api/stats').catch(() => null),
        fetch('/api/leaderboard?limit=10').catch(() => null),
        fetch('/api/users?limit=50').catch(() => null)
      ])

      // Handle stats
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          currentVoiceUsers: 0,
          totalVoiceTime: 0,
          totalSessions: 0,
          averageSessionTime: 0
        })
      }

      // Handle leaderboard
      if (leaderboardRes && leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json()
        setLeaderboard(leaderboardData.users || [])
      } else {
        setLeaderboard([])
      }

      // Handle users
      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      } else {
        setUsers([])
      }

      setDataLoaded(true)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data from database')
      // Set empty data
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        currentVoiceUsers: 0,
        totalVoiceTime: 0,
        totalSessions: 0,
        averageSessionTime: 0
      })
      setLeaderboard([])
      setUsers([])
      setDataLoaded(true)
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatNumber = (num) => {
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Data...</h2>
          <p className="text-purple-300">Connecting to Database</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="sticky top-0 z-40 w-full bg-black/30 backdrop-blur-lg border-b border-purple-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-purple-400" />
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  1980 Synthesis
                </h1>
              </div>
              <p className="text-purple-300 text-sm">
                Powered by <span className="font-semibold">1980 Foundation</span> × <span className="font-semibold">Flowline Data Solutions</span>
              </p>
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

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto border-red-500 text-red-300"
              onClick={loadData}
            >
              Retry
            </Button>
          </div>
        )}

        {!dataLoaded ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
            <p className="text-purple-300 mb-4">No data found in database</p>
            <Button onClick={loadData} className="bg-purple-600 hover:bg-purple-700">
              Reload Data
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="mb-8">
              <StatsCards stats={stats} />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-black/20 border border-purple-800/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
                  <Award className="w-4 h-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
                  <Users className="w-4 h-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-black/20 border-purple-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-300">
                        <Calendar className="h-5 w-5" />
                        خريطة النشاط الأسبوعية
                      </CardTitle>
                      <CardDescription className="text-purple-400">
                        أوقات ذروة النشاط في السيرفر
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ActivityHeatmap />
                    </CardContent>
                  </Card>

                  <Card className="bg-black/20 border-purple-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-300">
                        <Gamepad2 className="h-5 w-5" />
                        الألعاب الشائعة
                      </CardTitle>
                      <CardDescription className="text-purple-400">
                        أكثر الألعاب لعباً في السيرفر
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.totalUsers === 0 ? (
                        <div className="text-center py-8">
                          <Gamepad2 className="h-12 w-12 text-purple-400 mx-auto mb-3 opacity-50" />
                          <p className="text-purple-300">لا توجد بيانات ألعاب متاحة</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-purple-300 text-sm">سيتم عرض البيانات عند توفرها من البوت</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-6">
                <Card className="bg-black/20 border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-300">
                      <Award className="h-5 w-5" />
                      متصدرو النشاط الصوتي
                    </CardTitle>
                    <CardDescription className="text-purple-400">
                      الأعضاء الأكثر تفاعلاً في القنوات الصوتية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leaderboard.length === 0 ? (
                      <div className="text-center py-12">
                        <Award className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">لا توجد بيانات متصدرين</h3>
                        <p className="text-purple-300">لم يتم العثور على بيانات نشاط صوتي في قاعدة البيانات</p>
                      </div>
                    ) : (
                      <Leaderboard users={leaderboard} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card className="bg-black/20 border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-300">
                      <Users className="h-5 w-5" />
                      جميع الأعضاء ({users.length})
                    </CardTitle>
                    <CardDescription className="text-purple-400">
                      قائمة شاملة بجميع الأعضاء النشطين
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
                        <Input
                          placeholder="البحث عن عضو..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-black/30 border-purple-700 text-white placeholder:text-purple-400"
                        />
                      </div>
                    </div>

                    {users.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">لا توجد بيانات أعضاء</h3>
                        <p className="text-purple-300">لم يتم العثور على بيانات أعضاء في قاعدة البيانات</p>
                        <p className="text-purple-400 text-sm mt-2">تأكد من أن البوت يعمل ويراقب السيرفر</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredUsers.map((user, index) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:scale-[1.02] transition-all duration-200"
                          >
                            <Avatar className="h-12 w-12 border-2 border-purple-500">
                              <AvatarImage src={user.avatar} alt={user.username} />
                              <AvatarFallback className="bg-purple-600 text-white font-bold">
                                {user.username?.slice(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-white truncate">{user.username || 'مستخدم غير معروف'}</p>
                                <Badge className="bg-purple-600 text-white text-xs">
                                  #{user.rank || index + 1}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-purple-300">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(user.totalVoiceTime || 0)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  {user.activityScore || 0} نقطة
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-white">
                                {user.activityScore || 0}
                              </div>
                              <div className="text-purple-300 text-xs">
                                نقاط النشاط
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-black/20 border-purple-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-300">
                        <TrendingUp className="h-5 w-5" />
                        إحصائيات النمو
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.totalUsers === 0 ? (
                        <div className="text-center py-8">
                          <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-3 opacity-50" />
                          <p className="text-purple-300">لا توجد بيانات نمو متاحة</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300">إجمالي الأعضاء</span>
                            <span className="font-bold text-white">{formatNumber(stats.totalUsers)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300">الأعضاء النشطين</span>
                            <span className="font-bold text-white">{formatNumber(stats.activeUsers)}</span>
                          </div>
                          <Progress 
                            value={(stats.activeUsers / stats.totalUsers) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-black/20 border-purple-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-300">
                        <Mic className="h-5 w-5" />
                        النشاط الصوتي
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.totalVoiceTime === 0 ? (
                        <div className="text-center py-8">
                          <Mic className="h-12 w-12 text-purple-400 mx-auto mb-3 opacity-50" />
                          <p className="text-purple-300">لا توجد بيانات نشاط صوتي</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300">إجمالي الوقت الصوتي</span>
                            <span className="font-bold text-white">{formatTime(stats.totalVoiceTime)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300">متوسط الجلسة</span>
                            <span className="font-bold text-white">{formatTime(stats.averageSessionTime)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-300">المتصلين حالياً</span>
                            <span className="font-bold text-white">{formatNumber(stats.currentVoiceUsers)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
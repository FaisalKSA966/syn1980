"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User, Clock, Gamepad2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserStats {
  id: string
  username: string
  totalVoiceTime: number
  totalSessions: number
  averageSessionTime: number
  channelStats: Array<{
    channelName: string
    _count: { channelId: number }
    _sum: { duration: number }
  }>
  gameStats: Array<{
    gameName: string
    _count: { gameName: number }
    _sum: { duration: number }
  }>
}

export function MemberSearch() {
  const [userId, setUserId] = useState("")
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!userId.trim()) {
      setError("الرجاء إدخال معرف العضو")
      return
    }

    setLoading(true)
    setError("")
    setUserStats(null)

    try {
      const response = await fetch(`/api/user/${userId}`)
      if (!response.ok) {
        throw new Error("العضو غير موجود")
      }
      const data = await response.json()
      setUserStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء البحث")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن عضو بالمعرف (User ID)..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pr-10 bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "جاري البحث..." : "بحث"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {userStats && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {userStats.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-card-foreground">{userStats.username}</h3>
                  <p className="text-sm text-muted-foreground font-mono">ID: {userStats.id}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">إجمالي الوقت</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{formatTime(userStats.totalVoiceTime)}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-accent" />
                    <span className="text-sm text-muted-foreground">عدد الجلسات</span>
                  </div>
                  <p className="text-2xl font-bold text-accent">{userStats.totalSessions}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-chart-3" />
                    <span className="text-sm text-muted-foreground">متوسط الجلسة</span>
                  </div>
                  <p className="text-2xl font-bold text-chart-3">{formatTime(userStats.averageSessionTime)}</p>
                </div>
              </div>

              {/* Channel Stats */}
              {userStats.channelStats.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-card-foreground mb-3">القنوات الأكثر استخداماً</h4>
                  <div className="space-y-2">
                    {userStats.channelStats.slice(0, 5).map((channel, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-card-foreground font-medium">
                          {channel.channelName || "Unknown Channel"}
                        </span>
                        <div className="text-left">
                          <p className="text-sm text-accent font-semibold">{formatTime(channel._sum.duration || 0)}</p>
                          <p className="text-xs text-muted-foreground">{channel._count.channelId} جلسة</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Stats */}
              {userStats.gameStats.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    الألعاب الأكثر لعباً
                  </h4>
                  <div className="space-y-2">
                    {userStats.gameStats.slice(0, 5).map((game, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-card-foreground font-medium">{game.gameName}</span>
                        <div className="text-left">
                          <p className="text-sm text-primary font-semibold">{formatTime(game._sum.duration || 0)}</p>
                          <p className="text-xs text-muted-foreground">{game._count.gameName} جلسة</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

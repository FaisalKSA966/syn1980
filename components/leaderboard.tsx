"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown } from "lucide-react"

interface LeaderboardUser {
  id: string
  username: string
  avatar?: string
  totalVoiceTime: number
  rank: number
  activityScore: number
}

interface LeaderboardProps {
  users: LeaderboardUser[]
}

export function Leaderboard({ users }: LeaderboardProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <Award className="h-5 w-5 text-purple-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/50"
      case 2:
        return "from-gray-500/20 to-slate-500/20 border-gray-500/50"
      case 3:
        return "from-amber-600/20 to-orange-600/20 border-amber-600/50"
      default:
        return "from-purple-500/20 to-pink-500/20 border-purple-500/50"
    }
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <div
          key={user.id}
          className={`flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r ${getRankColor(user.rank)} hover:scale-[1.02] transition-all duration-200`}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20">
            {getRankIcon(user.rank)}
          </div>
          
          <Avatar className="h-12 w-12 border-2 border-purple-500">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="bg-purple-600 text-white font-bold">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-white truncate text-lg">{user.username}</p>
              <Badge className="bg-purple-600 text-white text-xs">
                #{user.rank}
              </Badge>
            </div>
            <p className="text-purple-300 text-sm">
              {formatTime(user.totalVoiceTime)} • Score: {user.activityScore}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {user.activityScore}
            </div>
            <div className="text-purple-300 text-xs">
              Activity Score
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

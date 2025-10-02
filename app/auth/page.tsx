'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Zap, Shield, Lock, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [accessCode, setAccessCode] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const VALID_ACCESS_CODE = 'acp.flowline.ksa1980.synthesis.syn(1980xflowline)/acp0666'
  const VALID_PIN = '0666'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (accessCode === VALID_ACCESS_CODE && pin === VALID_PIN) {
      // Store authentication in localStorage
      localStorage.setItem('syn1980_auth', 'authenticated')
      localStorage.setItem('syn1980_auth_time', Date.now().toString())
      
      // Set cookie for middleware
      document.cookie = 'syn1980_auth=authenticated; path=/; max-age=86400' // 24 hours
      
      // Redirect to dashboard
      router.push('/')
    } else {
      setError('Invalid access code or PIN. Please check your credentials.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">1980 Synthesis</h1>
          <p className="text-purple-300 text-sm">
            Secure Access Portal
          </p>
          <p className="text-purple-400 text-xs mt-1">
            Powered by <span className="font-semibold">1980 Foundation</span> × <span className="font-semibold">Flowline Data Solutions</span>
          </p>
        </div>

        {/* Authentication Card */}
        <Card className="bg-black/20 border-purple-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Authentication Required
            </CardTitle>
            <CardDescription className="text-purple-300">
              Enter your access credentials to continue to the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Access Code */}
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-purple-300 font-medium">
                  Access Code
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter access code..."
                  className="bg-black/20 border-purple-800/50 text-white placeholder:text-purple-400 focus:border-purple-500"
                  required
                />
                <p className="text-xs text-purple-400">
                  Format: acp.flowline.ksa1980.synthesis.syn(1980xflowline)/acp****
                </p>
              </div>

              {/* PIN */}
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-purple-300 font-medium">
                  Security PIN
                </Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN..."
                    className="bg-black/20 border-purple-800/50 text-white placeholder:text-purple-400 focus:border-purple-500 pr-10"
                    maxLength={4}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-purple-400">
                  4-digit security PIN
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="bg-red-900/20 border-red-800/50">
                  <Lock className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !accessCode || !pin}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Access Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-purple-300 font-medium text-sm mb-1">Security Notice</h4>
                  <p className="text-purple-400 text-xs leading-relaxed">
                    This dashboard contains sensitive Discord server analytics. 
                    Access is restricted to authorized personnel only. 
                    All access attempts are logged and monitored.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-purple-400 text-xs">
            © 2024 1980 Foundation × Flowline Data Solutions
          </p>
          <p className="text-purple-500 text-xs mt-1">
            syn.ksa1980.lol - Secure Analytics Portal
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  // const router = useRouter() // Not strictly needed here yet

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      // We are not collecting name, so no options.data for now
    })
    if (error) {
      setMessage(error.message)
    } else if (data.user) {
      // Check if user needs confirmation
      if (data.session) { // User is immediately signed in (e.g. auto-confirm is on)
        setMessage('Signed up and logged in successfully!')
      } else {
        setMessage('Check your email for the confirmation link!')
      }
      // setEmail('') // Optional: Clear fields
      // setPassword('')
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-4 p-4 rounded-md text-sm ${message.toLowerCase().includes('error') || (message.toLowerCase().includes('failed')) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            role="alert"
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Name field removed as per user request */}
          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <input
              id="email-signup"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <input
              id="password-signup"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Supabase default
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
              disabled={loading}
            />
          </div>
          {/* Confirm Password field removed */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-gray-600"> {/* text-muted-foreground approximation */}
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 
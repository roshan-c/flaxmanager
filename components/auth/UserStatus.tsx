'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'
import SignOutButton from './SignOutButton' // Assuming SignOutButton is in the same directory

export default function UserStatus() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(data.session)
        setUser(data.session?.user ?? null)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <p>Loading user status...</p>
  }

  if (user) {
    return (
      <div className="space-y-2">
        <p>Signed in as: <strong>{user.email}</strong></p>
        <SignOutButton />
      </div>
    )
  }

  return (
    <div>
      <p>You are not signed in.</p>
      {/* Optionally, add links to Sign In / Sign Up pages here */}
      {/* e.g., <a href="/signin">Sign In</a> */}
    </div>
  )
} 
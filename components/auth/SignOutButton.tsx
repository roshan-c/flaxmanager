'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation' // Or 'next/router'
import { useState } from 'react'

export default function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignOut = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signOut()
    if (error) {
      setMessage(`Error signing out: ${error.message}`)
    } else {
      setMessage('Signed out successfully.')
      // router.push('/signin') // Redirect to sign-in page after sign out
      // Or rely on onAuthStateChange to handle redirects/UI updates
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}
        >
          {message}
        </p>
      )}
    </>
  )
} 
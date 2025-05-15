'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation' // Or 'next/router' for older Next.js versions

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Signed in successfully!')
      // router.push('/') // Redirect to home page or dashboard after sign-in
      // Or use onAuthStateChange to handle redirects globally
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <label htmlFor="email-signin" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email-signin"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="password-signin" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password-signin"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {message && (
        <p
          className={`text-sm text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {message}
        </p>
      )}
    </form>
  )
} 
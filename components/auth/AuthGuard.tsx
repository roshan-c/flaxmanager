'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/signin', '/signup']; // Add any other public paths here

export default function AuthGuard({ children }: AuthGuardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session for AuthGuard:', error);
        // Potentially handle error, e.g. redirect to an error page or allow access
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      // If loading was true because of initial fetch, and auth state changes, 
      // ensure loading becomes false if it hasn't already.
      if (loading && currentSession !== undefined) {
         setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loading]); // Added loading to dependency array to re-evaluate if it was stuck true

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p> {/* Replace with a proper spinner/loader if available */}
      </div>
    );
  }

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!session && !isPublicPath) {
    router.push('/signin');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting to sign in...</p>
      </div>
    ); // Render null or a loading indicator while redirecting
  }
  
  // If user is logged in and tries to access a public auth page (e.g. /signin), redirect to home
  if (session && isPublicPath) {
    router.push('/'); 
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting to home...</p>
      </div>
    );
  }

  return <>{children}</>;
} 
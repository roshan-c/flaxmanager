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
  const [hasMounted, setHasMounted] = useState(false);
  const [authState, setAuthState] = useState<{
    session: Session | null;
    determined: boolean; // Has the initial auth check completed?
    redirectPath: string | null; // Path to redirect to, if any. Null if no redirect needed.
  }>({ session: null, determined: false, redirectPath: null });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return; // Don't run auth logic until client has mounted

    // Function to determine redirect path based on session and current path
    const determineRedirect = (currentSession: Session | null, currentPathname: string) => {
      const isPublic = PUBLIC_PATHS.includes(currentPathname);
      if (!currentSession && !isPublic) {
        return '/signin';
      }
      if (currentSession && isPublic) {
        return '/';
      }
      return null; // No redirect needed
    };

    // Initial session fetch only after mount
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error fetching initial session for AuthGuard:', error);
        // Decide how to handle: maybe treat as logged out, or show an error UI
        // For now, assume no session on error and let redirect logic handle it.
      }
      const redirect = determineRedirect(initialSession, pathname);
      setAuthState({ session: initialSession, determined: true, redirectPath: redirect });
    }).catch(err => {
      console.error('Exception fetching initial session:', err);
      const redirect = determineRedirect(null, pathname); // Assume no session on exception
      setAuthState({ session: null, determined: true, redirectPath: redirect });
    });

    // Listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        const redirect = determineRedirect(currentSession, pathname);
        // Update authState. Session might be null if user logs out.
        // determined should remain true after the initial check.
        setAuthState({ session: currentSession, determined: true, redirectPath: redirect });
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [hasMounted, pathname]); // Include hasMounted here

  // Effect for actually performing the redirect if redirectPath is set
  useEffect(() => {
    if (hasMounted && authState.determined && authState.redirectPath) {
      router.push(authState.redirectPath);
    }
    // No need to check router here as it's stable from next/navigation
  }, [hasMounted, authState.determined, authState.redirectPath, router]);

  // This is the crucial part for hydration:
  // Until the component has mounted on the client, render the same as the server (loading state).
  if (!hasMounted || !authState.determined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  if (authState.redirectPath) {
    // If a redirect is determined and about to happen (or in progress by the effect above).
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  // If authentication is determined and no redirect is needed, render the children.
  return <>{children}</>;
} 
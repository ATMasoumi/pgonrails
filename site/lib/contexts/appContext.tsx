"use client"

import { createContext, useContext, useEffect } from "react"
import { AuthError, SupabaseClient, User, RealtimeChannel } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { MergeStateFunction, useMergeState } from "../hooks/useMergeState";
import { toast } from "sonner";

type SupabaseAuthResponseLike = { error: AuthError | null, [key: string]: unknown }

type WithCaptureAuthError = <T extends SupabaseAuthResponseLike>(fn: () => Promise<T>) => Promise<T>

type AppContextState = {
  user: User | null
  subscription: Record<string, unknown> | null
  isLoadingSubscription: boolean
  error: AuthError | null
  isPro: boolean
}

type TAppContext = {
  supabase: SupabaseClient
  user: User | null
  subscription: Record<string, unknown> | null
  isLoadingSubscription: boolean
  error: AuthError | null
  isPro: boolean
  clearError: () => void
  withCaptureAuthError: WithCaptureAuthError
  mergeState: MergeStateFunction<AppContextState>
}

const AppContext = createContext<TAppContext>({
  supabase,
  user: null,
  subscription: null,
  isLoadingSubscription: true,
  error: null,
  isPro: false,
  clearError: () => {},
  withCaptureAuthError: (async () => ({ error: null })) as WithCaptureAuthError,
  mergeState: () => {},
})

export const AppContextProvider = ({ children, initialUser }: { children: React.ReactNode, initialUser?: User | null }) => {
  const [state, mergeState] = useMergeState({
    user: initialUser || null,
    subscription: null as Record<string, unknown> | null,
    isLoadingSubscription: true,
    error: null as AuthError | null,
    isPro: false,
  })

  const clearError = () => mergeState({ error: null })

  const withCaptureAuthError: WithCaptureAuthError = async (fn) => {
    clearError()
    const result = await fn()

    if (result.error) {
      mergeState({ error: result.error })
    }

    return result
  }

  // Sync state with initialUser from server (e.g. on navigation/redirect)
  // REMOVED: This effect was causing stale user data to persist on client-side navigation/logout
  // because initialUser prop doesn't update on client-side navigation in App Router layouts.
  // We rely on onAuthStateChange for client-side updates.
  /*
  useEffect(() => {
    if (initialUser !== undefined && initialUser?.id !== state.user?.id) {
      console.log('[AppContext] Syncing with server user:', initialUser?.email);
      mergeState({ user: initialUser || null });
      
      // If we have a new user from server, we should reset subscription state
      // and let the main useEffect fetch it (or fetch it here)
      if (initialUser) {
        // We rely on the main useEffect to fetch subscription when state.user changes
        // But we must ensure isLoading is true to prevent stale UI
        mergeState({ isLoadingSubscription: true, isPro: false, subscription: null });
      } else {
        mergeState({ isLoadingSubscription: false, isPro: false, subscription: null });
      }
    }
  }, [initialUser, state.user?.id, mergeState]);
  */

  useEffect(() => {
    let subscriptionChannel: RealtimeChannel | null = null;

    const fetchSubscription = async (userId: string) => {
      // Reset state immediately to prevent stale data from persisting during load
      mergeState({ isLoadingSubscription: true, subscription: null, isPro: false })
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .in('status', ['trialing', 'active'])
        .eq('user_id', userId)
        .maybeSingle()
      
      if (error) {
        console.error('[AppContext] Error fetching subscription:', error)
      } else {
        console.log('[AppContext] Fetched subscription for user', userId, ':', data)
      }
      mergeState({ 
        subscription: data, 
        isLoadingSubscription: false, 
        isPro: !!data 
      })
    }

    const setupRealtime = (userId: string) => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel)
      }
      subscriptionChannel = supabase
        .channel('public:subscriptions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('[AppContext] Subscription change received:', payload)
            fetchSubscription(userId)
          }
        )
        .subscribe()
    }

    // Initial user check
    if (state.user) {
      fetchSubscription(state.user.id)
      setupRealtime(state.user.id)
    } else {
      mergeState({ isLoadingSubscription: false, isPro: false })
    }

    return () => {
      if (subscriptionChannel) supabase.removeChannel(subscriptionChannel)
    }
  }, [state.user?.id, mergeState])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AppContext] Auth state change:', event, session?.user?.email);
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        mergeState({ user: session?.user || null })
        
        if (event === "SIGNED_IN") {
          if (localStorage.getItem("email_change") && !session?.user.new_email) {
            localStorage.removeItem("email_change")
            toast("Success!", {
              description: "Your email has successfully been updated."
            })
          }
        }
      } else if (event === "SIGNED_OUT") {
        mergeState({ user: null, subscription: null, isLoadingSubscription: false, isPro: false })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [mergeState])

  const value = {
    ...state,
    supabase,
    clearError,
    withCaptureAuthError,
    mergeState
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
    const context = useContext(AppContext)

    if (context === undefined) {
        throw new Error("useAppContext needs to be inside the AppContextProvider")
    }

    return context
}
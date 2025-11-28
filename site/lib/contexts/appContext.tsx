"use client"

import { PropsWithChildren, createContext, useContext, useEffect } from "react"
import { AuthError, SupabaseClient, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { MergeStateFunction, useMergeState } from "../hooks/useMergeState";
import { toast } from "sonner";

type SupabaseAuthResponseLike = { error: AuthError | null, [key: string]: unknown }

type WithCaptureAuthError = <T extends SupabaseAuthResponseLike>(fn: () => Promise<T>) => Promise<T>

type AppContextState = {
  user: User | null
  subscription: any | null
  isLoadingSubscription: boolean
  error: AuthError | null
  isPro: boolean
}

type TAppContext = {
  supabase: SupabaseClient
  user: User | null
  subscription: any | null
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

export const AppContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, mergeState] = useMergeState({
    user: null as User | null,
    subscription: null as any | null,
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

  useEffect(() => {
    let subscriptionChannel: any = null;

    const fetchSubscription = async (userId: string) => {
      mergeState({ isLoadingSubscription: true })
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .in('status', ['trialing', 'active'])
        .eq('user_id', userId)
        .maybeSingle()
      
      if (error) {
        console.error('[AppContext] Error fetching subscription:', error)
      } else {
        console.log('[AppContext] Fetched subscription:', data)
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

    supabase.auth.getUser().then(response => {
      const user = response.data.user
      mergeState({ user })
      if (user) {
        fetchSubscription(user.id)
        setupRealtime(user.id)
      } else {
        mergeState({ isLoadingSubscription: false, isPro: false })
      }
    })
    
    const listener = supabase.auth.onAuthStateChange(async (event, session) => {
      // If user updated their email successfully, show a toast
      if (event === "SIGNED_IN") {
        if (localStorage.getItem("email_change") && !session?.user.new_email) {
          localStorage.removeItem("email_change")
          mergeState({ user: session?.user || null })
          toast("Success!", {
            description: "Your email has successfully been updated."
          })
        }
        if (session?.user) {
          fetchSubscription(session.user.id)
          setupRealtime(session.user.id)
        }
      } else if (event === "SIGNED_OUT") {
        if (subscriptionChannel) supabase.removeChannel(subscriptionChannel)
        mergeState({ user: null, subscription: null, isLoadingSubscription: false, isPro: false })
      } else if (event !== "INITIAL_SESSION") {
        mergeState({ user: session?.user || null })
        if (session?.user) {
          fetchSubscription(session.user.id)
          setupRealtime(session.user.id)
        }
      }
    })

    return () => {
      listener.data.subscription.unsubscribe()
      if (subscriptionChannel) supabase.removeChannel(subscriptionChannel)
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
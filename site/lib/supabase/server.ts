import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient, User } from '@supabase/supabase-js'
import { STORAGE_KEY } from './constants'

export async function getUserSubscription(user: User) {
    const supabase = await createClient()
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .in('status', ['trialing', 'active'])
        .eq('user_id', user.id)
        .maybeSingle()

    return subscription
}

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
            auth: {
                storageKey: STORAGE_KEY
            }
        }
    )
}

export async function createAdminClient() {
    return createSupabaseClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
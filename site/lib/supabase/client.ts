import { createBrowserClient } from '@supabase/ssr'
import { STORAGE_KEY } from './constants'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: STORAGE_KEY
            }
        }
    )
}

export const supabase = createClient()

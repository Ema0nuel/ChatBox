/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js';


const getSupabaseUrl = () => {
    // Try Vercel environment variables first
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_SUPABASE_URL;
    }
    // Fallback to Vite environment variables for local development
    return import.meta.env.VITE_SUPABASE_URL;
};

const getSupabaseAnonKey = () => {
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Simple visitor ID management
const getOrCreateVisitorId = () => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
};

export const visitorId = getOrCreateVisitorId();

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'chatbox-auth',
        flowType: 'pkce',
    },
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    },
    db: {
        schema: 'public'
    }
});
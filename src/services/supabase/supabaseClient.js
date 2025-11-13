import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
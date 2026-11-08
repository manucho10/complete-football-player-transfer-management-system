// supabase/functions/search-players-ai/index.ts
// @ts-ignore Deno resolves this URL import at runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void
  env: { get(name: string): string | undefined }
}
declare const Supabase: any

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

 Deno.serve(async (req) => {
    // ⭐ Handle CORS Preflight (OPTIONS) Request First
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase environment variables are not configured')
      }

      const { query } = await req.json()
      if (typeof query !== 'string' || !query.trim()) throw new Error('Search query is required')

      const model = new Supabase.ai.Session('gte-small')
      const queryEmbedding = await model.run(query.trim(), {
        mean_pool: true,
        normalize: true,
      })

      const supabase = createClient(supabaseUrl, serviceRoleKey)
      const { data: matches, error } = await supabase.rpc('match_players_for_club', {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.65,
        match_count: 10
      })

      if (error) throw error

      // ⭐ Return response with CORS headers
      return Response.json({ success: true, results: matches }, { headers: corsHeaders })
    } catch (error) {
      // ⭐ Return errors with CORS headers so the browser can read them
      const message = error instanceof Error ? error.message : 'Unexpected error'
      return Response.json({ success: false, error: message }, { status: 500, headers: corsHeaders })
    }
})
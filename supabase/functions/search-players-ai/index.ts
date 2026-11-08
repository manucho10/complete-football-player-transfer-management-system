// supabase/functions/search-players-ai/index.ts
// @ts-ignore Deno resolves this URL import at runtime.
declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
}

// @ts-ignore Deno resolves this URL import at runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export default {
  async fetch(req: Request) {
    try {
      const { query } = await req.json()
      if (!query) throw new Error("Search query is required")

      // 1. Initialize the Supabase AI Model
      // @ts-ignore Supabase is provided by the Supabase Edge Runtime.
      const model = new Supabase.ai.Session('gte-small')

      // 2. Turn the Team's search text into a 384-dimension vector
      const queryEmbedding = await model.run(query, {
        mean_pool: true,
        normalize: true,
      })

      // 3. Search the database for the closest matching players
      const { data: matches, error } = await supabaseAdmin.rpc('match_players_for_club', {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.65, // Lower this (e.g., 0.5) if you get no results
        match_count: 10
      })

      if (error) throw error

      return Response.json({ success: true, results: matches })
    } catch (error) {
      console.error(error)
      return Response.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
  },
}
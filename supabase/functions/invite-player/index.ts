// supabase/functions/invite-player/index.ts
// @ts-ignore Deno resolves this URL import at runtime; TypeScript's editor resolver does not.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
  serve: (handler: (req: Request) => Promise<Response> | Response) => void
}

// CORS headers to allow your React app to call this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Create the admin client using the secret key from environment
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 3. Get the email and invite ID from the request body
    const { email, inviteId } = await req.json()

    if (!email || !inviteId) {
      throw new Error('Email and inviteId are required')
    }

    // 4. Send the invite
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      // Redirect back to your Vercel app's registration page
      redirectTo: `https://football-playertransfer-management.vercel.app/register?invite=${inviteId}`,
    })

    if (error) throw error

    // 5. Return success
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
// supabase/functions/generate-embedding/index.ts
// @ts-ignore Deno resolves HTTPS imports at runtime.
import { withSupabase } from 'https://esm.sh/@supabase/server@1'

declare const Supabase: {
  ai: {
    Session: new (model: string) => {
      run(
        input: string,
        options: { mean_pool: boolean; normalize: boolean },
      ): Promise<number[]>
    }
  }
}

// Initialize the built-in Supabase AI model
const model = new Supabase.ai.Session('gte-small')

export default {
  fetch: withSupabase({ auth: 'none' }, async (req: Request, ctx: { supabaseAdmin: any }) => {
    // This is triggered by a Database Webhook
    const payload = await req.json()
    const record = payload.record

    // Combine the player's stats and bio into a text string
    const textToEmbed = `
      Name: ${record.name}. 
      Position: ${record.position}. 
      Age: ${record.age}. 
      Bio: ${record.bio}. 
      Pace: ${record.pace}, Shooting: ${record.shooting}, Passing: ${record.passing}, Dribbling: ${record.dribbling}, Defending: ${record.defending}, Physical: ${record.physical}.
    `

    // Generate the embedding using the AI
    const embedding = await model.run(textToEmbed, {
      mean_pool: true,
      normalize: true,
    })

    // Save the vector back to the player's row in the database
    const { error } = await ctx.supabaseAdmin
      .from('players')
      .update({ embedding: JSON.stringify(embedding) })
      .eq('id', record.id)

    if (error) console.warn("Failed to update embedding:", error.message)
    
    return Response.json({ success: true, message: "Embedding generated!" })
  }),
}
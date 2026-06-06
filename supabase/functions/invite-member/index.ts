import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS (Required so your browser doesn't block the request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, organization_id } = await req.json()

    if (!email || !organization_id) {
      throw new Error("Missing required fields: email and organization_id")
    }

    // Connect to Supabase using the logged-in user's token
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify the caller is the admin of this organization
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('created_by')
      .eq('id', organization_id)
      .single()

    if (orgError || !org) {
      throw new Error("You are not authorized to invite members to this organization.")
    }

    // Insert the invitation into the database
    const { error: insertError } = await supabaseClient
      .from('organization_members')
      .insert({
        organization_id: organization_id,
        email: email.toLowerCase(),
        role: 'member',
        status: 'invited'
      })

    if (insertError) throw insertError

    // Return success!
    return new Response(
      JSON.stringify({ success: true, message: `Successfully invited ${email}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

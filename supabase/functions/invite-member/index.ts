import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Setting up the rules for who can talk to this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests (Browser security stuff)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Create a "God Mode" connection to Supabase using the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Get the authorization header sent by the frontend
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // 3. Verify who is making the request using their token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized: You must be logged in.')
    }

    // 4. Get the data they sent us (email and organization ID)
    const { email, organization_id } = await req.json()

    if (!email || !organization_id) {
      throw new Error('Missing email or organization ID.')
    }

    // 5. SECURITY CHECK: Ensure this user actually owns this organization!
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id')
      .eq('id', organization_id)
      .eq('created_by', user.id)
      .single()

    if (orgError || !org) {
      throw new Error('Forbidden: You are not the admin of this organization.')
    }

    // 6. Check if this person is already invited/in the organization
    const { data: existingMember } = await supabaseClient
      .from('organization_members')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('email', email)
      .single()

    if (existingMember) {
      throw new Error('User is already a member or has already been invited.')
    }

    // 7. Write the invitation to the database!
    const { error: insertError } = await supabaseClient
      .from('organization_members')
      .insert({
        organization_id: organization_id,
        email: email,
        status: 'invited',
        role: 'member'
      })

    if (insertError) throw insertError

    // 8. Return success
    return new Response(
      JSON.stringify({ message: `Successfully invited ${email}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})


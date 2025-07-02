import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UpdateUserRoleRequest {
  userId: string;
  newRole: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header and verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Check if user has admin permissions
    const { data: adminCheck } = await supabase.rpc('has_permission', {
      user_uuid: user.id,
      permission_name: 'admin:users:manage'
    })

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Parse request body
    const { userId, newRole }: UpdateUserRoleRequest = await req.json()

    // Validate required fields
    if (!userId || !newRole) {
      return new Response(
        JSON.stringify({ error: 'User ID and new role are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Prevent users from modifying their own role
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot modify your own role' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if the new role exists
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', newRole)
      .eq('is_active', true)
      .single()

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Invalid role specified' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Remove existing role assignments for this user
    const { error: removeError } = await supabase
      .from('user_role_assignments')
      .delete()
      .eq('user_id', userId)

    if (removeError) {
      console.error('Error removing existing role assignments:', removeError)
      return new Response(
        JSON.stringify({ error: 'Failed to update user role' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Assign the new role
    const { error: assignError } = await supabase
      .from('user_role_assignments')
      .insert({
        user_id: userId,
        role_id: roleData.id,
        assigned_by: user.id,
        is_active: true
      })

    if (assignError) {
      console.error('Error assigning new role:', assignError)
      return new Response(
        JSON.stringify({ error: 'Failed to assign new role' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User role updated successfully',
        userId,
        newRole
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in update-user-role function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
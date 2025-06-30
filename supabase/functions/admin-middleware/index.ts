import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface AdminCheckRequest {
  userId: string;
  requiredPermission?: string;
}

interface AdminCheckResponse {
  isAdmin: boolean;
  hasPermission: boolean;
  role: string;
  permissions: string[];
  error?: string;
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

    // Get the authorization header
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

    // Verify the JWT token
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

    const { userId, requiredPermission } = await req.json() as AdminCheckRequest

    // Verify the user ID matches the token
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Get user's role and permissions
    const { data: roleData, error: roleError } = await supabase
      .from('user_role_assignments')
      .select(`
        user_roles!inner(name),
        role_permissions!inner(
          user_permissions!inner(name)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (roleError) {
      console.error('Role query error:', roleError)
      return new Response(
        JSON.stringify({ 
          isAdmin: false, 
          hasPermission: false, 
          role: 'user', 
          permissions: [],
          error: 'Failed to fetch user role' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const role = roleData?.user_roles?.name || 'user'
    const permissions = roleData?.role_permissions?.map(
      (rp: any) => rp.user_permissions.name
    ) || []

    const isAdmin = role === 'admin'
    const hasPermission = requiredPermission 
      ? permissions.includes(requiredPermission) 
      : true

    const response: AdminCheckResponse = {
      isAdmin,
      hasPermission,
      role,
      permissions
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Admin middleware error:', error)
    return new Response(
      JSON.stringify({ 
        isAdmin: false, 
        hasPermission: false, 
        role: 'user', 
        permissions: [],
        error: 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
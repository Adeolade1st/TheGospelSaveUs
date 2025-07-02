import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface UserWithRole {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
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

    // Parse query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const roleFilter = url.searchParams.get('role') || ''
    const statusFilter = url.searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // Build the query for users with their roles
    let query = supabase
      .from('auth.users')
      .select(`
        id,
        email,
        raw_user_meta_data,
        created_at,
        last_sign_in_at,
        email_confirmed_at,
        banned_until
      `)

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,raw_user_meta_data->>full_name.ilike.%${search}%`)
    }

    // Get total count for pagination
    const { count: totalCount } = await query.select('*', { count: 'exact', head: true })

    // Apply pagination
    const { data: users, error: usersError } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get roles for each user
    const usersWithRoles: UserWithRole[] = []
    
    for (const user of users || []) {
      // Get user's role
      const { data: roleData } = await supabase.rpc('get_user_role', {
        user_uuid: user.id
      })

      const userWithRole: UserWithRole = {
        id: user.id,
        email: user.email,
        full_name: user.raw_user_meta_data?.full_name || null,
        role: roleData || 'user',
        is_active: !user.banned_until || new Date(user.banned_until) < new Date(),
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at
      }

      // Apply role filter
      if (roleFilter && userWithRole.role !== roleFilter) {
        continue
      }

      // Apply status filter
      if (statusFilter) {
        if (statusFilter === 'active' && !userWithRole.is_active) continue
        if (statusFilter === 'inactive' && userWithRole.is_active) continue
      }

      usersWithRoles.push(userWithRole)
    }

    return new Response(
      JSON.stringify({
        users: usersWithRoles,
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in list-users function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
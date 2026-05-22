// Idempotently seeds the Pension Navigator system admin account.
// Email: mchughdenis@mac.com, Password: Rachel986!  — assigned `admin` role.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'mchughdenis@mac.com'
const ADMIN_PASSWORD = 'Rachel986!'
const ADMIN_NAME = 'Denis McHugh'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    // Find existing user by email
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (listErr) throw listErr
    let user = list.users.find((u) => (u.email ?? '').toLowerCase() === ADMIN_EMAIL.toLowerCase())

    if (!user) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: ADMIN_NAME, source: 'seed-admin' },
      })
      if (createErr) throw createErr
      user = created.user!
    } else {
      // Ensure password matches the requested seed value
      await supabase.auth.admin.updateUserById(user.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })
    }

    // Promote to admin role (idempotent)
    await supabase.from('user_roles').upsert(
      { user_id: user!.id, role: 'admin' },
      { onConflict: 'user_id,role' },
    )

    return new Response(
      JSON.stringify({ ok: true, user_id: user!.id, email: ADMIN_EMAIL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('seed-admin failed', e)
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})

// supabase/functions/verify-profile-password/index.ts (VERSIÓN FINAL Y CORRECTA)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }
  if (req.method !== 'POST') { return new Response(JSON.stringify({ success: false, message: 'Método no permitido' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

  try {
    const { profile_id, password_attempt } = await req.json();
    if (!profile_id || password_attempt == null) { throw new Error("Faltan datos en la petición."); }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: isValid, error } = await supabaseAdminClient.rpc('erp_sistema.verify_user_password', {
        profile_id: profile_id,
        password_attempt: password_attempt
    });

    if (error) { throw new Error("Error al consultar la base de datos."); }
    
    if (isValid === true) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Contraseña incorrecta. Por favor, inténtelo de nuevo.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
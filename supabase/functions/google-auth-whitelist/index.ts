// supabase/functions/verify-profile-password/index.ts (VERSIÓN FINAL Y BLINDADA)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Función 'verify-profile-password' iniciada en modo frío.");

Deno.serve(async (req) => {
  console.log("Petición recibida.");

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Intentando parsear el cuerpo JSON...");
    const { profile_id, password_attempt } = await req.json();
    console.log("Cuerpo parseado. Profile ID recibido:", profile_id);

    if (!profile_id || password_attempt == null) {
      console.error("Error: Datos incompletos en la petición.");
      throw new Error("Faltan datos en la petición.");
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Llamando a RPC: erp_sistema.verify_user_password");
    const { data: isValid, error: rpcError } = await supabaseAdminClient.rpc('erp_sistema.verify_user_password', {
        profile_id: profile_id,
        password_attempt: password_attempt
    });

    if (rpcError) {
      console.error("Error devuelto por la llamada RPC:", rpcError);
      throw new Error("Error al consultar la base de datos.");
    }
    
    console.log("Respuesta de la RPC. ¿Contraseña válida?:", isValid);
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
    console.error("¡ERROR ATRAPADO EN EL BLOQUE CATCH!:", error);
    return new Response(JSON.stringify({ success: false, message: `Error del servidor: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
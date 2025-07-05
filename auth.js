// auth.js - VERSIÓN DE DEPURACIÓN DETALLADA

const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDg0MDcsImV4cCI6MjA2NzMyNDQwN30.6rmS5bhQO49DhTXFCMWtdtDSH_WOvKOxiT__1Hvwkr0';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
console.log('[DEBUG] Supabase Client inicializado.');

async function signInWithGoogle() {
  console.log('[DEBUG] Se hizo clic en signInWithGoogle. Redirigiendo a Google...');
  await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
}

async function handleLogout() {
  console.log('[DEBUG] Ejecutando handleLogout...');
  localStorage.removeItem('selectedProfile');
  await supabaseClient.auth.signOut();
  console.log('[DEBUG] Sesión cerrada. Redirigiendo a /');
  window.location.href = '/'; 
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  console.log(`%c[DEBUG] onAuthStateChange disparado. Evento: ${event}`, 'color: blue; font-weight: bold;');

  // Primero, verificamos si hay sesión para ver los datos
  if (session) {
    console.log('[DEBUG] Hay una sesión activa. Detalles del usuario:', session.user);
  } else {
    console.log('[DEBUG] No hay sesión activa.');
  }

  // Ahora, manejamos el evento específico
  if (event === "SIGNED_IN" && session) {
    console.log('[DEBUG] El evento es SIGNED_IN. Procediendo a verificar el email.');
    const userEmail = session.user.email;
    console.log(`[DEBUG] Email obtenido de la sesión: ${userEmail}`);

    console.log('[DEBUG] Llamando a la función RPC "verificar_email_citfsa"...');
    const { data: emailExists, error } = await supabaseClient.rpc('verificar_email_citfsa', {
      p_email: userEmail
    });

    if (error) {
      console.error('%c[DEBUG] ¡ERROR en la llamada RPC!', 'color: red; font-weight: bold;', error);
      alert("Ocurrió un error CRÍTICO al verificar tu cuenta. Revisa la consola.");
      handleLogout();
      return;
    }

    console.log(`[DEBUG] Resultado de la función RPC: emailExists = ${emailExists}`);

    if (emailExists === true) {
      console.log('%c[DEBUG] ¡ÉXITO! El email existe. Guardando sesión y redirigiendo...', 'color: green; font-weight: bold;');
      window.location.href = '/select-profile.html';
    } else {
      console.warn('%c[DEBUG] ADVERTENCIA: El email NO existe en la base de datos. Cerrando sesión.', 'color: orange; font-weight: bold;');
      alert("Tu cuenta de Google no está autorizada para acceder a este sistema.");
      handleLogout();
    }
  }
});
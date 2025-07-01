// auth.js - VERSIÓN 2: handleLogout() funcional

// La conexión a Supabase que ya sabemos que funciona
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase Client creado.");

// Esta es la función REAL para cerrar sesión
async function handleLogout() {
  console.log("Cerrando sesión...");
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Hubo un error al cerrar la sesión.');
  } else {
    // Redirigir a la página de login (la raíz de tu sitio)
    window.location.href = '/'; 
  }
}

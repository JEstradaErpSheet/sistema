<<<<<<< HEAD
// auth.js - Archivo base
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
// ¡IMPORTANTE! Pega tu clave ANÓNIMA (pública) aquí. La puedes encontrar en tu panel de Supabase en Settings -> API.
const supabaseKey = 'AQUI_VA_TU_CLAVE_ANONIMA_PUBLICA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- El resto del código lo añadiremos en los siguientes pasos ---
console.log("auth.js ha sido cargado.");
=======
// auth.js - VERSIÓN FINAL Y COMPLETA

const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("auth.js cargado y Supabase Client creado.");

async function signInWithGoogle() {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://sistema.citfsa.com/' }
  });
}

async function handleLogout() {
  localStorage.removeItem('userProfile'); // Limpia el perfil guardado al cerrar sesión
  await supabaseClient.auth.signOut();
  window.location.href = '/'; 
}

async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = '/';
  }
}

async function initializeHomePage() {
  const userProfileString = localStorage.getItem('userProfile');
  if (!userProfileString) {
    window.location.href = '/select-profile.html';
    return;
  }
  const userProfile = JSON.parse(userProfileString);

  const welcomeElement = document.getElementById('welcome-message');
  if (welcomeElement) {
    welcomeElement.textContent = `Bienvenido, ${userProfile.user_name}`;
  }
}
>>>>>>> 569182c3d47db4b9d6441ca425f0c94d88d485dc

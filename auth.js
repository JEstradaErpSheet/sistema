// js/auth.js - VERSIÓN FINAL Y COMPLETA

// --- 1. Configuración de Supabase (La Conexión) ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("auth.js cargado y Supabase Client creado.");

// --- 2. Funciones de Autenticación (Las Herramientas) ---

async function signInWithGoogle() {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://sistema.citfsa.com/' }
  });
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = '/'; 
}

// El guardia de seguridad de las páginas
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = '/'; // Si no hay sesión, expulsa al usuario al login.
  }
}

// --- 3. Funciones de Página (Ayudantes) ---

// La función que incrusta las apps de AppSheet
function embedAppSheet(iframeId, appUrl) {
  const iframe = document.getElementById(iframeId);
  if (iframe) {
    iframe.src = `${appUrl}&embed=true`;
    console.log("Iframe src establecido en:", iframe.src);
  } else {
    console.error("No se encontró el elemento iframe con id:", iframeId);
  }
}

// La función que personaliza la bienvenida en home.html
async function initializeHomePage() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
      welcomeElement.textContent = `Bienvenido, ${session.user.email}`;
    }
  }
}

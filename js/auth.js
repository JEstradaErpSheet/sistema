// --- Configuración de Supabase (sin cambios) ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- ¡NUEVA FUNCIÓN DE LOGIN! ---
async function signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        console.error('Error al iniciar sesión con Google:', error);
    }
}

// --- handleLogout, checkAuth, embedAppSheet (SIN CAMBIOS) ---
// Estas funciones ya están perfectas y funcionan con cualquier método de login.
async function handleLogout() { /* ...código sin cambios... */ }
async function checkAuth() { /* ...código sin cambios... */ }
async function embedAppSheet(iframeId, baseAppUrl) { /* ...código sin cambios... */ }

// --- Asignador de Eventos Modificado ---
document.addEventListener('DOMContentLoaded', () => {
    // Escucha el clic en el nuevo botón de Google
    const googleButton = document.getElementById('google-login-button');
    if (googleButton) {
        googleButton.addEventListener('click', signInWithGoogle);
    }

    // Al recargar la página después del callback de Google,
    // Supabase crea la sesión automáticamente. checkAuth() funcionará.
});

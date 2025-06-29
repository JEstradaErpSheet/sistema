// =================================================================
// ARCHIVO: js/auth.js (VERSIÓN CON REDIRECCIÓN EXPLÍCITA)
// =================================================================

// --- Configuración de Supabase ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Funciones de Autenticación ---

/**
 * Inicia el proceso de login con Google, especificando a dónde volver.
 */
async function signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Le decimos explícitamente a dónde volver después del login.
            // Esto anula la configuración por defecto del panel de Supabase.
            redirectTo: 'https://jestradaerpsheet.github.io/sistema/'
        }
    });
    if (error) {
        console.error('Error al iniciar sesión con Google:', error);
    }
}

/**
 * Cierra la sesión del usuario en Supabase y redirige al login.
 */
async function handleLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

/**
 * Verifica si hay una sesión activa. Si no la hay, redirige al login.
 */
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
    }
}

/**
 * Carga el iframe de AppSheet, pasándole el email del usuario de forma segura.
 */
async function embedAppSheet(iframeId, baseAppUrl) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        const userEmail = session.user.email;
        console.log('Intentando cargar AppSheet para el usuario:', userEmail);
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            const embedUrl = `${baseAppUrl}&useremail=${encodeURIComponent(userEmail)}&embed=true`;
            iframe.src = embedUrl;
        }
    }
}

// --- Asignador de Eventos Global ---
document.addEventListener('DOMContentLoaded', () => {
    // Escucha el clic en el botón de Google
    const googleButton = document.getElementById('google-login-button');
    if (googleButton) {
        googleButton.addEventListener('click', signInWithGoogle);
    }

    // Al recargar la página, supabase-js maneja el token de la URL
    // y la función checkAuth en las páginas protegidas verificará la sesión.
});

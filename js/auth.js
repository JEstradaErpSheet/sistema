// =================================================================
// ARCHIVO: js/auth.js (VERSIÓN FINAL Y COMPLETA)
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
    await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://jestradaerpsheet.github.io/sistema/'
        }
    });
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
 * Esta es la función que protege las páginas internas.
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
    // Asigna la función de login al botón de Google si existe en la página.
    const googleButton = document.getElementById('google-login-button');
    if (googleButton) {
        googleButton.addEventListener('click', signInWithGoogle);
    }
    
    // ===============================================================
    // ¡NUEVO BLOQUE DE CÓDIGO! ESTA ES LA PIEZA FINAL.
    // ===============================================================
    // Escucha los cambios en el estado de autenticación.
    supabaseClient.auth.onAuthStateChange((event, session) => {
        // Comprueba si el evento es un inicio de sesión exitoso.
        if (event === 'SIGNED_IN' && session) {
            // Comprueba si estamos actualmente en la página de login.
            const isLoginPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
            if (isLoginPage) {
                // Si acabamos de iniciar sesión y estamos en la página de login,
                // nos redirige a la página principal.
                window.location.href = 'home.html';
            }
        }
    });
});

// =================================================================
// ARCHIVO: js/auth.js (VERSIÓN COMPLETA Y FINAL)
// =================================================================

// --- Configuración de Supabase ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Funciones de Autenticación ---

/**
 * Maneja el evento de submit del formulario de login.
 */
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = ''; // Limpiar errores previos

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }
        // Si el login es exitoso, redirigir a la página principal.
        window.location.href = 'home.html';
    } catch (error) {
        console.error('Error en el login:', error.message);
        errorMessage.textContent = 'Error: Usuario o contraseña incorrectos.';
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
 * Esta función es la que protege todas las páginas internas.
 */
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        // Si no hay sesión, no permitir ver la página y redirigir.
        window.location.href = 'index.html';
    }
}

/**
 * Carga el iframe de AppSheet, pasándole el email del usuario de forma segura.
 * @param {string} iframeId - El ID del elemento iframe en el HTML.
 * @param {string} baseAppUrl - La URL base de la aplicación de AppSheet.
 */
async function embedAppSheet(iframeId, baseAppUrl) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        const userEmail = session.user.email;
        
        // **Línea de Depuración Crucial**
        // Imprime en la consola del navegador el email que se va a usar.
        console.log('Intentando cargar AppSheet para el usuario:', userEmail);
        
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            // Construimos la URL final con los parámetros de seguridad requeridos por AppSheet.
            const embedUrl = `${baseAppUrl}&useremail=${encodeURIComponent(userEmail)}&embed=true`;
            iframe.src = embedUrl;
        }
    }
}

// --- Asignador de Eventos Global ---
// Se ejecuta cuando el contenido de la página ha cargado.
document.addEventListener('DOMContentLoaded', () => {
    // Asigna la función de login solo si estamos en una página con el formulario.
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

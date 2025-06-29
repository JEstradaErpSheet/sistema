// js/auth.js (VERSIÓN MEJORADA)

// --- Configuración de Supabase ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Funciones de Autenticación ---

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        window.location.href = 'home.html';
    } catch (error) {
        errorMessage.textContent = 'Error: Usuario o contraseña incorrectos.';
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
    }
}

// --- ¡NUEVA FUNCIÓN! ---
// Esta función carga el iframe de AppSheet pasando el email del usuario
async function embedAppSheet(iframeId, baseAppUrl) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        const userEmail = session.user.email;
        const iframe = document.getElementById(iframeId);
        // Construimos la URL con los parámetros de seguridad
        const embedUrl = `${baseAppUrl}&useremail=${encodeURIComponent(userEmail)}&embed=true`;
        iframe.src = embedUrl;
    }
}

// --- Asignar Eventos ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

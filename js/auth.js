// --- Configuración de Supabase ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Funciones de Autenticación ---

// Función para manejar el login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }

        // Si el login es exitoso, redirigir a home.html
        window.location.href = 'home.html';

    } catch (error) {
        console.error('Error en el login:', error.message);
        errorMessage.textContent = 'Error: Usuario o contraseña incorrectos.';
    }
}

// Función para cerrar sesión
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error);
    } else {
        // Redirigir a la página de login
        window.location.href = 'index.html';
    }
}

// Función para proteger las páginas
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // Si no hay sesión, redirigir al login
        window.location.href = 'index.html';
    }
}

// --- Asignar Eventos ---
// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
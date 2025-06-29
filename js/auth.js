// --- Configuración de Supabase (CORREGIDO) ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';

// CORRECCIÓN: Usamos un nombre de variable diferente ('supabaseClient') para evitar conflictos.
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Funciones de Autenticación ---

// Función para manejar el login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = ''; // Limpiar errores previos

    try {
        // CORRECCIÓN: Usamos la nueva variable 'supabaseClient'
        const { data, error } = await supabaseClient.auth.signInWithPassword({
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
    // CORRECCIÓN: Usamos la nueva variable 'supabaseClient'
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error);
    } else {
        // Redirigir a la página de login
        window.location.href = 'index.html';
    }
}

// Función para proteger las páginas
async function checkAuth() {
    // CORRECCIÓN: Usamos la nueva variable 'supabaseClient'
    const { data: { session } } = await supabaseClient.auth.getSession();
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

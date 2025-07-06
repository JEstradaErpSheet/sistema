// supabase-client.js
// Este archivo contiene la configuración central de Supabase y las funciones de ayuda.
// Es seguro incluirlo en TODAS las páginas que necesiten interactuar con Supabase.

const supabaseUrl = 'https://vqdgrznxqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDg0MDcsImV4cCI6MjA2NzMyNDQwN30.6rmS5bhQO49DhTXFCMWtdtDSH_WOvKOxiT__1Hvwkr0';

// Creamos el cliente de Supabase y lo hacemos disponible globalmente
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Funciones de Ayuda ---

// Función para iniciar el login con Google
function signInWithGoogle() {
    console.log('Iniciando login con Google...');
    supabaseClient.auth.signInWithOAuth({ provider: 'google' });
}

// Función para cerrar la sesión
async function handleLogout() {
    console.log('Cerrando sesión...');
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error);
    } else {
        // Limpiamos cualquier dato guardado y redirigimos a la página de inicio
        localStorage.removeItem('supabase.auth.session');
        localStorage.removeItem('selectedProfile');
        window.location.href = '/';
    }
}
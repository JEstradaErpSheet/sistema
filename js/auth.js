// =================================================================
// ARCHIVO: js/auth.js (VERSIÓN FINAL CON VERIFICACIÓN EN CLIENTE)
// =================================================================

// --- Configuración de Supabase ---
const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDYxNjgsImV4cCI6MjA2NTU4MjE2OH0.FPcoDcsWrS-y9LwiY0mgHfjA3C4svP4lGP11vNygktQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- Funciones de Autenticación ---

async function signInWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://sistema.citfsa.com/'
        }
    });
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

async function embedAppSheet(iframeId, baseAppUrl) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        const userEmail = session.user.email;
        console.log('Cargando AppSheet para:', userEmail);
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            const embedUrl = `${baseAppUrl}&useremail=${encodeURIComponent(userEmail)}&embed=true`;
            iframe.src = embedUrl;
        }
    }
}

// --- Asignador de Eventos Global ---
document.addEventListener('DOMContentLoaded', () => {
    const googleButton = document.getElementById('google-login-button');
    if (googleButton) {
        googleButton.addEventListener('click', signInWithGoogle);
    }
    
    // ===============================================================
    // LÓGICA DE VERIFICACIÓN FINAL
    // ===============================================================
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        // Se activa cuando un usuario inicia sesión
        if (event === 'SIGNED_IN' && session) {
            const userEmail = session.user.email;
            
            // Verificamos si el usuario está en nuestra lista de permitidos
            try {
                const { data: isAllowed, error } = await supabaseClient.rpc(
                  'is_user_allowed', 
                  { user_email: userEmail }
                );

                if (error) throw error; // Si hay un error, lo tratamos como no permitido

                if (isAllowed === true) {
                    // SI ESTÁ PERMITIDO: redirigir a la página principal
                    console.log('Acceso concedido para:', userEmail);
                    window.location.href = 'home.html';
                } else {
                    // NO ESTÁ PERMITIDO: expulsarlo inmediatamente
                    console.warn('ACCESO DENEGADO para:', userEmail, '. No está en la lista de permitidos.');
                    await handleLogout(); // Cierra su sesión
                    alert('Acceso denegado. Este usuario no está autorizado.'); // Muestra un mensaje
                }
            } catch (err) {
                console.error('Error durante la verificación:', err.message);
                await handleLogout();
                alert('Ocurrió un error al verificar los permisos.');
            }
        }
    });
});

// auth.js - VERSIÓN DE PRUEBA MÍNIMA PARA LA FASE 2.1

const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
// Asegúrate de que esta es tu última y válida 'anon key'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDg0MDcsImV4cCI6MjA2NzMyNDQwN30.6rmS5bhQO49DhTXFCMWtdtDSH_WOvKOxiT__1Hvwkr0';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Función simple para iniciar el login
function signInWithGoogle() {
    console.log('Iniciando login con Google...');
    supabaseClient.auth.signInWithOAuth({ provider: 'google' });
}

// El cerebro de la prueba
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log(`Evento de Auth detectado: ${event}`);
    
    // Cuando el usuario vuelve de Google, el evento es SIGNED_IN
    if (event === "SIGNED_IN") {
        // No verificamos el email. Forzamos la redirección.
        console.log('¡SIGNED_IN detectado! Forzando redirección a select-profile.html...');
        
        // Guardamos la sesión en localStorage para que la siguiente página la use
        localStorage.setItem('supabase.auth.session', JSON.stringify(session));

        window.location.href = '/select-profile.html';
    }
});
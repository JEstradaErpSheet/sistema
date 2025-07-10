// auth.js
// Este script SÓLO se encarga de la redirección después del login.
// Debe cargarse ÚNICAMENTE en la página de inicio (index.html).

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log(`Evento de Auth detectado en la página de login: ${event}`);
    
    if (event === "SIGNED_IN") {
        console.log('¡SIGNED_IN detectado! Forzando redirección a select-profile.html...');
        localStorage.setItem('supabase.auth.session', JSON.stringify(session));
        window.location.href = '/select-profile.html';
    }
});
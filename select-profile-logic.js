// select-profile-logic.js - VERSIÓN SIMPLIFICADA

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[PROFILE_LOGIC] La página ha cargado. Iniciando lógica de perfiles.');

    // Leemos la sesión directamente de localStorage, donde auth.js la guardó.
    const sessionString = localStorage.getItem('supabase.auth.session');
    
    if (!sessionString) {
        console.error('[PROFILE_LOGIC] No se encontró la sesión en localStorage. Redirigiendo.');
        // Si no hay sesión, algo muy raro pasó. Lo mandamos al inicio.
        window.location.href = '/';
        return;
    }

    // Convertimos el string de vuelta a un objeto
    const session = JSON.parse(sessionString);
    const userEmail = session.user.email;
    console.log(`[PROFILE_LOGIC] Sesión leída de localStorage. Usuario: ${userEmail}`);

    const profilesContainer = document.getElementById('profiles-container');
    
    console.log('[PROFILE_LOGIC] Llamando a la función RPC "obtener_perfiles_citfsa"...');
    const { data: profiles, error } = await supabaseClient.rpc('obtener_perfiles_citfsa', {
        p_email: userEmail
    });

    if (error) {
        console.error('%c[PROFILE_LOGIC] ¡ERROR en la llamada RPC!', 'color: red; font-weight: bold;', error);
        profilesContainer.innerHTML = '<p class="error-text">Error crítico al cargar los perfiles. Revisa la consola.</p>';
        return;
    }

    console.log('[PROFILE_LOGIC] Llamada RPC exitosa. Perfiles recibidos:', profiles);

    if (!profiles || profiles.length === 0) {
        console.warn('[PROFILE_LOGIC] La función devolvió 0 perfiles o nulo.');
        profilesContainer.innerHTML = '<p>No se encontraron perfiles asociados a tu cuenta de Google.</p>';
        return;
    }

    console.log(`%c[PROFILE_LOGIC] ¡ÉXITO! Se encontraron ${profiles.length} perfiles. Creando botones...`, 'color: green; font-weight: bold;');
    profilesContainer.innerHTML = ''; // Limpiamos "Cargando..."

    profiles.forEach(profile => {
        const button = document.createElement('button');
        button.textContent = profile.usuario;
        button.className = 'profile-button';
        button.onclick = () => {
            promptForPassword(profile);
        };
        profilesContainer.appendChild(button);
    });
});

// La función promptForPassword sigue igual por ahora
function promptForPassword(profile) {
    // ... (código sin cambios)
}
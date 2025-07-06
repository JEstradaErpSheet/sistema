// select-profile-logic.js - VERSIÓN DE DEPURACIÓN MÁXIMA

document.addEventListener('DOMContentLoaded', async () => {
    console.log('PÁGINA CARGADA. Iniciando...');

    const sessionString = localStorage.getItem('supabase.auth.session');
    if (!sessionString) {
        console.error('ERROR CRÍTICO: No hay sesión en localStorage. Saliendo.');
        window.location.href = '/';
        return;
    }

    const session = JSON.parse(sessionString);
    console.log('Sesión encontrada para:', session.user.email);

    const profilesContainer = document.getElementById('profiles-container');
    
    console.log('Llamando a RPC: obtener_perfiles_citfsa...');
    const { data: profiles, error } = await supabaseClient.rpc('obtener_perfiles_citfsa', {
        p_email: session.user.email
    });

    if (error) {
        console.error('ERROR EN LA LLAMADA RPC:', error);
        profilesContainer.innerHTML = '<p>Error al obtener perfiles.</p>';
        return;
    }

    console.log('Llamada RPC completada. DATOS RECIBIDOS:', profiles);
    
    // Verificación exhaustiva de los datos recibidos
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
        console.warn('Los datos recibidos no son un array válido o están vacíos.');
        profilesContainer.innerHTML = '<p>No se encontraron perfiles para esta cuenta.</p>';
        return;
    }

    console.log(`¡ÉXITO! Se encontraron ${profiles.length} perfiles.`);
    profilesContainer.innerHTML = ''; // Limpiar

    // Iteramos y mostramos cada propiedad del objeto para depurar
    profiles.forEach((profile, index) => {
        console.log(`--- Procesando Perfil #${index + 1} ---`);
        console.log('Objeto de perfil completo:', profile);
        
        // Verificamos si la propiedad 'usuario' existe
        if (profile.hasOwnProperty('usuario')) {
            console.log(`Propiedad 'usuario' encontrada. Valor: "${profile.usuario}"`);
        } else {
            console.error(`ERROR: El objeto de perfil #${index + 1} NO tiene una propiedad llamada 'usuario'.`);
            // Si no existe, no podemos crear el botón. Saltamos al siguiente.
            return; 
        }

        const button = document.createElement('button');
        button.textContent = profile.usuario;
        button.className = 'profile-button';
        button.onclick = () => {
            promptForPassword(profile);
        };
        profilesContainer.appendChild(button);
    });
});

// La función promptForPassword no la tocamos por ahora.
function promptForPassword(profile) {
    // ... (código existente) ...
}
// select-profile-logic.js - VERSIÓN FINAL AJUSTADA

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[PROFILE_LOGIC] La página ha cargado. Iniciando lógica de perfiles.');

    // Leemos la sesión directamente de localStorage, donde auth.js la guardó.
    const sessionString = localStorage.getItem('supabase.auth.session');
    
    if (!sessionString) {
        console.error('[PROFILE_LOGIC] No se encontró la sesión en localStorage. Redirigiendo.');
        window.location.href = '/';
        return;
    }

    const session = JSON.parse(sessionString);
    const userEmail = session.user.email;
    console.log(`[PROFILE_LOGIC] Sesión leída de localStorage. Usuario: ${userEmail}`);

    const profilesContainer = document.getElementById('profiles-container');
    
    console.log('[PROFILE_LOGIC] Llamando a la función RPC "obtener_perfiles_citfsa"...');
    const { data: profiles, error } = await supabaseClient.rpc('obtener_perfiles_citfsa', {
        p_email: userEmail
    });

    if (error) {
        console.error('%c[PROFILE_LOGIC] ¡ERROR en la llamada RPC para obtener perfiles!', 'color: red; font-weight: bold;', error);
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

/**
 * Muestra un modal para que el usuario ingrese la contraseña de su perfil.
 * @param {object} profile - El objeto de perfil seleccionado.
 */
function promptForPassword(profile) {
    const modal = document.getElementById('password-modal');
    const title = document.getElementById('password-prompt-title');
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('password-submit-btn');
    
    title.textContent = `Contraseña para ${profile.usuario}`;
    passwordInput.value = '';
    modal.style.display = 'block'; // Mostramos el modal

    submitBtn.onclick = async () => {
        const password = passwordInput.value;
        if (!password) {
            alert('Por favor, ingresa una contraseña.');
            return;
        }

        console.log(`[PROFILE_LOGIC] Verificando contraseña para el usuario ID: ${profile.id_usuario}`);
        
        // ¡CAMBIO IMPORTANTE! Usamos el nuevo nombre de la función: verificar_contrasena_citfsa
        const { data: isValid, error } = await supabaseClient.rpc('verificar_contrasena_citfsa', {
            p_id_usuario: profile.id_usuario,
            p_contrasena: password
        });

        if (error) {
            console.error('%c[PROFILE_LOGIC] ¡ERROR en la llamada RPC para verificar contraseña!', 'color: red; font-weight: bold;', error);
            alert('Ocurrió un error al verificar la contraseña. Inténtalo de nuevo.');
            return;
        }

        if (isValid) {
            console.log('%c[PROFILE_LOGIC] ¡Contraseña correcta! Redirigiendo a home.html...', 'color: green; font-weight: bold;');
            // Guardamos el perfil seleccionado para usarlo en la página principal
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            window.location.href = '/home.html';
        } else {
            console.warn('[PROFILE_LOGIC] Contraseña incorrecta.');
            alert('Contraseña incorrecta.');
            passwordInput.focus(); // Ponemos el foco de nuevo en el campo de contraseña
        }
    };
}
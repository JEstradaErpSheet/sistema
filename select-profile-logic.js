// select-profile-logic.js - VERSIÓN DEFINITIVA CON SEGURIDAD RLS/JWT

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient === 'undefined') {
        console.error("supabaseClient no está definido. Asegúrate de que supabase-client.js se carga primero.");
        return;
    }
    
    // NOTA: Tu código original usaba 'supabase.auth.session'. 
    // La forma moderna es supabase.auth.getSession(). 
    // Ambas funcionan, pero mantendremos tu lógica original por consistencia.
    const sessionString = localStorage.getItem('supabase.auth.session'); 
    if (!sessionString) {
        console.error('No hay sesión en localStorage. Redirigiendo al inicio.');
        window.location.href = '/';
        return;
    }

    const session = JSON.parse(sessionString);
    const profilesContainer = document.getElementById('profiles-container');
    
    // Esta parte de tu código funciona perfectamente y no se ha cambiado.
    console.log('Obteniendo perfiles para:', session.user.email);
    const { data: profiles, error } = await supabaseClient.rpc('obtener_perfiles_citfsa', { p_email: session.user.email });

    if (error) {
        profilesContainer.innerHTML = '<p>Error al obtener perfiles. Contacta al administrador.</p>';
        console.error("Error RPC al obtener perfiles:", error);
        return;
    }

    if (!profiles || profiles.length === 0) {
        profilesContainer.innerHTML = `
            <p>No se encontraron perfiles para esta cuenta.</p>
            <button onclick="handleLogout()" class="logout-button">Cerrar Sesión</button>
        `;
        return;
    }

    profilesContainer.innerHTML = '';
    profiles.forEach(profile => {
        const button = document.createElement('button');
        button.textContent = profile.etiquetausuario || profile.usuario;
        button.className = 'profile-button';
        button.onclick = () => promptForPassword(profile);
        profilesContainer.appendChild(button);
    });
});

/**
 * Esta es tu función original, que funciona con tu HTML.
 * Solo se ha modificado la lógica interna de validación de contraseña.
 */
function promptForPassword(profile) {
    const modal = document.getElementById('password-modal');
    const title = document.getElementById('password-prompt-title');
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('password-submit-btn');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('toggle-password-visibility');

    // Esta parte de la UI no ha cambiado.
    title.textContent = `Contraseña para ${profile.etiquetausuario}`;
    passwordInput.value = '';
    errorMessage.textContent = '';
    modal.style.display = 'flex';
    passwordInput.focus();

    togglePassword.onclick = () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    };
    passwordInput.setAttribute('type', 'password');
    togglePassword.textContent = '👁️';

    // Este es el manejador del botón que contiene el único cambio crítico.
    submitBtn.onclick = async () => {
        const password = passwordInput.value;
        if (!password) { errorMessage.textContent = 'Por favor, ingresa una contraseña.'; return; }
        errorMessage.textContent = 'Verificando...';

        // 1. Verificar la contraseña (sin cambios).
        const { data, error } = await supabaseClient.rpc('verificar_contrasena_citfsa', {
            p_id_usuario: profile.id_usuario,
            p_contrasena_ingresada: password
        });

        if (error) {
            errorMessage.textContent = 'Error del sistema. Inténtalo de nuevo.';
            console.error("Error al verificar contraseña:", error);
            return;
        }

        // 2. Si la contraseña es correcta, ejecutamos la lógica de seguridad final.
        if (data === true) {
            console.log('Contraseña correcta. Sellando el pasaporte del usuario (JWT)...');
            
            // --- INICIO DEL CÓDIGO FINAL Y CORRECTO ---
            // Reemplazamos la llamada a la función eliminada 'set_active_profile'
            // con el método correcto para actualizar el JWT del usuario.
            const { error: updateError } = await supabaseClient.auth.updateUser({
                data: {
                    // El nombre 'profile_id' aquí DEBE COINCIDIR con el que busca 
                    // nuestra función SQL 'public.get_profile_id()'.
                    profile_id: profile.id_usuario 
                }
            });

            if (updateError) {
                console.error('Error crítico al sellar el pasaporte (JWT):', updateError);
                errorMessage.textContent = 'No se pudo iniciar la sesión del perfil. Contacta a soporte.';
                return; // Detenemos la redirección si no podemos actualizar el JWT.
            }
            // --- FIN DEL CÓDIGO FINAL Y CORRECTO ---

            console.log('Pasaporte sellado. Redirigiendo a home.html...');
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            window.location.href = '/home.html';
        } else {
            errorMessage.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
            passwordInput.focus();
            passwordInput.select();
        }
    };
}
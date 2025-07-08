// select-profile-logic.js - VERSIÓN FINAL (con Contexto de Sesión)

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient === 'undefined') {
        console.error("supabaseClient no está definido. Asegúrate de que supabase-client.js se carga primero.");
        return;
    }
    
    const sessionString = localStorage.getItem('supabase.auth.session');
    if (!sessionString) {
        console.error('No hay sesión en localStorage. Redirigiendo al inicio.');
        window.location.href = '/';
        return;
    }

    const session = JSON.parse(sessionString);
    const profilesContainer = document.getElementById('profiles-container');
    
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

function promptForPassword(profile) {
    const modal = document.getElementById('password-modal');
    const title = document.getElementById('password-prompt-title');
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('password-submit-btn');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('toggle-password-visibility');

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

    submitBtn.onclick = async () => {
        const password = passwordInput.value;
        if (!password) { errorMessage.textContent = 'Por favor, ingresa una contraseña.'; return; }
        errorMessage.textContent = 'Verificando...';

        const { data, error } = await supabaseClient.rpc('verificar_contrasena_citfsa', {
            p_id_usuario: profile.id_usuario,
            p_contrasena_ingresada: password
        });

        if (error) {
            errorMessage.textContent = 'Error del sistema. Inténtalo de nuevo.';
            console.error("Error al verificar contraseña:", error);
            return;
        }

        if (data === true) {
            console.log('Contraseña correcta. Estableciendo perfil activo en la sesión...');
            
            // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA CRÍTICA! ---
            // Le decimos a la base de datos qué perfil vamos a usar en esta sesión.
            const { error: setError } = await supabaseClient.rpc('set_active_profile', {
                profile_id: profile.id_usuario
            });

            if (setError) {
                console.error('Error crítico al establecer el perfil activo:', setError);
                errorMessage.textContent = 'No se pudo iniciar la sesión del perfil. Inténtalo de nuevo.';
                return; // Detenemos la redirección si no podemos establecer el perfil.
            }
            // --- FIN DE LA NUEVA LÓGICA ---

            console.log('Perfil activo establecido. Redirigiendo a home.html...');
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            window.location.href = '/home.html';
        } else {
            errorMessage.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
            passwordInput.focus();
            passwordInput.select();
        }
    };
}
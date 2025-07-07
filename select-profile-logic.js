// select-profile-logic.js - VERSIÓN FINAL (con el nombre de la función RPC corregido)

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
    
    const { data: profiles, error } = await supabaseClient.rpc('obtener_perfiles_citfsa', {
        p_email: session.user.email
    });

    if (error) {
        console.error('ERROR EN LA LLAMADA RPC:', error);
        profilesContainer.innerHTML = '<p>Error al obtener perfiles. Por favor, contacta al administrador.</p>';
        return;
    }

    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
        console.warn('Los datos recibidos no son un array válido o están vacíos.');
        profilesContainer.innerHTML = `
            <p>No se encontraron perfiles para esta cuenta.</p>
            <p>Por favor, contacta al administrador del sistema.</p>
            <button onclick="handleLogout()" class="logout-button">Cerrar Sesión</button>
        `;
        return;
    }

    profilesContainer.innerHTML = '';

    profiles.forEach((profile, index) => {
        const buttonText = profile.etiquetausuario || profile.usuario || 'Perfil sin nombre';
        const button = document.createElement('button');
        button.textContent = buttonText;
        button.className = 'profile-button';
        button.onclick = () => {
            promptForPassword(profile);
        };
        profilesContainer.appendChild(button);
    });
});

function promptForPassword(profile) {
    console.log('Solicitando contraseña para el perfil:', profile);

    const modal = document.getElementById('password-modal');
    const title = document.getElementById('password-prompt-title');
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('password-submit-btn');
    const errorMessage = document.getElementById('error-message');

    title.textContent = `Contraseña para ${profile.etiquetausuario}`;
    passwordInput.value = '';
    errorMessage.textContent = '';
    modal.style.display = 'block';
    passwordInput.focus();

    submitBtn.onclick = async () => {
        const password = passwordInput.value;
        if (!password) {
            errorMessage.textContent = 'Por favor, ingresa una contraseña.';
            return;
        }

        errorMessage.textContent = 'Verificando...';

        // --- INICIO DE LA CORRECCIÓN CLAVE ---
        // Llamamos a la función con su nombre REAL y los parámetros CORRECTOS
        const { data, error } = await supabaseClient.rpc('verificar_contrasena_citfsa', {
            p_id_usuario: profile.id_usuario,
            p_contrasena_ingresada: password
        });
        // --- FIN DE LA CORRECCIÓN CLAVE ---

        if (error) {
            console.error('Error al verificar contraseña:', error);
            errorMessage.textContent = 'Error del sistema. Inténtalo de nuevo.';
            return;
        }

        if (data === true) {
            console.log('¡Contraseña correcta! Redirigiendo a home.html...');
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            window.location.href = '/home.html';
        } else {
            console.warn('Contraseña incorrecta.');
            errorMessage.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
            passwordInput.focus();
            passwordInput.select();
        }
    };
}
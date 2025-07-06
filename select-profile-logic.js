// select-profile-logic.js - VERSIÓN COMPLETA Y FINAL (Ajustada a tu función SQL)

document.addEventListener('DOMContentLoaded', async () => {
    console.log('PÁGINA CARGADA. Iniciando...');

    // 1. Verificar si hay sesión
    const sessionString = localStorage.getItem('supabase.auth.session');
    if (!sessionString) {
        console.error('ERROR CRÍTICO: No hay sesión en localStorage. Saliendo.');
        window.location.href = '/';
        return;
    }

    const session = JSON.parse(sessionString);
    console.log('Sesión encontrada para:', session.user.email);

    const profilesContainer = document.getElementById('profiles-container');
    
    // 2. Obtener los perfiles del usuario
    console.log('Llamando a RPC: obtener_perfiles_citfsa...');
    const { data: profiles, error } = await supabaseClient.rpc('obtener_perfiles_citfsa', {
        p_email: session.user.email
    });

    if (error) {
        console.error('ERROR EN LA LLAMADA RPC:', error);
        profilesContainer.innerHTML = '<p>Error al obtener perfiles. Por favor, contacta al administrador.</p>';
        return;
    }

    console.log('Llamada RPC completada. DATOS RECIBIDOS:', profiles);
    
    // 3. Manejar el caso de que no haya perfiles
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
        console.warn('Los datos recibidos no son un array válido o están vacíos.');
        profilesContainer.innerHTML = `
            <p>No se encontraron perfiles para esta cuenta.</p>
            <p>Por favor, contacta al administrador del sistema.</p>
            <button onclick="handleLogout()" class="logout-button">Cerrar Sesión</button>
        `;
        return;
    }

    // 4. Si hay perfiles, creamos los botones
    console.log(`¡ÉXITO! Se encontraron ${profiles.length} perfiles.`);
    profilesContainer.innerHTML = ''; // Limpiar el mensaje "Cargando..."

    profiles.forEach((profile, index) => {
        console.log(`--- Procesando Perfil #${index + 1}:`, profile);
        
        if (!profile.hasOwnProperty('etiquetausuario')) {
            console.error(`ERROR: El perfil #${index + 1} no tiene la propiedad 'etiquetausuario'.`);
            return;
        }

        const button = document.createElement('button');
        button.textContent = profile.etiquetausuario;
        button.className = 'profile-button';
        button.onclick = () => {
            promptForPassword(profile);
        };
        profilesContainer.appendChild(button);
    });
});


/**
 * Muestra el modal para pedir la contraseña de un perfil específico.
 * @param {object} profile El objeto de perfil seleccionado.
 */
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

        console.log(`Verificando contraseña para el usuario ID: ${profile.id_usuario}`);
        errorMessage.textContent = 'Verificando...';

        // --- INICIO DE LA CORRECCIÓN ---
        // Llamamos a TU función de Supabase con los nombres de parámetros CORRECTOS
        const { data, error } = await supabaseClient.rpc('verify_user_password_citfsa', {
            p_id_usuario: profile.id_usuario,         // Ajustado de p_user_id a p_id_usuario
            p_contrasena_ingresada: password       // Ajustado de p_password a p_contrasena_ingresada
        });
        // --- FIN DE LA CORRECCIÓN ---

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
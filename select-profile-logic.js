// select-profile-logic.js - VERSIÓN FINAL CON "OJO"

document.addEventListener('DOMContentLoaded', async () => {
    // ... (El código de carga de perfiles no cambia y ya funciona, lo dejamos igual)
    if (typeof supabaseClient === 'undefined') return;
    const sessionString = localStorage.getItem('supabase.auth.session');
    if (!sessionString) { window.location.href = '/'; return; }
    const session = JSON.parse(sessionString);
    const profilesContainer = document.getElementById('profiles-container');
    const { data: profiles, error } = await supabaseClient.rpc('obtener_perfiles_citfsa', { p_email: session.user.email });
    if (error) { profilesContainer.innerHTML = '<p>Error al obtener perfiles.</p>'; return; }
    if (!profiles || profiles.length === 0) {
        profilesContainer.innerHTML = `<p>No se encontraron perfiles.</p><button onclick="handleLogout()" class="logout-button">Cerrar Sesión</button>`;
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
    const togglePassword = document.getElementById('toggle-password-visibility'); // El "ojo"

    title.textContent = `Contraseña para ${profile.etiquetausuario}`;
    passwordInput.value = '';
    errorMessage.textContent = '';
    modal.style.display = 'flex'; // Usamos flex para centrar
    passwordInput.focus();

    // Lógica para mostrar/ocultar contraseña
    togglePassword.onclick = () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    };
    // Reseteamos el ojo al estado inicial
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

        if (error) { errorMessage.textContent = 'Error del sistema. Inténtalo de nuevo.'; return; }

        if (data === true) {
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            window.location.href = '/home.html';
        } else {
            errorMessage.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
            passwordInput.focus();
            passwordInput.select();
        }
    };
}
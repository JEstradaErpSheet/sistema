// select-profile-logic.js

// Este código se ejecuta solo cuando el HTML de la página está listo
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    // Si por alguna razón el usuario llega aquí sin sesión, lo echamos.
    if (!session) {
        window.location.href = '/';
        return;
    }

    const userEmail = session.user.email;
    const profilesContainer = document.getElementById('profiles-container');
    
    // Llamamos a la función SQL para obtener los perfiles asociados al email
    const { data: profiles, error } = await supabaseClient.rpc('erp_sistema.obtener_perfiles_por_email', {
        p_email: userEmail
    });

    if (error || !profiles) {
        profilesContainer.innerHTML = '<p class="error-text">Error al cargar los perfiles.</p>';
        return;
    }

    if (profiles.length === 0) {
        profilesContainer.innerHTML = '<p>No se encontraron perfiles para tu cuenta.</p>';
        return;
    }

    profilesContainer.innerHTML = ''; // Limpiamos el mensaje "Cargando..."

    // Creamos un botón por cada perfil encontrado
    profiles.forEach(profile => {
        const button = document.createElement('button');
        // Usamos la columna 'usuario' que definiste en tu función SQL
        button.textContent = profile.usuario; 
        button.className = 'profile-button';
        button.onclick = () => {
            // Al hacer clic, mostramos el modal de la contraseña
            promptForPassword(profile);
        };
        profilesContainer.appendChild(button);
    });
});

function promptForPassword(profile) {
    const modal = document.getElementById('password-modal');
    const title = document.getElementById('password-prompt-title');
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('password-submit-btn');
    
    // Usamos la columna 'usuario' de nuevo
    title.textContent = `Contraseña para ${profile.usuario}`;
    passwordInput.value = '';
    modal.style.display = 'block'; // Mostramos el modal

    submitBtn.onclick = async () => {
        const password = passwordInput.value;
        if (!password) return;

        // Llamamos a la función SQL para verificar la contraseña
        const { data: isValid, error } = await supabaseClient.rpc('erp_sistema.verificar_contrasena_perfil', {
            p_id_usuario: profile.id_usuario,
            p_contrasena: password
        });

        if (error) {
            alert('Error al verificar la contraseña.');
            return;
        }

        if (isValid) {
            // ¡Éxito! Guardamos el perfil completo en el almacenamiento local del navegador
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            // Y lo mandamos a la página principal
            window.location.href = '/home.html';
        } else {
            alert('Contraseña incorrecta.');
        }
    };
}
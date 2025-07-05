// select-profile-logic.js - VERSIÓN DE DEPURACIÓN

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[PROFILE_LOGIC] La página ha cargado. Iniciando lógica de perfiles.');

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        console.error('[PROFILE_LOGIC] Error obteniendo la sesión o no hay sesión. Redirigiendo.', sessionError);
        window.location.href = '/';
        return;
    }

    console.log('[PROFILE_LOGIC] Sesión encontrada. Usuario:', session.user.email);
    const userEmail = session.user.email;
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

// La función promptForPassword no necesita cambios por ahora.
function promptForPassword(profile) {
    const modal = document.getElementById('password-modal');
    const title = document.getElementById('password-prompt-title');
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('password-submit-btn');
    
    title.textContent = `Contraseña para ${profile.usuario}`;
    passwordInput.value = '';
    modal.style.display = 'block';

    submitBtn.onclick = async () => {
        // ... (esta lógica la depuraremos después si es necesario)
        // Por ahora, asumimos que llegará aquí correctamente.
        const password = passwordInput.value;
        if (!password) return;

        // Aquí también necesitaremos una función RPC para la contraseña
        // Asegurémonos de que exista o la creamos
        const { data: isValid, error } = await supabaseClient.rpc('verificar_contrasena_perfil', {
            p_id_usuario: profile.id_usuario,
            p_contrasena: password
        });
        
        if(isValid){
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            window.location.href = '/home.html';
        } else {
            alert('Contraseña incorrecta.');
        }
    };
}
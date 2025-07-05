// auth.js - Lógica de Autenticación Principal

const supabaseUrl = 'https://vqdgrzrxnqrgkafuwppy.supabase.co';
// ¡IMPORTANTE! Reemplaza esto con tu clave pública (anon key) si es diferente
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZGdyenJ4bnFyZ2thZnV3cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU5NDQ5NjEsImV4cCI6MjAwMTUyMDk2MX0.l6Ex-94p-7m3iI4sLF6H13B4w1a_8G22h5z4u_vINZk';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function signInWithGoogle() {
  const errorP = document.getElementById('error-message');
  if(errorP) errorP.textContent = '';
  await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
}

async function handleLogout() {
  localStorage.removeItem('selectedProfile');
  await supabaseClient.auth.signOut();
  window.location.href = '/'; 
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN" && session) {
    console.log("Evento SIGNED_IN detectado. Verificando email...");
    const userEmail = session.user.email;
    const { data: emailExists, error } = await supabaseClient.rpc('erp_sistema.verificar_email_registrado', { p_email: userEmail });

    if (error) {
      console.error("Error al verificar email:", error);
      alert("Ocurrió un error al verificar tu cuenta. Contacta a soporte.");
      handleLogout();
      return;
    }

    if (emailExists) {
      window.location.href = '/select-profile.html';
    } else {
      alert("Tu cuenta de Google no está autorizada para acceder a este sistema.");
      handleLogout();
    }
  } else if (event === "SIGNED_OUT") {
    localStorage.removeItem('selectedProfile');
    window.location.href = '/';
  }
});
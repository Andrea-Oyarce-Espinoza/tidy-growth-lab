export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <a className="eyebrow" href="/">
        ← TIDY GROWTH LAB
      </a>
      <h1>Privacidad y tus datos</h1>
      <p>
        Actualizado el 5 de noviembre de 2026. Tidy Growth Lab es una
        herramienta de Tidy Studio. Para consultas sobre tus datos, escribe a{" "}
        <a href="mailto:amoyarcee@gmail.com">amoyarcee@gmail.com</a>.
      </p>
      <h2>Qué información usamos</h2>
      <p>
        Usamos tu correo para identificar tu cuenta. Si ingresas con Google,
        recibimos la identidad básica autorizada, que puede incluir nombre,
        correo y foto de perfil. No solicitamos acceso a Gmail, Drive, contactos
        ni a tus redes sociales.
      </p>
      <p>
        Guardamos los datos que ingresas en tu plan: ideas, publicaciones,
        fechas, estados, seguidores y métricas. La contraseña del acceso por
        correo se gestiona mediante Supabase Auth. La herramienta no recibe tu
        contraseña de Google.
      </p>
      <h2>Para qué la usamos</h2>
      <p>
        Para darte acceso, asociar tu planificación a tu cuenta y guardar los
        cambios que confirmas con «Guardar mi plan». Registrarte no te suscribe
        a correos promocionales.
      </p>
      <h2>Dónde se procesa</h2>
      <p>
        La aplicación se aloja en Vercel y usa Supabase para autenticar usuarios
        y almacenar sus planes. Google participa cuando eliges ese método de
        acceso. Estos proveedores procesan información necesaria para prestar el
        servicio, incluida información técnica de las solicitudes. La sesión
        utiliza almacenamiento del navegador para mantener tu acceso.
      </p>
      <h2>Tu espacio y tus opciones</h2>
      <p>
        Los planes se asocian a la identidad autenticada y tienen reglas de
        acceso por usuario. Puedes exportar tu planificación desde la
        herramienta. Los datos de tu cuenta se conservan para que puedas volver
        a usarla.
      </p>
      <p>
        Para solicitar la eliminación de tu cuenta y su plan, escribe desde el
        correo de tu cuenta a{" "}
        <a href="mailto:amoyarcee@gmail.com">amoyarcee@gmail.com</a>.
        Revisaremos la solicitud y te confirmaremos el proceso. Puedes
        administrar los permisos concedidos a la aplicación desde tu cuenta de
        Google; revocarlos no equivale a eliminar el plan almacenado.
      </p>
      <h2>Acceso y recuperación</h2>
      <p>
        Si usas correo y contraseña, puedes solicitar un enlace de recuperación.
        Si usas Google, el acceso a esa cuenta se recupera mediante Google.
        Nunca envíes contraseñas ni enlaces de recuperación al correo de
        soporte.
      </p>
      <a className="public-button" href="/acceso">
        Volver al acceso →
      </a>
    </main>
  );
}

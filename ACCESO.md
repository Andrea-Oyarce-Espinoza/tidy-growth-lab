# Contraseña y Google

## Recuperación de contraseña

En `/acceso`, «Olvidé mi contraseña» abre `/recuperar`. El formulario solicita el correo y llama a `resetPasswordForEmail`, con retorno a `https://tidy-growth-lab.vercel.app/recuperar`.

El enlace de Supabase establece la sesión y emite `PASSWORD_RECOVERY`. Solo ese evento habilita el formulario de contraseña nueva; una sesión normal no lo hace. Antes de actualizar, se valida la identidad con `getUser` y se comprueba que sea la misma del enlace. Las dos contraseñas deben coincidir y tener entre 12 y 128 caracteres. La actualización usa `updateUser` y conserva el mismo identificador de cuenta y sus planes.

La respuesta al solicitar el enlace no confirma si el correo tiene cuenta. Los enlaces vencidos o ya utilizados necesitan una nueva solicitud. Si se recarga la página después de consumir el enlace, puede ser necesario pedir otro. Nunca se guarda ni se envía la contraseña al soporte.

**El envío sigue dependiendo del SMTP de Supabase.** Con el remitente predeterminado solo se pueden probar destinatarios del equipo del proyecto. Hace falta un remitente SMTP propio para recuperación y registro por correo de la audiencia.

## Google OAuth

- Proyecto de Google Cloud: `tidy-growth-lab`.
- Cliente web: `Tidy Growth Lab Web`.
- Origen de JavaScript: `https://tidy-growth-lab.vercel.app`.
- URI de retorno autorizado en Google: `https://gnenwedzjwdzvgrzhhpr.supabase.co/auth/v1/callback`.
- Retorno de Supabase a la aplicación: `https://tidy-growth-lab.vercel.app/mi-lab`.
- El Client ID y Client Secret se guardan en el proveedor Google de Supabase. El secreto no se utiliza en Vercel ni en el código del navegador.
- La aplicación solicita `openid email profile`. No solicita Gmail, Drive, contactos ni acceso a redes sociales.
- El botón consulta `/auth/v1/settings` con la clave pública; se deshabilita si Google no está habilitado o la comprobación no se completa. Una vez configurado el proveedor, se activa sin una variable adicional de compilación.
- La pantalla `/privacidad` explica el uso de datos y el contacto de soporte elegido.

El acceso con Google usa Google para verificar la identidad y no envía un correo de confirmación mediante el SMTP de la aplicación. Si alguien pierde el acceso a Google, debe recuperarlo mediante Google.

## Comprobaciones

Las pruebas automatizadas verifican que una sesión normal no autoriza recuperación, que la autorización sobrevive a la renovación de la misma sesión y que se revoca al cerrar sesión o cambiar de identidad.

Prueba manual con la persona titular de una cuenta:

1. Google: pulsar «Continuar con Google», completar el consentimiento, volver a `/mi-lab`, guardar un plan y recargar.
2. Correo: solicitar recuperación, abrir el enlace, probar contraseñas distintas, guardar una nueva y comprobar el ingreso. Probar también un enlace vencido. No ejecutar envíos de prueba a terceros.
3. Confirmar que el cambio de contraseña conserva el plan y que otra cuenta sigue sin poder verlo.

Referencias: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail y https://supabase.com/docs/guides/auth/social-sign-in/auth-google

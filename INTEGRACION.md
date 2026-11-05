# Estado de la integración · 5 de noviembre de 2026

- Aplicación publicada: https://tidy-growth-lab.vercel.app
- Repositorio: https://github.com/Andrea-Oyarce-Espinoza/tidy-growth-lab
- Vercel: proyecto `tidy-growth-lab`, equipo `andrea-oyarce-espinozas-projects`, rama de producción `main`.
- Supabase: proyecto `tidy-growth-lab`, referencia `gnenwedzjwdzvgrzhhpr`.
- Las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` están configuradas en Vercel para producción, preview y desarrollo. `.env.local` y `.vercel/` están excluidos de Git.
- Site URL de Supabase: `https://tidy-growth-lab.vercel.app`. Redirects permitidos: `https://tidy-growth-lab.vercel.app/mi-lab` y `https://tidy-growth-lab.vercel.app/recuperar`.
- Registro por correo habilitado, confirmación de correo requerida y acceso anónimo deshabilitado.

## Base de datos

El esquema de `supabase/migrations/001_private_plans.sql` se aplicó al proyecto alojado mediante SQL Editor. La tabla `public.plans` tiene RLS activado y cuatro políticas de propiedad (lectura, creación, actualización y eliminación). No volver a ejecutar ese archivo en este proyecto: las tablas y políticas ya existen. El archivo conserva el esquema para otros entornos; esta aplicación manual no creó una entrada en el historial de migraciones.

Se ejecutó una prueba transaccional con dos identidades temporales que confirmó:

1. Un usuario puede crear y consultar su propio plan.
2. No puede crear un plan para otro usuario ni transferirle la propiedad.
3. Otra identidad no puede consultar ni actualizar el plan ajeno.
4. El rol anónimo no puede consultar la tabla.

La transacción se revirtió al terminar; las identidades y el plan de prueba no quedaron guardados. Una comprobación adicional por la API pública confirmó el proveedor de correo activo, la confirmación obligatoria y respuesta HTTP 401 al acceso anónimo a planes.

La compilación en Vercel finalizó correctamente y se revisaron la página pública y la pantalla de registro publicadas. El recorrido de registro por correo → confirmación → ingreso → guardado sigue pendiente del proveedor SMTP. El recorrido con Google se verificó con la cuenta titular: consentimiento, retorno al plan personal vacío y sesión conservada al navegar y recargar.

## Pendiente para abrir el registro a la audiencia

**Configurar un proveedor SMTP propio y su remitente verificado.** Actualmente está desactivado el SMTP personalizado: el envío predeterminado de Supabase es para pruebas y solo admite destinatarios del equipo del proyecto. No está listo para registrar correos arbitrarios de la audiencia.

Documentación oficial: https://supabase.com/docs/guides/auth/auth-smtp

Después de configurar el remitente, probar con dos correos reales distintos: registro y confirmación, ingreso, crear una publicación, guardar, recargar y comprobar que cada cuenta ve solo sus datos. La confirmación de correo sigue activada. El formulario no suscribe a marketing.

La configuración SMTP se realiza en Supabase; sus credenciales no deben agregarse a variables `NEXT_PUBLIC_` ni al repositorio.

## Recuperación y Google OAuth

La interfaz incluye «Olvidé mi contraseña», una página para elegir la nueva contraseña tras un enlace de recuperación válido y el botón de Google. Google está habilitado en Supabase; el botón consulta el estado real del proveedor. El cliente OAuth se configura en el proyecto de Google Cloud `tidy-growth-lab`. Consulta `ACCESO.md` para configuración y validación.

Google Cloud confirmó el estado «En producción» para usuarios externos. Se verificó en el navegador el acceso con Google y, por API, el proveedor habilitado y el callback correcto. La recuperación se comprobó sin enlace y con una sesión normal: ambas muestran únicamente la solicitud por correo; no autorizan un cambio de contraseña. Seis pruebas y la compilación local y de Vercel pasaron. La entrega del correo y el cambio con enlace real siguen pendientes de SMTP.

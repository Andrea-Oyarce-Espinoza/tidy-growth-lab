# Activar Tidy Growth Lab con Vercel y Supabase

La aplicación ya está publicada y conectada a GitHub, Vercel y Supabase. Consulta `INTEGRACION.md` para ver el estado verificado y el envío de correo pendiente. Los pasos siguientes sirven como referencia para otros entornos; el SQL ya está aplicado al proyecto actual.

## 1. Supabase

1. Crea un proyecto y guarda la contraseña de base de datos en tu gestor de contraseñas.
2. En SQL Editor ejecuta `supabase/migrations/001_private_plans.sql` una sola vez. La tabla tiene políticas RLS: cada usuario solo puede leer y modificar la fila cuyo `user_id` coincide con su identidad autenticada.
3. En Authentication activa Email y la confirmación de correo. Configura una contraseña mínima de 12 caracteres. Para un lanzamiento abierto, configura tu proveedor SMTP y comprueba la entrega de confirmaciones y los límites de envío. Configura CAPTCHA y límites contra abuso según el tráfico esperado.
4. En la configuración API copia Project URL y la clave **publishable**. No uses `service_role`, secret key ni la contraseña de la base de datos en variables públicas.
5. Copia `.env.example` a `.env.local` y completa sus dos variables. Reinicia el servidor.
6. En Authentication → URL Configuration agrega `http://127.0.0.1:3000/mi-lab` a los redirects permitidos para desarrollo.

## 2. Vercel

1. Sube el repositorio a tu GitHub y conecta ese repositorio desde New Project en Vercel. Usa el preset Next.js, con el directorio de este proyecto como raíz.
2. Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para los entornos que utilizarás. No contienen credenciales administrativas; el aislamiento depende de RLS.
3. Despliega. En Supabase configura Site URL con el dominio definitivo y agrega `https://TU-DOMINIO/mi-lab` a los redirects permitidos. Agrega dominios concretos de preview solo si los usarás para probar autenticación.
4. Si cambias variables `NEXT_PUBLIC_`, vuelve a desplegar para reconstruir el bundle.

## 3. Comprobar antes de invitar personas

- Con dos correos distintos: crear cuenta, confirmar correo, iniciar sesión y cerrar sesión. El registro no suscribe a campañas de correo.
- Cuenta A: crear una publicación, registrar seguidores, pulsar **Guardar mi plan**, recargar y comprobar los datos. Cuenta B debe empezar vacía y no recibir datos de A.
- Verificar en SQL Editor las políticas de `public.plans`; comprobar que peticiones anónimas no pueden leer filas y que el JWT de B no puede leer ni actualizar la fila de A.
- Abrir la misma cuenta en dos pestañas, guardar en una e intentar guardar en la otra: debe aparecer un error de conflicto; exportar un respaldo antes de recargar.
- Probar una conexión interrumpida: el fallo de guardado debe avisar y permitir exportar. La cuenta usa guardado explícito, no automático. Evitar edición simultánea desde varios dispositivos.
- Probar importación/exportación, fechas, estados y métricas reales. Los respaldos locales previos pueden importarse después de entrar a la cuenta; no se migran automáticamente.
- Revisar móvil, correo de confirmación y textos de privacidad con los datos reales del responsable antes del lanzamiento. Preparar contacto de soporte y procedimiento de recuperación/eliminación de cuentas. La recuperación de contraseña está en `/recuperar`; necesita un proveedor de correo operativo. La eliminación de cuentas se solicita al soporte y se gestiona desde Supabase. Consulta `ACCESO.md` para Google OAuth y pruebas de recuperación.

## Rutas y límites

- `/`: presentación pública de la herramienta.
- `/acceso` y `/mi-lab`: registro/acceso y plan personal. Sin las variables, muestran que la apertura está en preparación y no crean cuentas ficticias.
- `/estudio`: plan anterior, solo en desarrollo. Continúa usando la clave local original. En producción devuelve 404.
- `plans.data` conserva el formato de respaldos; `revision` evita sobrescribir silenciosamente una versión guardada desde otra pestaña. Los datos se validan en el cliente; RLS protege la propiedad de la fila y la base limita el tamaño del JSON. No se necesita una clave de administración en la aplicación.
- El calendario muestra 90 días a partir de la base de cada cuenta. La lista también muestra publicaciones fuera de ese intervalo. No hay conexión con Instagram ni publicación automática en redes.

Referencias: https://supabase.com/docs/reference/javascript/auth-signup y https://supabase.com/docs/guides/database/postgres/row-level-security

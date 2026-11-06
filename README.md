# Tidy Growth Lab

Herramienta gratuita con página pública, registro mediante Supabase y planes privados por usuario. La activación de Supabase y publicación en Vercel se describen en `SETUP.md`. El plan original sigue disponible en `/estudio` solo en desarrollo. Next.js App Router, TypeScript, Tailwind CSS v4, componentes shadcn/ui (Button y Dialog sobre Radix) y Lucide.

## Contenido listo para revisión

El primer lote está en `content/lote-01/`: carrusel de seis láminas, Reel gráfico de 29 segundos, portada, tres historias y textos para publicar. Lee `content/lote-01/LEEME-PARA-PUBLICAR.md`. Los archivos no cambian los estados ni métricas guardados en tu navegador.

## Ejecutar

Requiere Node.js 22 o posterior y npm.

```sh
npm ci
npm run dev
```

Abre http://127.0.0.1:3000. Para producción local: `npm run build` y `npm start`.

## Organización

- `src/app`: documento, metadatos, página y estilos responsive.
- `src/components/planner.tsx`: calendario, lista, filtros, seguidores y respaldos.
- `src/components/post-editor.tsx`: edición y métricas manuales.
- `src/components/ui`: componentes shadcn/ui editables.
- `src/lib/data.ts`: esquema versionado Zod, tipos, fechas e ideas iniciales.
- `src/lib/csv.ts`: importación/exportación CSV y compatibilidad con respaldos anteriores.
- `tests/data.test.ts` y `tests/csv.test.ts`: integridad del plan, intercambio con planillas y validaciones.

## Uso y datos del plan original de Tidy Studio

Calendario fijo de 90 días: 4 de noviembre de 2026 a 1 de febrero de 2027. Las 26 ideas son propuestas distribuidas en 13 semanas; empiezan en estado «idea». Una fecha propuesta no implica una publicación programada. Se pueden crear publicaciones y editar título, fecha, formato, descripción, estado y ocho métricas. La vista de lista incluye también publicaciones fuera de los 90 días.

532 seguidores al 4 de noviembre de 2026 es el único registro inicial. Los seguidores actuales requieren cantidad y fecha manuales. Las métricas comienzan vacías; vacío significa sin registrar y cero significa cero medido. La meta de 60.000 no incluye proyecciones ni garantías.

Los cambios se guardan en `localStorage`, clave `tidy-growth-lab:v1`, después de cargar los datos existentes. Son específicos del navegador, perfil y origen (incluido el puerto), sin sincronización entre dispositivos. «Descargar CSV» entrega una planilla UTF-8 con BOM, columnas en español y separador punto y coma. Incluye una fila Cuenta con seguidores y fechas, y una fila Publicación por idea. Se puede abrir en Excel o Google Sheets y guardar otra vez como CSV UTF-8. El importador acepta coma, punto y coma o tabulación, fechas AAAA-MM-DD o DD/MM/AAAA y valores vacíos (sin registrar) distintos de cero. Conserva los encabezados y deja ID vacío para nuevas publicaciones. La importación reemplaza el plan completo tras confirmar; si no hay fila Cuenta, conserva los seguidores del plan actual. Los archivos inválidos no modifican los datos. Se mantienen los respaldos JSON anteriores solo como importación y rescate del almacenamiento dañado. Máximo 10 MB y 5.000 publicaciones. XLSX/XLSM deben guardarse como CSV antes de importar; no se ejecutan macros.

Si el almacenamiento original no se puede leer, se bloquea la edición para no sobrescribirlo y se permite exportar el original o restaurar un respaldo válido. Si falla una escritura, se muestra un aviso: exporta antes de cerrar. Evita editar simultáneamente en varias pestañas.

El modo `/estudio` mantiene los datos locales descritos arriba. Las cuentas de `/mi-lab` usan Supabase Auth y la tabla `plans` con RLS y guardado explícito. Cada usuario comienza sin publicaciones ni métricas. El calendario parte de su fecha base y acepta respaldos existentes. No hay conexión con Instagram ni métricas simuladas. Sin configurar Supabase el registro queda desactivado. Consulta `SETUP.md` antes de publicar.

## Validación

```sh
npm test
npm run typecheck
npm run build
```

Prueba manual recomendada: editar una idea, cambiar estado y fecha, guardar métricas (incluido cero), recargar, registrar seguidores, exportar, modificar y restaurar el respaldo. Revisa también cancelar una importación, abrir la descarga en una planilla e importar un CSV inválido.

La compilación utiliza Webpack por un fallo local de Turbopack al procesar CSS en Windows.

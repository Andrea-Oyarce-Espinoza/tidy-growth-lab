import { z } from "zod";
export const START = "2026-11-04";
export const STORAGE_KEY = "tidy-growth-lab:v1";
export const statuses = [
  "idea",
  "en producción",
  "programado",
  "publicado",
] as const;
export const formats = ["Carrusel", "Reel", "Imagen"] as const;
export const metricKeys = [
  "alcance",
  "impresiones",
  "meGusta",
  "comentarios",
  "guardados",
  "compartidos",
  "consultas",
  "clientes",
] as const;
const count = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER)
  .nullable();
export function dateAt(offset: number, start = START) {
  const date = new Date(start + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + "T12:00:00Z");
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Fecha inválida");
export const postSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  format: z.enum(formats),
  date: dateSchema,
  description: z.string().max(10000),
  status: z.enum(statuses),
  metrics: z.object({
    alcance: count,
    impresiones: count,
    meGusta: count,
    comentarios: count,
    guardados: count,
    compartidos: count,
    consultas: count,
    clientes: count,
  }),
});
export const dataSchema = z
  .object({
    version: z.literal(1),
    baseline: z.object({ count, date: dateSchema }),
    currentFollowers: count,
    currentFollowersDate: dateSchema.nullable(),
    posts: z.array(postSchema).max(5000),
  })
  .refine(
    (v) => new Set(v.posts.map((p) => p.id)).size === v.posts.length,
    "Identificadores duplicados",
  )
  .refine(
    (v) => (v.currentFollowers === null) === (v.currentFollowersDate === null),
    "El registro de seguidores necesita fecha y cantidad",
  );
export type Post = z.infer<typeof postSchema>;
export type LabData = z.infer<typeof dataSchema>;
export const emptyMetrics = (): Post["metrics"] => ({
  alcance: null,
  impresiones: null,
  meGusta: null,
  comentarios: null,
  guardados: null,
  compartidos: null,
  consultas: null,
  clientes: null,
});
const ideas = [
  [
    "Tu Instagram atrae visitas. ¿Tu web las convierte?",
    "Carrusel",
    "Explica el camino desde el perfil hasta una consulta: enlace, propuesta clara y contacto simple. CTA: escríbeme WEB y conversemos sobre tu negocio.",
  ],
  [
    "3 señales de que tu negocio necesita una web",
    "Reel",
    "Presenta problemas de emprendedores: responder lo mismo, perder consultas y depender de redes. CTA: cuéntame cuál te pasa.",
  ],
  [
    "Qué debe tener la página de inicio de tu negocio",
    "Carrusel",
    "Checklist: propuesta de valor, servicios, prueba real y contacto. CTA: guarda esta guía y solicita una revisión.",
  ],
  [
    "De seguidores a consultas: elimina estos obstáculos",
    "Carrusel",
    "Muestra enlaces rotos, formularios largos y mensajes confusos con ejemplos ilustrativos. CTA: conversemos sobre tu recorrido de contacto.",
  ],
  [
    "Una landing page para tu próximo lanzamiento",
    "Reel",
    "Explica cómo una página enfocada presenta una oferta y facilita consultas. CTA: envíame LANZAMIENTO.",
  ],
  [
    "¿Web a medida o plantilla? Cómo elegir",
    "Carrusel",
    "Compara alcance, presupuesto y mantenimiento sin prometer resultados. CTA: cuéntame qué necesita tu proyecto.",
  ],
  [
    "Tu cliente entra desde el celular. ¿Qué encuentra?",
    "Reel",
    "Demuestra una navegación móvil con botones legibles y contacto visible. CTA: revisa tu sitio y comparte tus dudas.",
  ],
  [
    "5 preguntas antes de cotizar una página web",
    "Carrusel",
    "Pide objetivo, público, contenidos, funciones y plazos. CTA: solicita nuestro brief inicial.",
  ],
  [
    "Así organizamos una web de servicios",
    "Carrusel",
    "Muestra un esquema conceptual para un profesional independiente. CTA: diseñemos la estructura de tu sitio.",
  ],
  [
    "¿Por qué tu formulario no recibe consultas?",
    "Reel",
    "Revisa errores, exceso de campos y falta de contexto. CTA: escríbeme FORMULARIO para evaluar el tuyo.",
  ],
  [
    "Una web también trabaja cuando tú descansas",
    "Imagen",
    "Explica que servicios, preguntas frecuentes y contacto permanecen disponibles; evita promesas de ventas. CTA: conversemos sobre tu web.",
  ],
  [
    "Cuánto cuesta una web: qué define el presupuesto",
    "Carrusel",
    "Detalla páginas, diseño, integraciones y contenido sin inventar precios. CTA: pide una propuesta según tu alcance.",
  ],
  [
    "El botón de WhatsApp no lo resuelve todo",
    "Reel",
    "Explica por qué una propuesta clara y un mensaje contextual ayudan a iniciar conversaciones. CTA: revisemos tu contacto.",
  ],
  [
    "Tu portafolio debería responder estas 4 preguntas",
    "Carrusel",
    "Qué haces, para quién, cómo trabajas y cómo contactarte. CTA: envíame PORTAFOLIO.",
  ],
  [
    "Del brief al lanzamiento: así trabajamos",
    "Carrusel",
    "Describe descubrimiento, diseño, desarrollo y revisión como proceso propuesto. CTA: agenda una conversación inicial.",
  ],
  [
    "Una mejora pequeña para una web más clara",
    "Reel",
    "Reescribe un encabezado genérico con un ejemplo ficticio identificado. CTA: cuéntame qué ofrece tu negocio.",
  ],
  [
    "¿Tu web transmite confianza? Revisa esto",
    "Carrusel",
    "Usa información real, contacto accesible y testimonios solo con autorización. CTA: solicita una revisión.",
  ],
  [
    "Preguntas frecuentes que ahorran tiempo",
    "Carrusel",
    "Propón preguntas sobre servicio, proceso y alcance. CTA: armemos una sección útil para tus clientes.",
  ],
  [
    "Qué preparar antes de comenzar tu web",
    "Carrusel",
    "Checklist de textos, identidad, fotografías y objetivos. CTA: pide el checklist para tu proyecto.",
  ],
  [
    "Una página para cada servicio: ¿cuándo conviene?",
    "Reel",
    "Explica cuándo distintas ofertas necesitan mensajes específicos. CTA: cuéntame tus servicios.",
  ],
  [
    "Tu web después del lanzamiento",
    "Carrusel",
    "Explica mantenimiento, actualizaciones y revisión de consultas. CTA: conversemos sobre soporte.",
  ],
  [
    "Diseño bonito + una acción clara",
    "Imagen",
    "Presenta un ejemplo conceptual con una llamada a la acción simple. CTA: guarda esta idea para tu próxima web.",
  ],
  [
    "Errores comunes al mostrar tus servicios",
    "Carrusel",
    "Evita textos vagos y especifica a quién ayudas, entregables y siguiente paso. CTA: revisemos tu propuesta.",
  ],
  [
    "¿Necesitas una tienda o un catálogo?",
    "Carrusel",
    "Compara comprar online con consultar por productos, según la operación del negocio. CTA: conversemos sobre tu caso.",
  ],
  [
    "Cómo evaluar si tu web ayuda a tu negocio",
    "Reel",
    "Propón medir consultas y calidad de contactos, sin inventar conversiones. CTA: define tu objetivo con Tidy Studio.",
  ],
  [
    "¿Qué te gustaría resolver con tu nueva web?",
    "Imagen",
    "Invita a emprendedores y profesionales a contar su desafío. CTA: envíanos un mensaje con tu idea y evaluemos el próximo paso.",
  ],
] as const;
export function initialData(): LabData {
  return {
    version: 1,
    baseline: { count: 532, date: START },
    currentFollowers: null,
    currentFollowersDate: null,
    posts: ideas.map(([title, format, description], i) => ({
      id: `seed-${i + 1}`,
      title,
      format,
      description,
      date: dateAt(Math.floor(i / 2) * 7 + (i % 2) * 3),
      status: "idea",
      metrics: emptyMetrics(),
    })),
  };
}
export function parseBackup(raw: string): LabData {
  return dataSchema.parse(JSON.parse(raw));
}
export function emptyPlan(date: string): LabData {
  return dataSchema.parse({
    version: 1,
    baseline: { count: null, date },
    currentFollowers: null,
    currentFollowersDate: null,
    posts: [],
  });
}

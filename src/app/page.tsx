import {
  ArrowUpRight,
  CalendarDays,
  FlaskConical,
  Sparkles,
  ChartNoAxesCombined,
  Check,
} from "lucide-react";
export default function Page() {
  return (
    <div className="public-site">
      <header className="public-nav">
        <a href="/" className="brand">
          <span className="brand-icon">
            <FlaskConical size={22} />
          </span>
          <span>
            tidy<span className="brand-dot">.</span>
            <small>GROWTH LAB</small>
          </span>
        </a>
        <nav aria-label="Principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="/acceso">
            Mi cuenta <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main>
        <section className="public-hero">
          <div>
            <span className="public-pill">
              <Sparkles size={14} /> TU ESPACIO GRATUITO PARA CRECER
            </span>
            <h1>
              Deja de publicar
              <br />a ciegas<span>.</span>
            </h1>
            <p>
              Transforma tus ideas en un plan. Organiza tu contenido, registra
              tus resultados y descubre qué vale la pena seguir creando.
            </p>
            <a href="/acceso" className="public-button">
              Crear mi cuenta gratis <ArrowUpRight size={18} />
            </a>
            <small>Sin tarjeta. Con tus propios datos. A tu ritmo.</small>
          </div>
          <div
            className="lab-preview"
            aria-label="Ejemplo de un plan editorial, sin métricas reales"
          >
            <div className="preview-top">
              <span>MI GROWTH LAB</span>
              <span className="public-pill">EJEMPLO</span>
            </div>
            <h2>Una idea es un comienzo.</h2>
            <p>Un plan es tu próximo paso.</p>
            <div className="preview-days">
              LUN <span>MAR</span> MIÉ <span>JUE</span> VIE
            </div>
            <article>
              <span className="preview-icon">
                <CalendarDays size={19} />
              </span>
              <div>
                <strong>Eso que tu audiencia necesita saber</strong>
                <small>Carrusel · Idea</small>
              </div>
              <Check size={17} />
            </article>
            <article>
              <span className="preview-icon mint">
                <ChartNoAxesCombined size={19} />
              </span>
              <div>
                <strong>¿Qué aprendí de mi último post?</strong>
                <small>Registra, observa, vuelve a crear.</small>
              </div>
            </article>
            <div className="preview-note">
              <Sparkles size={17} /> Pequeños pasos. Más claridad.
            </div>
          </div>
        </section>
        <section id="como-funciona" className="public-features">
          <div className="eyebrow">MENOS IMPROVISACIÓN, MÁS INTENCIÓN</div>
          <h2>Tu contenido, con un poco más de dirección.</h2>
          <div className="feature-grid">
            {[
              [
                "01",
                "Haz espacio para tus ideas",
                "Crea publicaciones, elige fechas y organiza tu calendario. Empieza desde cero y hazlo tuyo.",
              ],
              [
                "02",
                "Observa tu progreso",
                "Registra seguidores, alcance, guardados y otras métricas manualmente. Tus resultados reales, en un solo lugar.",
              ],
              [
                "03",
                "Aprende para volver a crear",
                "Consulta tus publicaciones y sus resultados. Exporta tu plan cuando quieras y decide tu próximo paso.",
              ],
            ].map(([number, title, body]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="creator-story">
          <span className="brand-icon">
            <FlaskConical size={28} />
          </span>
          <div>
            <div className="eyebrow">UNA HERRAMIENTA QUE CRECE CONTIGO</div>
            <h2>
              La creé para organizar mi contenido.
              <br />
              Ahora también puede ser tu lab.
            </h2>
            <p>
              Tidy Growth Lab nace desde Tidy Studio. Un espacio para trabajar
              con más claridad, compartir aprendizajes y seguir mejorando con
              quienes lo usan.
            </p>
            <p>
              La herramienta es gratuita. Crear tu cuenta te da un espacio
              propio; seguir mi proceso es una invitación, nunca un requisito.
            </p>
          </div>
        </section>
        <section className="public-faq">
          <h2>Antes de empezar</h2>
          <details>
            <summary>¿Me ayuda a conseguir seguidores?</summary>
            <p>
              Te ayuda a planificar y registrar tu progreso. El crecimiento
              depende de tu contenido, tu audiencia y tu constancia: no hay
              promesas de seguidores ni resultados garantizados.
            </p>
          </details>
          <details>
            <summary>¿Tengo que conectar Instagram?</summary>
            <p>
              No. Ingresas tus datos manualmente y nunca te pediremos la
              contraseña de tus redes sociales.
            </p>
          </details>
          <details>
            <summary>¿Qué pasa con mis datos?</summary>
            <p>
              Tu cuenta utiliza tu correo para darte acceso. Tu plan se guarda
              en tu espacio personal y puedes exportarlo. Registrarte no te
              suscribe a mensajes promocionales.
            </p>
          </details>
        </section>
        <section className="public-last">
          <h2>
            Tu próxima buena idea
            <br />
            merece un lugar.
          </h2>
          <a href="/acceso" className="public-button">
            Comenzar gratis <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
      <footer className="public-footer">
        <strong>tidy. growth lab</strong>
        <span>Creado por Tidy Studio · Un paso a la vez.</span>
        <a href="/privacidad">Privacidad y tus datos</a>
      </footer>
    </div>
  );
}

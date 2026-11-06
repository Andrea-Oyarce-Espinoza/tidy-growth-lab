"use client";

import { useEffect, useRef, useState } from "react";

export function ChristmasTheme() {
  const root = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(preference.matches);
      setEnabled(!preference.matches);
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled || reduced || !root.current) return;
    const animations: Animation[] = [];
    root.current
      .querySelectorAll<HTMLElement>(".holiday-flake")
      .forEach((flake, i) => {
        animations.push(
          flake.animate(
            [
              {
                transform: "translate3d(0, -30px, 0) rotate(0deg)",
                opacity: 0,
              },
              { opacity: 0.5, offset: 0.15 },
              { opacity: 0.4, offset: 0.85 },
              {
                transform: `translate3d(${(i % 2 ? 1 : -1) * (22 + (i % 30))}px, calc(100dvh + 30px), 0) rotate(${i % 2 ? 160 : -160}deg)`,
                opacity: 0,
              },
            ],
            {
              duration: 15000 + (i % 7) * 2200,
              delay: -i * 1730,
              iterations: Infinity,
            },
          ),
        );
      });
    root.current
      .querySelectorAll<HTMLElement>(".holiday-bulb")
      .forEach((bulb, i) => {
        animations.push(
          bulb.animate([{ opacity: 0.6 }, { opacity: 1 }, { opacity: 0.6 }], {
            duration: 3200 + (i % 4) * 500,
            delay: -i * 380,
            iterations: Infinity,
          }),
        );
      });
    const visibility = () =>
      animations.forEach((animation) =>
        document.hidden ? animation.pause() : animation.play(),
      );
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      animations.forEach((animation) => animation.cancel());
    };
  }, [enabled, reduced]);

  return (
    <div ref={root} className="holiday-theme">
      <div className="holiday-banner">
        <div className="holiday-lights" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => (
            <i
              key={i}
              className="holiday-bulb"
              style={{ left: `${(i + 0.5) * 5}%` }}
            />
          ))}
        </div>
        <div className="holiday-banner-message">
          <span className="holiday-little-star" aria-hidden="true" />
          <span>
            <strong>NAVIDAD EN TIDY</strong>
            <span className="holiday-wish">
              {" "}
              · Ideas que brillan, a tu ritmo.
            </span>
          </span>
        </div>
        <button
          type="button"
          className="holiday-motion"
          aria-pressed={enabled}
          disabled={reduced}
          onClick={() => setEnabled((value) => !value)}
          title={
            reduced
              ? "Se respeta tu preferencia de movimiento reducido"
              : undefined
          }
        >
          {reduced
            ? "Sin animaciones"
            : enabled
              ? "Pausar animaciones"
              : "Activar animaciones"}
        </button>
      </div>
      <div className="holiday-snow" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <i
            key={i}
            className={`holiday-flake ${i % 4 === 0 ? "holiday-flake-star" : ""}`}
            style={{
              left: `${(i * 41 + 7) % 100}%`,
              width: `${(i % 3) + 3}px`,
              height: `${(i % 3) + 3}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

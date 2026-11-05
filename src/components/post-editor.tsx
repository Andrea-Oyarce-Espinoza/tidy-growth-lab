"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  formats,
  statuses,
  metricKeys,
  postSchema,
  type Post,
} from "@/lib/data";
export function PostEditor({
  post,
  onSave,
  onClose,
}: {
  post: Post;
  onSave: (p: Post) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(post);
  const [error, setError] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Dale forma a tu próxima idea"
      description="Planifica el contenido y registra sus resultados cuando estén disponibles."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const result = postSchema.safeParse(draft);
          if (!result.success) {
            setError(
              "Revisa el título, la fecha y las métricas. Usa números enteros positivos o cero.",
            );
            return;
          }
          onSave(result.data);
        }}
        className="space-y-5"
      >
        <label className="field">
          Título
          <input
            required
            maxLength={200}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="field">
            Formato
            <select
              value={draft.format}
              onChange={(e) =>
                setDraft({ ...draft, format: e.target.value as Post["format"] })
              }
            >
              {formats.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Fecha propuesta
            <input
              type="date"
              required
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </label>
          <label className="field">
            Estado
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({ ...draft, status: e.target.value as Post["status"] })
              }
            >
              {statuses.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          Descripción y llamada a la acción
          <textarea
            rows={5}
            maxLength={10000}
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
        </label>
        <fieldset>
          <legend className="font-semibold">
            Resultados de la publicación
          </legend>
          <p className="my-2 text-xs text-slate-500">
            Registro manual. Deja vacío lo que aún no has medido.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metricKeys.map((key) => (
              <label className="field" key={key}>
                {key === "meGusta" ? "Me gusta" : key}
                <input
                  type="number"
                  min={0}
                  step={1}
                  max={Number.MAX_SAFE_INTEGER}
                  placeholder="Sin registrar"
                  value={draft.metrics[key] ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      metrics: {
                        ...draft.metrics,
                        [key]:
                          e.target.value === "" ? null : Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar publicación</Button>
        </div>
      </form>
    </Dialog>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { ChristmasTheme } from "@/components/christmas-theme";
export const metadata: Metadata = {
  title: "Tidy Growth Lab · Tu espacio gratuito para crecer",
  description:
    "Organiza tu contenido, registra tus métricas y trabaja en el crecimiento de tus redes. Crea tu cuenta gratis y comienza con tus propios datos.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="christmas-season">
        <ChristmasTheme />
        {children}
      </body>
    </html>
  );
}

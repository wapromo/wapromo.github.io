import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WAPROMO | Publiczny katalog grup WhatsApp",
  description: "Odkrywaj i dodawaj publiczne grupy WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

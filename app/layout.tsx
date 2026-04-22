import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StateProvider } from "@/lib/state";

export const metadata: Metadata = {
  title: "gebrekan",
  description: "untuk sophia",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh">
        <StateProvider>
          <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
            {children}
          </main>
        </StateProvider>
      </body>
    </html>
  );
}

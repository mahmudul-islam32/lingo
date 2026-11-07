import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GuestProfileBootstrap } from "@/features/profile";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polyglow",
  description: "Learn a language in bite-sized lessons.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <GuestProfileBootstrap />
        {children}
      </body>
    </html>
  );
}

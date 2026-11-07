import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BRAND_HEX } from "@/components/ui";
import { GuestProfileBootstrap } from "@/features/profile";
import { APP_DESCRIPTION, APP_NAME, TITLE_TEMPLATE } from "./_shell/app-name";
import { SkipLink } from "./_shell/SkipLink";
import { DEFAULT_THEME } from "./_shell/theme";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: BRAND_HEX.canvasDark,
};

/**
 * Root layout: `<html lang="en">`, the skip link (first focusable element), app
 * providers and the guest-profile bootstrap (PLT-003), whose storage notice renders
 * directly above `<main>`. It has no `<main>` or `<h1>` itself: each route renders
 * exactly one of each (the `(tabs)` layout owns `<main>` for Learn and Profile).
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} className="h-full antialiased">
      <body className="flex min-h-full flex-col overflow-x-hidden bg-canvas text-fg">
        <SkipLink />
        <Providers>
          <GuestProfileBootstrap />
          {children}
        </Providers>
      </body>
    </html>
  );
}

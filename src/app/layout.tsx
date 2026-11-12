import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BRAND_HEX } from "@/components/ui";
import { GuestProfileBootstrap } from "@/features/profile";
import { ICONS } from "./_pwa/pwa-config";
import { InstallPromptCapture } from "./_shell/InstallCard";
import { ServiceWorkerRegistration } from "./_shell/ServiceWorkerRegistration";
import { UpdateToast } from "./_shell/UpdateToast";
import { APP_DESCRIPTION, APP_NAME, TITLE_TEMPLATE } from "./_shell/app-name";
import { SkipLink } from "./_shell/SkipLink";
import { DEFAULT_THEME } from "./_shell/theme";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  // PLT-002: the manifest is linked automatically from `app/manifest.ts`. Setting `icons`
  // replaces Next's file-based icon links, so the favicon (`app/icon.svg`) is listed too.
  icons: {
    icon: [{ url: ICONS.favicon, type: "image/svg+xml" }],
    apple: [{ url: ICONS.apple180, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
  // Next.js emits only `mobile-web-app-capable` for `appleWebApp.capable`; older iOS
  // versions still need the Apple-prefixed tag.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: BRAND_HEX.canvasDark,
};

/**
 * Root layout: `<html lang="en">`, the skip link (first focusable element), app
 * providers, the install-prompt capture and update toast (PLT-005), the service worker
 * registration (PLT-002, production only) and the
 * guest-profile bootstrap (PLT-003), whose storage notice renders
 * directly above `<main>`. It has no `<main>` or `<h1>` itself: each route renders
 * exactly one of each (the `(tabs)` layout owns `<main>` for Learn and Profile).
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} className="h-full antialiased">
      <body className="flex min-h-full flex-col overflow-x-hidden bg-canvas pt-[env(safe-area-inset-top)] text-fg">
        <SkipLink />
        <Providers>
          <InstallPromptCapture />
          <UpdateToast />
          <ServiceWorkerRegistration />
          <GuestProfileBootstrap />
          {children}
        </Providers>
      </body>
    </html>
  );
}

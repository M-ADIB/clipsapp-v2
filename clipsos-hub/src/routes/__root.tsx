import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { DevTools } from "@/components/dev/DevTools";
import { UploadQueue } from "@/components/upload/UploadQueue";

import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ClipsOS" },
      {
        name: "description",
        content: "ClipsOS — premium content operations for video agencies.",
      },
      { property: "og:title", content: "ClipsOS" },
      {
        property: "og:description",
        content: "ClipsOS — premium content operations for video agencies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "ClipsOS" },
      {
        name: "description",
        content: "ClipsOS Hub is a white-label operating system for short-form content agencies.",
      },
      {
        property: "og:description",
        content: "ClipsOS Hub is a white-label operating system for short-form content agencies.",
      },
      {
        name: "twitter:description",
        content: "ClipsOS Hub is a white-label operating system for short-form content agencies.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/85c28dc8-eb3e-4de7-b49e-57562b27fbd4/id-preview-f1dc7a95--3a199310-9155-4e1b-a86b-82e559352205.lovable.app-1777241143627.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/85c28dc8-eb3e-4de7-b49e-57562b27fbd4/id-preview-f1dc7a95--3a199310-9155-4e1b-a86b-82e559352205.lovable.app-1777241143627.png",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandingProvider>
          <TooltipProvider delayDuration={150}>
            <Outlet />
            <DevToolsOverlay />
            <UploadQueue />
            <Toaster richColors closeButton position="top-right" />
          </TooltipProvider>
        </BrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function DevToolsOverlay() {
  const { role, realRole, isDevMode, setRoleOverride } = useAuth();
  return (
    <DevTools
      realRole={realRole}
      activeRole={role}
      onRoleSwitch={setRoleOverride}
      enabled={isDevMode}
    />
  );
}

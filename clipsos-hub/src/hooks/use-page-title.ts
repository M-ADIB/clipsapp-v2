import { useEffect } from "react";

const APP_NAME = "ClipsOS";

/**
 * usePageTitle — sets the browser <title> tag dynamically.
 *
 * Usage:
 *   usePageTitle("Dashboard");          → "Dashboard | ClipsOS"
 *   usePageTitle("Ali Nached — Videos") → "Ali Nached — Videos | ClipsOS"
 *   usePageTitle();                     → "ClipsOS"
 *
 * Resets to APP_NAME on unmount.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}

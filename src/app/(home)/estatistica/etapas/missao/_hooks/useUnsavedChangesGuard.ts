"use client";

import { useEffect } from "react";

interface Options {
   enabled: boolean;
   message?: string;
}

export function useUnsavedChangesGuard({
   enabled,
   message = "Há mudanças não salvas. Sair mesmo assim?",
}: Options) {
   useEffect(() => {
      if (!enabled) return;

      const onBeforeUnload = (e: BeforeUnloadEvent) => {
         e.preventDefault();
         e.returnValue = "";
         return "";
      };

      const onLinkClick = (event: MouseEvent) => {
         const anchor = (event.target as HTMLElement | null)?.closest(
            "a"
         ) as HTMLAnchorElement | null;
         if (!anchor) return;
         if (!anchor.href) return;
         if (anchor.target === "_blank") return;
         if (anchor.dataset.noGuard === "true") return;
         if (event.defaultPrevented) return;
         if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
            return;

         let url: URL;
         try {
            url = new URL(anchor.href, window.location.origin);
         } catch {
            return;
         }
         if (url.origin !== window.location.origin) return;
         if (
            url.pathname === window.location.pathname &&
            url.search === window.location.search
         )
            return;

         if (!window.confirm(message)) {
            event.preventDefault();
            event.stopPropagation();
         }
      };

      window.addEventListener("beforeunload", onBeforeUnload);
      document.addEventListener("click", onLinkClick, true);
      return () => {
         window.removeEventListener("beforeunload", onBeforeUnload);
         document.removeEventListener("click", onLinkClick, true);
      };
   }, [enabled, message]);
}

import type { Metadata } from "next";
import { cookies } from "next/headers";

import Providers from "@/app/context/providers";
import { normalizeOrgTheme, ORG_THEME_COOKIE } from "@/lib/orgTheme";
import "./global.css";

export const metadata: Metadata = {
   title: "FATCONTROL",
   icons: {
      icon: "/assets/favicon.ico",
   },
};

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   // Tema da org ativa gravado no cookie (ver AuthProvider/OrgSwitcher).
   // Estampar no SSR evita flash de cor no reload/troca de org.
   const tema = normalizeOrgTheme(
      (await cookies()).get(ORG_THEME_COOKIE)?.value
   );

   return (
      <html lang="pt-br" data-org-theme={tema}>
         <body className="bg-gray-100">
            <Providers>{children}</Providers>
         </body>
      </html>
   );
}

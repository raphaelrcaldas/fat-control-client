import type { Metadata } from "next";
import { cookies } from "next/headers";

import Providers from "@/app/context/providers";
import { ORG_BRAND_COOKIE, parseOrgBrand } from "@/lib/orgBrand";
import {
   NEUTRAL_ORG_THEME,
   normalizeOrgTheme,
   ORG_THEME_COOKIE,
} from "@/lib/orgTheme";
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
   // Tema e identidade da org ativa gravados em cookie (ver AuthProvider/
   // OrgSwitcher). Estampar no SSR evita flash de cor e de texto no reload/
   // troca de org — a tela de carregamento aparece antes do /users/me.
   // Sem cookie (sessão nova) a org ainda é desconhecida: cai no tema neutro e
   // no nome genérico, nunca na marca de uma org específica.
   const cookieStore = await cookies();
   const tema = normalizeOrgTheme(
      cookieStore.get(ORG_THEME_COOKIE)?.value,
      NEUTRAL_ORG_THEME
   );
   const brand = parseOrgBrand(cookieStore.get(ORG_BRAND_COOKIE)?.value);

   return (
      <html lang="pt-br" data-org-theme={tema}>
         <body className="bg-gray-100">
            <Providers orgBrand={brand}>{children}</Providers>
         </body>
      </html>
   );
}

import type { Metadata } from "next";

import Providers from "@/app/context/providers";
import "./global.css";

export const metadata: Metadata = {
   title: "FATCONTROL",
   icons: {
      icon: "/assets/favicon.ico",
   },
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="pt-br">
         <body className="bg-gray-100">
            <Providers>{children}</Providers>
         </body>
      </html>
   );
}

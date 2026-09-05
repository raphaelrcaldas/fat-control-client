"use client";

import Link from "next/link";
import { Badge } from "flowbite-react";
import { HiChevronRight } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { useUnidadeOptions } from "@/hooks/queries";
import clsx from "clsx";

interface UserCardProps {
   user: UserPublic;
}

/** Par rótulo/valor do rodapé do card. */
function Meta({ label, value }: { label: string; value: string }) {
   return (
      <div className="min-w-0">
         <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
            {label}
         </p>
         <p className="truncate text-xs font-semibold text-slate-700 uppercase">
            {value}
         </p>
      </div>
   );
}

/**
 * Linha da listagem ate `lg`. Sem checkbox de selecao: exportar planilha e
 * fluxo de desktop (ver `ExportCartBar`).
 *
 * O card INTEIRO e o link, e nao um botao de icone no canto: no dedo, mirar um
 * alvo de 44px vale menos que ter a linha toda como alvo, e some um controle
 * da tela. `Link` e nao `router.push` — assim o card ganha semantica de link
 * de graca (foco por teclado, abrir em nova aba, menu de contexto).
 *
 * Os quatro Badge coloridos do rodape viraram texto: numa lista de 50 cards
 * eles somavam 200 retangulos coloridos disputando a atencao com o unico dado
 * que se procura de relance, que e o nome. Cor aqui ficou reservada para o que
 * e excecao — o militar inativo.
 */
export function UserCard({ user }: UserCardProps) {
   const unidadeOptions = useUnidadeOptions();
   const unidade =
      unidadeOptions.find((u) => u.value === user.unidade)?.label ??
      user.unidade;

   return (
      <Link
         href={`/users/${user.id}`}
         className="group block rounded border border-slate-200 bg-white p-3 shadow-sm transition-colors duration-150 hover:border-slate-300 active:bg-slate-50"
      >
         <div className="flex items-center gap-3">
            {/* Inativo tira a cor da marca do avatar: e o sinal que se le
                antes de qualquer texto ao percorrer a lista. */}
            <span
               className={clsx(
                  "grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold uppercase ring-1 ring-inset",
                  user.active
                     ? "bg-primary-50 text-primary-800 ring-primary-100"
                     : "bg-slate-100 text-slate-500 ring-slate-200"
               )}
            >
               {user.p_g}
            </span>

            <div className="min-w-0 flex-1">
               {/* p, nao heading: nome de linha de listagem nao entra na
                   arvore de titulos (h1 -> h3 saltava nivel no axe) */}
               <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-slate-900 uppercase">
                     {user.nome_guerra}
                  </p>
                  {!user.active && (
                     <Badge color="gray" className="shrink-0 text-[10px]">
                        Inativo
                     </Badge>
                  )}
               </div>
               <p className="truncate text-xs text-slate-500 uppercase">
                  {user.nome_completo}
               </p>
            </div>

            <HiChevronRight className="size-5 shrink-0 text-slate-300 transition-colors duration-150 group-hover:text-slate-500" />
         </div>

         <div className="mt-2.5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-2">
            <Meta label="Quadro" value={user.quadro} />
            <Meta label="Esp" value={user.esp} />
            <Meta label="Unidade" value={unidade} />
         </div>
      </Link>
   );
}

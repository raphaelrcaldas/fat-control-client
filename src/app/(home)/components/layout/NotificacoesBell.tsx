"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Popover } from "flowbite-react";
import { HiOutlineBell, HiOutlineTrash } from "react-icons/hi";
import { formatRelativeTime } from "utils/dateHandler";
import { useAuth } from "@/app/context/auth";
import { useToast } from "@/app/context/toast";
import { trocarOrg } from "@/lib/trocarOrg";
import {
   notificacaoKeys,
   useApagarNotificacao,
   useContadorNotificacoes,
   useMarcarNotificacaoLida,
   useMarcarTodasNotificacoesLidas,
   useNotificacoes,
} from "@/hooks/queries";
import type { Notificacao } from "services/routes/notificacoes";
import { exigeContextoSistema, notificacaoHref } from "./notificacaoHref";

/**
 * Sino de notificações da navbar — contrapartida do client ao do FatBird
 * (`fatbird/src/app/(home)/components/NotificacoesBell.tsx`): mesmo
 * comportamento (contador, lista só com o popover aberto, clique marca
 * lida e navega, marcar todas, apagar, item sem link quando o tipo é
 * desconhecido), biblioteca de UI diferente — `Popover` do Flowbite
 * (`open`/`onOpenChange` controlados), nunca shadcn/Radix.
 *
 * Chegam os DOIS escopos de notificação, sempre de audiência `gestor`:
 * `"direta"` (o comum) e `"tarefa"` — dormente na v1 (nada ainda emite),
 * mas quem já tem a org ativa e a permissão certa pode recebê-la do
 * backend mesmo assim. `marcar_lida`/`apagar` só aceitam `"direta"`; ver o
 * tratamento por escopo em `NotificacaoItem`.
 *
 * Aviso que leva a `/admin/*` (feedback da administração) chega em
 * qualquer contexto, mas a tela só responde no Sistema: fora dele, o
 * clique troca para o Sistema e abre o destino já lá (`trocarOrg`), em
 * vez de levar a um 403.
 */
export function NotificacoesBell() {
   const [open, setOpen] = useState(false);
   const [trocando, setTrocando] = useState(false);
   const { push } = useToast();
   const { activeOrg, orgs } = useAuth();
   const orgSistema = orgs.find((o) => o.organizacao_id === null) ?? null;
   const queryClient = useQueryClient();
   const pathname = usePathname();
   const { data: contador, isError: contadorError } = useContadorNotificacoes();
   // Só busca a lista com o popover aberto; o cache mantém os itens na
   // reabertura enquanto o refetch corre por trás.
   const {
      data: pagina,
      isLoading,
      isError,
   } = useNotificacoes({ per_page: 20 }, open);

   // O sino vive no layout persistente (home)/layout.tsx — navegar não o
   // remonta — e o client desliga `refetchOnWindowFocus` globalmente. Sem
   // isso, o contador (staleTime de 60 s) ficaria visivelmente atrasado
   // numa sessão longa, contradizendo a lista que acabou de buscar de
   // verdade. Dois gatilhos, sem virar polling: invalida ao abrir...
   useEffect(() => {
      if (open) {
         queryClient.invalidateQueries({
            queryKey: notificacaoKeys.contador(),
         });
      }
   }, [open, queryClient]);

   // ...e refaz por troca de rota, mas só quando a query já passou do
   // `staleTime` (`stale: true` filtra pelo `isStale()` do próprio
   // TanStack Query) — trocar de tela não deve gerar tráfego a cada clique.
   useEffect(() => {
      queryClient.refetchQueries({
         queryKey: notificacaoKeys.contador(),
         stale: true,
      });
   }, [pathname, queryClient]);

   // Falha de mutação precisa ser dita: sem isso o item some/permanece sem
   // explicação e a pessoa clica de novo achando que não registrou.
   const aoFalhar = (message: string) => () => push({ type: "error", message });

   const marcarLida = useMarcarNotificacaoLida({
      onError: aoFalhar("Não foi possível marcar a notificação como lida"),
   });
   const marcarTodas = useMarcarTodasNotificacoesLidas({
      onError: aoFalhar("Não foi possível marcar todas como lidas"),
   });
   const apagar = useApagarNotificacao({
      onError: aoFalhar("Não foi possível apagar a notificação"),
   });

   const naoLidas = contador?.nao_lidas ?? 0;
   const notificacoes = pagina?.data ?? [];
   // O contador pode estar velho (ver os dois `useEffect` acima); a lista
   // que acabou de vir do popover aberto é a fonte mais fresca que existe
   // no momento, então o botão some/aparece por QUALQUER uma das duas
   // fontes dizer que há algo pendente, nunca só pelo contador.
   const temDiretaNaoLidaNaLista = notificacoes.some(
      (n) => n.escopo === "direta" && !n.read_at
   );
   const mostrarMarcarTodas = naoLidas > 0 || temDiretaNaoLidaNaLista;

   const ariaLabel = contadorError
      ? "Notificações (contagem indisponível)"
      : naoLidas > 0
        ? `Notificações, ${naoLidas} não lida${naoLidas > 1 ? "s" : ""}`
        : "Notificações";

   function handleItemClick(n: Notificacao, temLink: boolean) {
      // Só `escopo: "direta"` tem ciclo de leitura — `marcar_lida` responde
      // 404 para uma "tarefa" (o dela é `resolved_at`, via `/resolver`).
      if (n.escopo === "direta" && !n.read_at) marcarLida.mutate(n.id);
      if (temLink) setOpen(false);
   }

   // Sem `marcarLida` aqui: a página recarrega no meio da requisição. A
   // conversa aberta no destino marca o aviso como lido
   // (`useMarcarConversaLida`).
   async function abrirNoSistema(href: string) {
      if (!orgSistema) return;
      setTrocando(true);
      const erro = await trocarOrg(orgSistema, href);
      if (erro) {
         push({ type: "error", message: erro });
         setTrocando(false);
      }
   }

   // Destino que só existe no contexto Sistema, visto de outro contexto.
   // Sem vínculo de sistema (não deveria receber o aviso), fica sem link.
   const trocaDeContexto = (href: string | null) =>
      href !== null && activeOrg !== null && exigeContextoSistema(href)
         ? orgSistema
            ? "trocar"
            : "sem-acesso"
         : null;

   return (
      <Popover
         open={open}
         onOpenChange={setOpen}
         trigger="click"
         placement="bottom-end"
         arrow={false}
         aria-label="Notificações"
         // Sobrescreve o `rounded-lg`/`border-gray-200` default do tema
         // Flowbite: o padrão visual do projeto exige `rounded` (nunca
         // `rounded-lg`) e a borda `slate-200`.
         theme={{ base: "rounded border-slate-200 shadow-sm" }}
         content={
            <div className="w-80">
               <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-900">
                     Notificações
                  </span>
                  {mostrarMarcarTodas && (
                     <button
                        type="button"
                        disabled={marcarTodas.isPending}
                        onClick={() => marcarTodas.mutate()}
                        className="text-primary-600 hover:text-primary-700 min-h-[24px] shrink-0 text-xs font-semibold disabled:opacity-50"
                     >
                        Marcar todas como lidas
                     </button>
                  )}
               </div>

               <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                     <NotificacoesSkeleton />
                  ) : isError ? (
                     // Erro NUNCA vira lista vazia (regra do projeto):
                     // anunciar a falha em vez de fingir que não há
                     // notificação.
                     <div role="alert" className="px-4 py-6 text-center">
                        <p className="text-sm font-medium text-red-600">
                           Não foi possível carregar as notificações
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                           A consulta falhou — tente novamente mais tarde.
                        </p>
                     </div>
                  ) : notificacoes.length === 0 ? (
                     <p className="px-4 py-6 text-center text-sm text-slate-500">
                        Nenhuma notificação
                     </p>
                  ) : (
                     <ul className="divide-y divide-slate-200">
                        {notificacoes.map((n) => (
                           <NotificacaoItem
                              key={n.id}
                              notificacao={n}
                              trocaDeContexto={trocaDeContexto}
                              onAbrirNoSistema={abrirNoSistema}
                              trocando={trocando}
                              onItemClick={handleItemClick}
                              onApagar={(id) => apagar.mutate(id)}
                              apagando={
                                 apagar.isPending && apagar.variables === n.id
                              }
                           />
                        ))}
                     </ul>
                  )}
               </div>
            </div>
         }
      >
         <button
            type="button"
            aria-label={ariaLabel}
            title="Notificações"
            className="hover:bg-primary-100 focus-visible:ring-primary-600 relative flex items-center justify-center rounded p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
         >
            <HiOutlineBell className="text-primary-600 h-6 w-6" aria-hidden />
            {(naoLidas > 0 || contadorError) && (
               <span
                  aria-hidden
                  className={clsx(
                     // `ring-2 ring-white` separa o selo do ícone atrás
                     // dele — sem o anel, o "9" do contador se funde com o
                     // traço do sino em telas de alta densidade.
                     "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white tabular-nums ring-2 ring-white",
                     // Contador falhou: cinza neutro — "?" é incerteza, não
                     // é o mesmo sinal de "há N novidades".
                     contadorError ? "bg-slate-400" : "bg-primary-600"
                  )}
               >
                  {contadorError ? "?" : naoLidas > 9 ? "9+" : naoLidas}
               </span>
            )}
         </button>
      </Popover>
   );
}

function NotificacaoItem({
   notificacao: n,
   trocaDeContexto,
   onAbrirNoSistema,
   trocando,
   onItemClick,
   onApagar,
   apagando,
}: {
   notificacao: Notificacao;
   trocaDeContexto: (href: string | null) => "trocar" | "sem-acesso" | null;
   onAbrirNoSistema: (href: string) => void;
   trocando: boolean;
   onItemClick: (n: Notificacao, temLink: boolean) => void;
   onApagar: (id: number) => void;
   apagando: boolean;
}) {
   const destino = notificacaoHref(n);
   const troca = trocaDeContexto(destino);
   const href = troca === "sem-acesso" ? null : destino;
   // Cada escopo tem o ciclo dele: "direta" fecha por `read_at`, "tarefa"
   // por `resolved_at` (a dela é sempre `null` numa "direta", e vice-versa
   // — ver o `CheckConstraint` do model). Usar `read_at` para as duas
   // deixaria toda tarefa marcada como lida (ela nunca ganha `read_at`).
   const naoLida = n.escopo === "direta" ? !n.read_at : !n.resolved_at;
   const relativo = formatRelativeTime(n.created_at);

   const conteudo = (
      <>
         {/* Indicador de não lida; o span vazio preserva o alinhamento. */}
         <span
            aria-hidden
            className={clsx(
               "mt-1 size-2 shrink-0 rounded-full",
               naoLida ? "bg-primary-600" : "bg-transparent"
            )}
         />
         <span className="min-w-0 flex-1">
            {naoLida && <span className="sr-only">Não lida.</span>}
            <span
               title={n.titulo}
               className={clsx(
                  "block truncate text-sm",
                  naoLida
                     ? "font-semibold text-slate-900"
                     : "font-medium text-slate-500"
               )}
            >
               {n.titulo}
            </span>
            {n.descricao && (
               <span
                  title={n.descricao}
                  className="line-clamp-2 block text-xs text-slate-500"
               >
                  {n.descricao}
               </span>
            )}
            <span className="mt-0.5 block text-[11px] text-slate-400">
               <span className="uppercase">{n.uae}</span>
               {relativo ? ` · ${relativo}` : ""}
               {troca === "trocar" && " · abre no contexto Sistema"}
            </span>
         </span>
      </>
   );

   const itemClasses =
      "flex min-w-0 flex-1 items-start gap-2 py-2.5 pl-3 text-left";

   // O botão de apagar é IRMÃO do link, nunca filho: botão dentro de <a> é
   // HTML inválido e o clique de um viraria navegação do outro. Só existe
   // para "direta": `DELETE /notificacoes/{id}` responde 404 para uma
   // "tarefa" (ela não se apaga — é compartilhada; o desfecho é o
   // `/resolver`, que o client ainda não expõe no sino).
   return (
      <li className="flex items-center transition-colors hover:bg-slate-50">
         {href && troca === "trocar" ? (
            <button
               type="button"
               className={itemClasses}
               disabled={trocando}
               aria-busy={trocando}
               onClick={() => onAbrirNoSistema(href)}
            >
               {conteudo}
            </button>
         ) : href ? (
            <Link
               href={href}
               className={itemClasses}
               onClick={() => onItemClick(n, true)}
            >
               {conteudo}
            </Link>
         ) : (
            // Tipo sem rota mapeada: o clique só marca como lida.
            <button
               type="button"
               className={itemClasses}
               onClick={() => onItemClick(n, false)}
            >
               {conteudo}
            </button>
         )}
         {n.escopo === "direta" && (
            <button
               type="button"
               aria-label={`Apagar notificação: ${n.titulo}`}
               title="Apagar"
               disabled={apagando}
               onClick={() => onApagar(n.id)}
               className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
            >
               <HiOutlineTrash className="size-4" aria-hidden />
            </button>
         )}
      </li>
   );
}

/** Espelha o layout real do item (dot + título + meta + botão de apagar). */
function NotificacoesSkeleton() {
   return (
      <ul className="divide-y divide-slate-200" aria-hidden>
         {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-2 py-2.5 pr-1 pl-3">
               <span className="size-2 shrink-0 animate-pulse rounded-full bg-slate-200" />
               <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
               </div>
               <div className="size-7 shrink-0 animate-pulse rounded bg-slate-200" />
            </li>
         ))}
      </ul>
   );
}

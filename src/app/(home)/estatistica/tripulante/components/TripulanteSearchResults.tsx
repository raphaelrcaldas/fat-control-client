import type { ReactNode } from "react";
import { Button } from "flowbite-react";
import clsx from "clsx";
import {
   HiCheckCircle,
   HiChevronRight,
   HiOutlineExclamationCircle,
   HiOutlineSearch,
   HiOutlineUser,
   HiOutlineUserGroup,
} from "react-icons/hi";
import type { IconType } from "react-icons";
import type { TripSearchItem } from "services/routes/trips";

export function TripulanteSearchResults({
   items,
   total,
   hasQuery,
   loading,
   error,
   selectedTripId,
   onSelect,
   onRetry,
}: {
   items: TripSearchItem[];
   total: number;
   hasQuery: boolean;
   loading: boolean;
   error: boolean;
   selectedTripId?: number | null;
   onSelect: (trip: TripSearchItem) => void;
   onRetry: () => void;
}) {
   return (
      <div className="flex h-80 flex-col overflow-hidden rounded border border-slate-200 bg-white sm:h-96">
         <div
            className="flex h-9 shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-600"
            role="status"
         >
            <HiOutlineUserGroup aria-hidden className="size-4 shrink-0" />
            <span>
               {!hasQuery || error
                  ? "Tripulantes"
                  : loading
                    ? "Buscando tripulantes…"
                    : `${total} tripulante${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`}
            </span>
         </div>
         <div
            className="min-h-0 flex-1 overflow-y-auto"
            aria-busy={hasQuery && loading}
         >
            {!hasQuery ? (
               <SearchMessage
                  icon={HiOutlineSearch}
                  title="Digite o nome ou trigrama"
                  description="Digite ao menos dois caracteres do nome ou trigrama."
               />
            ) : error ? (
               <SearchMessage
                  icon={HiOutlineExclamationCircle}
                  title="Não foi possível buscar os tripulantes."
                  description="Tente novamente para carregar os resultados."
               >
                  <Button
                     color="light"
                     size="xs"
                     disabled={loading}
                     onClick={onRetry}
                  >
                     Tentar novamente
                  </Button>
               </SearchMessage>
            ) : loading && items.length === 0 ? (
               <SearchSkeleton />
            ) : items.length === 0 ? (
               <SearchMessage
                  icon={HiOutlineSearch}
                  title="Nenhum tripulante encontrado."
                  description="Confira o nome ou tente buscar pelo trigrama."
               />
            ) : (
               <div
                  className={clsx(
                     "transition-opacity",
                     loading && "opacity-50"
                  )}
               >
                  {[true, false].map((active) => {
                     // O backend ordena por situação e antiguidade antes da
                     // paginação; agrupar não deve reordenar essa resposta.
                     const group = items.filter(
                        (trip) => (trip.active && trip.user.active) === active
                     );
                     if (!group.length) return null;
                     return (
                        <section key={String(active)}>
                           <h3 className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                              {active ? "Ativos" : "Inativos"}
                           </h3>
                           <ul className="divide-y divide-slate-100">
                              {group.map((trip) => {
                                 const selected = trip.id === selectedTripId;
                                 const identity = [
                                    trip.user.posto.short,
                                    trip.user.quadro,
                                    trip.user.esp,
                                    trip.user.nome_guerra,
                                 ]
                                    .filter(Boolean)
                                    .join(" ");
                                 const Icon = selected
                                    ? HiCheckCircle
                                    : HiOutlineUser;
                                 return (
                                    <li key={trip.id}>
                                       <Button
                                          color="light"
                                          theme={{
                                             base: "rounded-none",
                                             disabled:
                                                "cursor-wait opacity-100",
                                          }}
                                          disabled={loading}
                                          aria-busy={loading}
                                          aria-current={
                                             selected ? "true" : undefined
                                          }
                                          onClick={() => onSelect(trip)}
                                          className={clsx(
                                             "group hover:bg-primary-50 focus-visible:bg-primary-50 flex h-auto w-full justify-start gap-3 border-0 px-4 py-3 text-left shadow-none focus-visible:ring-inset",
                                             selected
                                                ? "bg-primary-50"
                                                : "bg-white"
                                          )}
                                       >
                                          <Icon
                                             aria-hidden
                                             className={clsx(
                                                "size-4 shrink-0",
                                                selected
                                                   ? "text-primary-700"
                                                   : "text-slate-400"
                                             )}
                                          />
                                          <span className="min-w-0 flex-1 space-y-1">
                                             <span
                                                className="group-hover:text-primary-900 block truncate text-sm font-semibold text-slate-800 uppercase"
                                                title={identity}
                                             >
                                                {identity}
                                             </span>
                                             {trip.user.nome_completo && (
                                                <span
                                                   className="block truncate text-xs font-normal text-slate-600 uppercase"
                                                   title={
                                                      trip.user.nome_completo
                                                   }
                                                >
                                                   {trip.user.nome_completo}
                                                </span>
                                             )}
                                          </span>
                                          <span className="shrink-0 text-xs font-semibold text-slate-600 uppercase">
                                             {trip.trig}
                                          </span>
                                          {selected && (
                                             <span className="sr-only">
                                                Selecionado
                                             </span>
                                          )}
                                          <HiChevronRight
                                             aria-hidden
                                             className="size-4 shrink-0 text-slate-400"
                                          />
                                       </Button>
                                    </li>
                                 );
                              })}
                           </ul>
                        </section>
                     );
                  })}
               </div>
            )}
         </div>
      </div>
   );
}

function SearchMessage({
   icon: Icon,
   title,
   description,
   children,
}: {
   icon: IconType;
   title: string;
   description: string;
   children?: ReactNode;
}) {
   return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
         <Icon aria-hidden className="size-8 text-slate-400" />
         <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">{title}</p>
            <p className="text-xs text-slate-600">{description}</p>
         </div>
         {children}
      </div>
   );
}

function SearchSkeleton() {
   return (
      <div aria-hidden>
         <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
         </div>
         <div className="divide-y divide-slate-100">
            {[0, 1, 2, 3, 4].map((i) => (
               <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="size-4 shrink-0 animate-pulse rounded bg-slate-200" />
                  <div className="min-w-0 flex-1 space-y-1">
                     <div className="h-5 w-36 max-w-full animate-pulse rounded bg-slate-200" />
                     <div className="h-4 w-44 max-w-full animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-4 w-8 shrink-0 animate-pulse rounded bg-slate-200" />
                  <div className="size-4 shrink-0 animate-pulse rounded bg-slate-200" />
               </div>
            ))}
         </div>
      </div>
   );
}

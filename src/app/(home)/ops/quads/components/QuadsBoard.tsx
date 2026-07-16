"use client";
import clsx from "clsx";
import Link from "next/link";
import { Button } from "flowbite-react";
import { FaSliders } from "react-icons/fa6";
import { HiOutlineClipboardList } from "react-icons/hi";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { CrewQuadRes } from "services/routes/quads";
import { DragScrollProps } from "../hooks/useDragScroll";
import { CrewRow } from "./CrewRow";
import { QuadsBoardSkeleton } from "./QuadsBoardSkeleton";

interface QuadsBoardProps {
   quads: CrewQuadRes[];
   groupName: string;
   typeName: string;
   isLoading: boolean;
   isFetching: boolean;
   isError: boolean;
   onRetry: () => void;
   loadingTypes: boolean;
   dragProps: DragScrollProps;
}

export function QuadsBoard({
   quads,
   groupName,
   typeName,
   isLoading,
   isFetching,
   isError,
   onRetry,
   loadingTypes,
   dragProps,
}: QuadsBoardProps) {
   return (
      <div
         className={clsx(
            "overflow-hidden rounded border border-slate-200 bg-white shadow transition-opacity duration-200",
            isFetching && !isLoading && "opacity-50"
         )}
      >
         {/* Subheader — identifica o grupo/tipo do quadro */}
         <div className="relative flex items-center border-b border-slate-200 bg-slate-50 py-2.5 pr-4 pl-5">
            {/* Espinha de marca — ecoa a espinha dos cards e do masthead */}
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            {loadingTypes ? (
               <div className="flex items-center gap-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
               </div>
            ) : !groupName ? (
               <span aria-hidden className="text-sm font-bold text-slate-500">
                  —
               </span>
            ) : (
               <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-sm font-bold tracking-wide text-slate-900 uppercase">
                     {groupName}
                  </span>
                  {typeName && (
                     <span className="truncate text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        {typeName}
                     </span>
                  )}
               </div>
            )}
         </div>

         {/* Área rolável / arrastável dos quadrinhos (setas rolam com o foco no container) */}
         <div
            id="quad_table"
            role="region"
            aria-label="Grade de quadrinhos"
            tabIndex={0}
            className="relative flex max-h-[80%] cursor-grab flex-col gap-1 overflow-x-auto overflow-y-auto py-3 whitespace-nowrap select-none"
            {...dragProps}
         >
            {isLoading || loadingTypes ? (
               <QuadsBoardSkeleton />
            ) : isError ? (
               <ErrorBoard onRetry={onRetry} />
            ) : quads.length === 0 ? (
               <EmptyBoard hasTypes={Boolean(groupName)} />
            ) : (
               quads.map((item) => (
                  <CrewRow
                     key={item.trip.id}
                     tripQuadRes={item}
                     groupName={groupName}
                     typeName={typeName}
                  />
               ))
            )}
         </div>
      </div>
   );
}

function ErrorBoard({ onRetry }: { onRetry: () => void }) {
   return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 whitespace-normal">
         <p className="text-sm font-semibold text-slate-700">
            Erro ao carregar os quadrinhos
         </p>
         <p className="text-center text-sm text-slate-500">
            Não foi possível buscar os dados. Verifique a conexão.
         </p>
         <Button color="light" size="sm" className="mt-1" onClick={onRetry}>
            Tentar novamente
         </Button>
      </div>
   );
}

function EmptyBoard({ hasTypes }: { hasTypes: boolean }) {
   return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 whitespace-normal">
         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <HiOutlineClipboardList className="h-8 w-8 text-slate-400" />
         </div>
         <p className="text-sm font-semibold text-slate-700">
            {hasTypes
               ? "Nenhum quadrinho encontrado"
               : "Nenhum quadrinho configurado"}
         </p>
         <p className="text-center text-sm text-slate-500">
            {hasTypes
               ? "Não há registros para a função e o quadrinho selecionados."
               : "Esta organização ainda não tem tipos de quadrinho para esta função."}
         </p>
         {!hasTypes && (
            <PermBased resource="quad_ops" requiredPerm="create">
               <Button
                  as={Link}
                  href="/ops/quads/gerenciar"
                  color="light"
                  size="sm"
                  className="mt-1 font-semibold"
               >
                  <FaSliders className="mr-2 h-4 w-4" />
                  Gerenciar quadrinhos
               </Button>
            </PermBased>
         )}
      </div>
   );
}

"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "flowbite-react";
import { FaSliders } from "react-icons/fa6";
import { HiOutlineClipboardList } from "react-icons/hi";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useQuadsContext } from "../../context/quads";
import { PermBased } from "../../hooks/usePermBased";
import { useQuads, useQuadsTypes } from "@/hooks/queries";
import { useDragScroll } from "./hooks/useDragScroll";
import { useEnsureValidQuadType } from "./hooks/useEnsureValidQuadType";
import { resolveQuadNames } from "./utils/resolveQuadNames";
import { sortQuads, QuadOrdem } from "./utils/sortQuads";
import { QuadsToolbar } from "./components/QuadsToolbar";
import { QuadsBoard } from "./components/QuadsBoard";
import { QuadsOrfaosAlert } from "./components/QuadsOrfaosAlert";

export default function QuadPage() {
   const [ordem, setOrdem] = usePersistedState<QuadOrdem>("quads.ordem", "opr");

   const { quadFunc, setQuadFunc, quadType, setQuadType, visual, setVisual } =
      useQuadsContext();

   const { data: quadsType = [], isLoading: loadingTypes } = useQuadsTypes();

   // Sem `proj`: o quadro cobre todos os projetos operados pela org ativa.
   const params = useMemo(
      () => ({
         funcao: quadFunc,
         tipo_quad: quadType,
      }),
      [quadFunc, quadType]
   );

   const {
      data: quadsData,
      isLoading: loadingQuads,
      isFetching,
   } = useQuads(params);

   const quads = quadsData ?? [];

   useEnsureValidQuadType(quadsType, quadFunc, quadType, setQuadType);

   const { groupName, typeName } = useMemo(
      () => resolveQuadNames(quadsType, quadType),
      [quadsType, quadType]
   );

   const orderedQuads = useMemo(() => sortQuads(quads, ordem), [quads, ordem]);

   const dragProps = useDragScroll();

   return (
      <div className="space-y-2">
         {/* Masthead — referência canônica (ops/operacoes) */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Espinha vermelha — ecoa a espinha dos cards */}
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <HiOutlineClipboardList className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Gestão Operacional
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Quadrinhos
                     </h1>
                  </div>
               </div>

               <PermBased resource="quad_ops" requiredPerm="create">
                  <Button
                     as={Link}
                     href="/ops/quads/gerenciar"
                     color="light"
                     className="font-semibold whitespace-nowrap"
                  >
                     <FaSliders className="mr-2 h-4 w-4" />
                     Gerenciar
                  </Button>
               </PermBased>
            </div>
         </header>

         <QuadsToolbar
            quadsType={quadsType}
            quadFunc={quadFunc}
            onQuadFuncChange={setQuadFunc}
            quadType={quadType}
            onQuadTypeChange={setQuadType}
            ordem={ordem}
            onOrdemChange={setOrdem}
            visual={visual}
            onVisualChange={setVisual}
            loadingTypes={loadingTypes}
         />

         <PermBased resource="quad_ops" requiredPerm="create">
            <QuadsOrfaosAlert />
         </PermBased>

         <QuadsBoard
            quads={orderedQuads}
            groupName={groupName}
            typeName={typeName}
            isLoading={loadingQuads}
            isFetching={isFetching}
            dragProps={dragProps}
         />
      </div>
   );
}

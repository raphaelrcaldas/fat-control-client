"use client";
import { useMemo } from "react";
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

const DEFAULT_PROJ = "kc-390";

export default function QuadPage() {
   const [ordem, setOrdem] = usePersistedState<QuadOrdem>("quads.ordem", "opr");

   const { quadFunc, setQuadFunc, quadType, setQuadType, visual, setVisual } =
      useQuadsContext();

   const { data: quadsType = [], isLoading: loadingTypes } = useQuadsTypes();

   const params = useMemo(
      () => ({
         funcao: quadFunc,
         tipo_quad: quadType,
         proj: DEFAULT_PROJ,
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
      <div>
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

         <div className="mb-1 flex items-center gap-2 px-2 uppercase">
            {loadingTypes ? (
               <>
                  <div className="h-7 w-44 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-60 animate-pulse rounded bg-slate-200" />
               </>
            ) : (
               <>
                  <p className="text-2xl font-bold">{groupName}</p>
                  <p className="text-base font-semibold">{typeName}</p>
               </>
            )}
         </div>

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

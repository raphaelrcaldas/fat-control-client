"use client";
import { useEffect, useMemo, useRef } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Select, Radio, Label, Spinner } from "flowbite-react";
import { useQuadsContext } from "../../context/quads";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import { useQuads, useQuadsTypes } from "@/hooks/queries";
import { FUNCOES_PRINCIPAIS, getFuncLabel } from "@/constants";
import CrewRow from "./components/crewRow";

// Constantes para valores configuráveis
const DEFAULT_PROJ = "kc-390";

export default function QuadPage() {
   const [ordem, setOrdem] = usePersistedState("quads.ordem", "opr");

   const { quadFunc, setQuadFunc, quadType, setQuadType, visual, setVisual } =
      useQuadsContext();

   // React Query hooks
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

   // Drag scroll
   const scrollRef = useRef<HTMLDivElement>(null);
   const isDragging = useRef(false);
   const startX = useRef(0);
   const scrollLeft = useRef(0);

   const handleMouseDown = (e: React.MouseEvent) => {
      if (!scrollRef.current) return;
      isDragging.current = true;
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
      scrollRef.current.style.cursor = "grabbing";
   };

   const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
   };

   const handleMouseUp = () => {
      isDragging.current = false;
      if (scrollRef.current) scrollRef.current.style.cursor = "grab";
   };

   const handleTouchStart = (e: React.TouchEvent) => {
      if (!scrollRef.current) return;
      isDragging.current = true;
      startX.current = e.touches[0].pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
   };

   const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
   };

   const { groupName, typeName } = useMemo(() => {
      for (const group of quadsType) {
         for (const type of group.types) {
            if (type.id === quadType) {
               return { groupName: group.long, typeName: type.long };
            }
         }
      }
      return { groupName: "", typeName: "" };
   }, [quadsType, quadType]);

   useEffect(() => {
      if (quadsType.length === 0) return;

      const isValidType = quadsType.some((group) =>
         group.types.some(
            (type) => type.id === quadType && type.funcs_list.includes(quadFunc)
         )
      );

      if (!isValidType) {
         for (const group of quadsType) {
            const validType = group.types.find((t) =>
               t.funcs_list.includes(quadFunc)
            );
            if (validType) {
               setQuadType(validType.id);
               break;
            }
         }
      }
   }, [quadsType, quadFunc, quadType, setQuadType]);

   const quadsList = useMemo(() => {
      const quadsOrdenados = [...quads].sort((a, b) => {
         const tripA = a.trip;
         const tripB = b.trip;

         if (ordem === "opr") {
            const tripOprA = new Date(tripA.func.data_op);
            const tripOprB = new Date(tripB.func.data_op);

            return tripOprA.getTime() - tripOprB.getTime();
         } else {
            return compareByAntiguidade(tripA.user, tripB.user);
         }
      });

      return quadsOrdenados.map((item) => (
         <CrewRow
            key={item.trip.id}
            tripQuadRes={item}
            groupName={groupName}
            typeName={typeName}
         />
      ));
   }, [quads, ordem, groupName, typeName]);

   if (loadingTypes) {
      return (
         <div className="flex items-center justify-center gap-2 p-6 font-semibold">
            Carregando <Spinner size="lg" color="failure" />
         </div>
      );
   }

   return (
      <div>
         <div className="mb-2 flex gap-4 rounded-lg border border-slate-300 bg-white px-2 py-3 shadow">
            <div className="grid text-center">
               <Label>Função</Label>
               <Select
                  value={quadFunc}
                  className="w-32"
                  onChange={(e) => setQuadFunc(e.target.value)}
               >
                  {FUNCOES_PRINCIPAIS.map((f) => {
                     return (
                        <option key={f} value={f}>
                           {getFuncLabel(f, true)}
                        </option>
                     );
                  })}
               </Select>
            </div>
            <div className="grid text-center">
               <Label>Quadrinho</Label>
               <Select
                  value={quadType}
                  onChange={(e) => setQuadType(parseInt(e.target.value))}
                  className="w-40"
                  disabled={loadingTypes}
               >
                  {quadsType
                     .filter((group) =>
                        group.types.some((type) =>
                           type.funcs_list.includes(quadFunc)
                        )
                     )
                     .map((group, index) => {
                        const nameGroup = group.long.toUpperCase();
                        return (
                           <optgroup key={index} label={nameGroup}>
                              {group.types
                                 .filter((type) =>
                                    type.funcs_list.includes(quadFunc)
                                 )
                                 .map((type) => (
                                    <option key={type.id} value={type.id}>
                                       {type.long.toUpperCase()}
                                    </option>
                                 ))}
                           </optgroup>
                        );
                     })}
               </Select>
            </div>
            <div className="grid">
               <h3 className="self-start text-center text-sm capitalize">
                  Antiguidade
               </h3>
               <div className="flex items-center gap-2">
                  <Radio
                     id="opr"
                     name="ordenar"
                     color="red"
                     value="opr"
                     checked={ordem === "opr"}
                     onChange={() => setOrdem("opr")}
                  />
                  <Label htmlFor="opr">Operacional</Label>
               </div>
               <div className="flex items-center gap-2">
                  <Radio
                     id="mil"
                     name="ordenar"
                     color="red"
                     value="mil"
                     checked={ordem === "mil"}
                     onChange={() => setOrdem("mil")}
                  />
                  <Label htmlFor="mil">Militar</Label>
               </div>
            </div>
            <div className="hidden md:grid">
               <h3 className="self-start text-center text-sm capitalize">
                  Visualização
               </h3>
               <div className="flex items-center gap-2">
                  <Radio
                     id="comp"
                     name="visual"
                     color="red"
                     value="comp"
                     checked={visual === "comp"}
                     onChange={() => setVisual("comp")}
                  />
                  <Label htmlFor="comp">Completa</Label>
               </div>
               <div className="flex items-center gap-2">
                  <Radio
                     id="reduz"
                     name="visual"
                     color="red"
                     value="reduz"
                     checked={visual === "reduz"}
                     onChange={() => setVisual("reduz")}
                  />
                  <Label htmlFor="reduz">Reduzida</Label>
               </div>
            </div>
         </div>

         <div className="mb-1 flex items-center gap-2 px-2 uppercase">
            <p className="text-2xl font-bold">{groupName}</p>
            <p className="text-base font-semibold">{typeName}</p>
         </div>

         <div
            ref={scrollRef}
            id="quad_table"
            className="relative flex max-h-[80%] cursor-grab flex-col gap-1 overflow-x-auto overflow-y-auto rounded-lg border border-slate-300 bg-white py-3 whitespace-nowrap shadow select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
         >
            {isFetching && !loadingQuads && (
               <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
                  <Spinner size="xl" color="failure" />
               </div>
            )}
            {loadingQuads ? (
               <div className="flex flex-col items-center justify-center gap-2 p-2 font-semibold">
                  Carregando <Spinner size="lg" color="failure" />
               </div>
            ) : quads.length === 0 ? (
               <div className="flex flex-col items-center justify-center gap-2 p-2 font-semibold">
                  Nenhum quad encontrado
               </div>
            ) : (
               quadsList
            )}
         </div>
      </div>
   );
}

"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Select, Radio, Label, Spinner } from "flowbite-react";
import { getQuads, getQuadsType } from "services/routes/quads";
import { useQuadsContext } from "../../context/quads";
import { CrewQuadRes } from "services/routes/quads";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import CrewRow from "./components/crewRow";

// Constantes para valores configuráveis
const DEFAULT_UAE = "11gt";
const DEFAULT_PROJ = "kc-390";

export default function QuadPage() {
   const [quadsType, setQuadsType] = useState([]);
   const [quads, setQuads] = useState<CrewQuadRes[]>([]);
   const [ordem, setOrdem] = useState("opr");
   const [loadingQuads, setLoadingQuads] = useState(true);

   const [groupName, setGroupName] = useState("");
   const [typeName, setTypeName] = useState("");

   const { quadFunc, setQuadFunc, quadType, setQuadType, visual, setVisual } =
      useQuadsContext();

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

   const getQuadsName = useCallback(() => {
      if (quadsType.length === 0) return;

      for (const group of quadsType) {
         for (const type of group.types) {
            if (type.id === quadType) {
               setGroupName(group.long);
               setTypeName(type.long);
               return;
            }
         }
      }
      // Se não encontrou, limpa os nomes
      setGroupName("");
      setTypeName("");
   }, [quadsType, quadType]);

   async function getQuadsParams() {
      if (!quadFunc || !quadType) return;

      setLoadingQuads(true);

      const params = {
         funcao: quadFunc,
         tipo_quad: quadType,
         uae: DEFAULT_UAE,
         proj: DEFAULT_PROJ,
      };

      try {
         const data = await getQuads(params);
         setQuads(data);
         getQuadsName();
      } catch (err: any) {
         console.error("Erro ao buscar quadrinhos:", err);
      } finally {
         setLoadingQuads(false);
      }
   }

   useEffect(() => {
      if (quadsType.length === 0) return;

      // Procura se o type atual é válido para a função escolhida
      const isValidType = quadsType.some((group) =>
         group.types.some(
            (type) => type.id === quadType && type.funcs_list.includes(quadFunc)
         )
      );

      if (!isValidType) {
         // pega o primeiro type válido da lista
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
      setQuads([]);
      getQuadsParams();
   }, [quadsType, quadFunc, quadType]);

   useEffect(() => {
      getQuadsType(DEFAULT_UAE).then((data) => setQuadsType(data));
   }, []);

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
            update={getQuadsParams}
         />
      ));
   }, [quads, quadType, ordem, visual]);

   return (
      <div className="p-2">
         <div className="mb-3 flex gap-4 rounded-lg bg-white p-2 py-3 shadow-md">
            <div className="grid text-center">
               <Label className="self-start">Função</Label>
               <Select
                  value={quadFunc}
                  onChange={(e) => setQuadFunc(e.target.value)}
               >
                  <option value="pil">Piloto</option>
                  <option value="mc">Mecânico</option>
                  <option value="lm">LoadMaster</option>
                  <option value="tf">Comissário</option>
                  <option value="os">Observador-SAR</option>
                  <option value="oe">OE</option>
               </Select>
            </div>
            <div className="grid text-center">
               <Label className="self-start">Quadrinho</Label>
               <Select
                  value={quadType}
                  onChange={(e) => setQuadType(parseInt(e.target.value))}
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
                              {group.types.map((type) => {
                                 const typeLabel = type.long.toUpperCase();
                                 const funcsList = type.funcs_list;
                                 if (!funcsList.includes(quadFunc)) return;

                                 return (
                                    <option key={type.id} value={type.id}>
                                       {typeLabel}
                                    </option>
                                 );
                              })}
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

         <div className="mb-1 ml-5 flex items-center gap-2 px-2 uppercase">
            <p className="text-2xl font-bold">{groupName}</p>
            <p className="text-base font-semibold">{typeName}</p>
         </div>

         <div
            ref={scrollRef}
            id="quad_table"
            className="relative flex max-h-[80%] cursor-grab flex-col gap-1 overflow-x-auto overflow-y-auto rounded-lg bg-white py-3 whitespace-nowrap shadow-md select-none md:max-h-[80%]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
         >
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

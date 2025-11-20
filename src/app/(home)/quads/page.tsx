"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Select, Radio, Label } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { getQuads, getQuadsType } from "services/routes/quads";
import { useQuadsContext } from "../context/quads";
import { CrewQuadRes } from "services/routes/quads";
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
            const antA = tripA.user.posto.ant;
            const antB = tripB.user.posto.ant;
            if (antA !== antB) return antA - antB;

            const promoA = tripA.user.ult_promo || "";
            const promoB = tripB.user.ult_promo || "";
            if (promoA !== promoB) return promoA.localeCompare(promoB);

            return (tripA.user.ant_rel ?? 0) - (tripB.user.ant_rel ?? 0);
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
      <div className='p-2'>
         <div className='p-2 py-3 flex gap-4 mb-3 bg-white rounded-lg shadow-md'>
            <div className='grid text-center'>
               <Label className='self-start'>Função</Label>
               <Select
                  value={quadFunc}
                  onChange={(e) => setQuadFunc(e.target.value)}
               >
                  <option value='mc'>Mecânico</option>
                  <option value='lm'>LoadMaster</option>
                  <option value='tf'>Comissário</option>
                  <option value='os'>Observador-SAR</option>
                  <option value='oe'>OE</option>
               </Select>
            </div>
            <div className='grid text-center'>
               <Label className='self-start'>Quadrinho</Label>
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
            <div className='grid'>
               <h3 className='self-start text-center text-sm capitalize'>
                  Antiguidade
               </h3>
               <div className='flex items-center gap-2'>
                  <Radio
                     id='opr'
                     name='ordenar'
                     color='blue'
                     value='opr'
                     checked={ordem === "opr"}
                     onChange={() => setOrdem("opr")}
                  />
                  <Label htmlFor='opr'>Operacional</Label>
               </div>
               <div className='flex items-center gap-2'>
                  <Radio
                     id='mil'
                     name='ordenar'
                     color='blue'
                     value='mil'
                     checked={ordem === "mil"}
                     onChange={() => setOrdem("mil")}
                  />
                  <Label htmlFor='mil'>Militar</Label>
               </div>
            </div>
            <div className='hidden md:grid'>
               <h3 className='self-start text-center text-sm capitalize'>
                  Visualização
               </h3>
               <div className='flex items-center gap-2'>
                  <Radio
                     id='comp'
                     name='visual'
                     color='blue'
                     value='comp'
                     checked={visual === "comp"}
                     onChange={() => setVisual("comp")}
                  />
                  <Label htmlFor='comp'>Completa</Label>
               </div>
               <div className='flex items-center gap-2'>
                  <Radio
                     id='reduz'
                     name='visual'
                     color='blue'
                     value='reduz'
                     checked={visual === "reduz"}
                     onChange={() => setVisual("reduz")}
                  />
                  <Label htmlFor='reduz'>Reduzida</Label>
               </div>
            </div>
         </div>

         <div className='flex gap-2 items-center ml-5 mb-1 uppercase px-2'>
            <p className='text-2xl font-bold'>{groupName}</p>
            <p className='text-base font-semibold'>{typeName}</p>
         </div>

         <div
            id='quad_table'
            className='flex flex-col gap-1 py-3 relative bg-white rounded-lg whitespace-nowrap shadow-md max-h-[80%] md:max-h-[80%] overflow-x-auto overflow-y-auto'
         >
            {loadingQuads ? (
               <div className='flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                  Carregando <Spinner size='lg' />
               </div>
            ) : quads.length === 0 ? (
               <div className='flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                  Nenhum quad encontrado
               </div>
            ) : (
               quadsList
            )}
         </div>
      </div>
   );
}

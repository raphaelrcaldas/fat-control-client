"use client";
import { useEffect, useState, useMemo } from "react";
import { Select, Spinner, Radio, Label } from "flowbite-react";
import { QuadPopover } from "./components/quadPopover";
import { QuadsTrip } from "./components/quadsTrip";
import { getQuads, getQuadsType } from "@/services/routes/quads";
import AddQuadModal from "./components/addQuad";
import { useSelect } from "../../../context/select";
import { PermBased } from "../hooks/usePermBased";

export default function QuadPage() {
   const [quadsType, setQuadsType] = useState([]);
   const [quads, setQuads] = useState([]);
   const [ordem, setOrdem] = useState("opr");

   const [groupName, setGroupName] = useState("");
   const [typeName, setTypeName] = useState("");

   const { quadsPage } = useSelect();

   function getQuadsName() {
      for (const group of quadsType) {
         for (const type of group.types) {
            if (type.id === quadsPage.type.state) {
               setGroupName(group.long);
               setTypeName(type.long);
               break;
            }
         }
      }
   }

   function getQuadsParams() {
      const params = {
         funcao: quadsPage.func.state,
         tipo_quad: quadsPage.type.state,
         uae: "11gt",
         proj: "kc-390",
      };

      getQuads(params)
         .then((res) => res.json())
         .then((data) => {
            setQuads(data);
            getQuadsName();
         });
   }

   useEffect(() => {
      if (quadsType.length === 0) return;

      // Procura se o type atual é válido para a função escolhida
      const isValidType = quadsType.some((group) =>
         group.types.some(
            (type) =>
               type.id === quadsPage.type.state &&
               type.funcs_list.includes(quadsPage.func.state)
         )
      );

      if (!isValidType) {
         // pega o primeiro type válido da lista
         for (const group of quadsType) {
            const validType = group.types.find((t) =>
               t.funcs_list.includes(quadsPage.func.state)
            );
            if (validType) {
               quadsPage.type.setState(validType.id);
               break;
            }
         }
      }
      setQuads([]);
      getQuadsParams();
   }, [quadsType, quadsPage.func.state, quadsPage.type.state]);

   useEffect(() => {
      getQuadsType("11gt")
         .then((res) => res.json())
         .then((data) => setQuadsType(data));
   }, []);

   const quadsList = useMemo(() => {
      const quadsOrdenados = [...quads].sort((a, b) => {
         const tripA = a.trip;
         const tripB = b.trip;

         if (ordem === "opr") {
            const tripOprA = new Date(tripA.func.data_op);
            const tripOprB = new Date(tripB.func.data_op);

            return tripOprA - tripOprB;
         } else {
            const antA = tripA.user.posto.ant;
            const antB = tripB.user.posto.ant;

            if (antA !== antB) return antA - antB;

            const promoA = tripA.user.ult_promo || "";
            const promoB = tripB.user.ult_promo || "";

            return promoA.localeCompare(promoB);
         }
      });

      return quadsOrdenados.map((item) => (
         <div
            key={item.trip.id}
            className='flex justify-start items-center gap-1 overflow-visible'
         >
            <div className='flex-shrink-0 sticky left-0 z-10 bg-white overflow-visible'>
               <QuadsTrip
                  trip={item.trip}
                  lenTotalQuads={item.quads_len}
                  typeQuad={quadsPage.type.state}
                  quadsAllUpdate={getQuadsParams}
               />
            </div>
            {item.quads.map((quad) => {
               return <QuadPopover key={quad.id} quad={quad} />;
            })}
            <PermBased resource={"quad_ops"} requiredPerm={"create"}>
               <AddQuadModal
                  trip={item.trip}
                  callFunc={getQuadsParams}
                  type={quadsPage.type.state}
               />
            </PermBased>
         </div>
      ));
   }, [quads, quadsPage.type.state, ordem]);

   return (
      <>
         <div className='flex mb-5'>
            <div className='flex gap-2'>
               <Select
                  value={quadsPage.func.state}
                  onChange={(e) => quadsPage.func.setState(e.target.value)}
               >
                  <option value='mc'>Mecânico</option>
                  <option value='lm'>LoadMaster</option>
                  <option value='tf'>Comissário</option>
                  <option value='os'>Observador-SAR</option>
                  <option value='oe'>OE</option>
               </Select>

               <Select
                  value={quadsPage.type.state}
                  onChange={(e) =>
                     quadsPage.type.setState(parseInt(e.target.value))
                  }
               >
                  {quadsType
                     .filter((group) =>
                        group.types.some((type) =>
                           type.funcs_list.includes(quadsPage.func.state)
                        )
                     )
                     .map((group, index) => {
                        const nameGroup = group.long.toUpperCase();
                        return (
                           <optgroup key={index} label={nameGroup}>
                              {group.types.map((type) => {
                                 const typeLabel = type.long.toUpperCase();
                                 const funcsList = type.funcs_list;
                                 if (!funcsList.includes(quadsPage.func.state))
                                    return;

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
         </div>

         <div className='grid grid-cols-2 my-2 uppercase gap-4 w-full'>
            <div className=''>
               <p className='text-2xl font-bold'>{groupName}</p>
               <p className='text-base font-semibold'>{typeName}</p>
            </div>

            <div className='flex flex-row gap-2'>
               <div className='flex w-52 flex-col gap-1 p-2 bg-white rounded-lg shadow-md'>
                  <h3 className='text-center text-sm capitalize'>
                     Antiguidade
                  </h3>
                  <div className='flex items-center gap-2'>
                     <Radio
                        id='opr'
                        name='ordenar'
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
                        value='mil'
                        checked={ordem === "mil"}
                        onChange={() => setOrdem("mil")}
                     />
                     <Label htmlFor='mil'>Militar</Label>
                  </div>
               </div>
            </div>
         </div>

         <div
            id='quad_table'
            className='flex flex-col gap-1 px-2 py-3 relative bg-white rounded-lg whitespace-nowrap shadow-md max-h-[80%] md:max-h-[80%] overflow-x-auto overflow-y-auto'
         >
            {quads.length === 0 ? (
               <div className='flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                  Carregando <Spinner size='lg' />
               </div>
            ) : (
               quadsList
            )}
         </div>
      </>
   );
}

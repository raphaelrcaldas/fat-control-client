"use client";
import { useEffect, useState } from "react";

import { Select, Spinner } from "flowbite-react";
import { QuadPopover } from "./components/quadPopover";
import { QuadsTrip } from "./components/quadsTrip";
import { getQuads, getQuadsType } from "@/services/routes/quads";
import AddQuadModal from "./components/addQuad";
import { useSelect } from "../../../context/select";
import { PermBased } from "../hooks/usePermBased";

export default function QuadPage() {
   const [filterQuad, setFilterQuad] = useState(1);
   const [quadsType, setQuadsType] = useState([]);
   const [quads, setQuads] = useState([]);

   const [groupName, setGroupName] = useState("");
   const [typeName, setTypeName] = useState("");

   const { quadsPage } = useSelect();

   function getQuadsName() {
      for (const group of quadsType) {
         for (const type of group.types) {
            if (type.id === filterQuad) {
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
      setQuads([]);
      getQuadsParams();
   }, [quadsPage.func.state, quadsPage.type.state]);

   useEffect(() => {
      if (quadsType.length == 0) {
         getQuadsType("11gt")
            .then((res) => res.json())
            .then((data) => setQuadsType(data));
      }
      getQuadsParams();
   }, [quadsType]);

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
                  {quadsType.map((group, index) => {
                     const nameGroup = group.long.toUpperCase();
                     return (
                        <optgroup key={index} label={nameGroup}>
                           {group.types.map((type, index) => {
                              const typeLabel = type.long.toUpperCase();
                              return (
                                 <option key={index} value={type.id}>
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

         <div className='m-2 uppercase'>
            <p className='text-2xl font-bold'>{groupName}</p>
            <p className='text-base font-semibold'>{typeName}</p>
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
               quads.map((item) => {
                  return (
                     <div
                        key={item.trip.id}
                        className='flex justify-start items-center gap-1 overflow-visible'
                     >
                        <div className='flex-shrink-0 sticky left-0 z-10 bg-white overflow-visible'>
                           <QuadsTrip
                              trip={item.trip}
                              lenTotalQuads={item.quads_len}
                              typeQuad={filterQuad}
                              quadsAllUpdate={getQuadsParams}
                           />
                        </div>
                        {item.quads.map((quad) => {
                           return <QuadPopover key={quad.id} quad={quad} />;
                        })}
                        <PermBased
                           resource={"quad_ops"}
                           requiredPerm={"create"}
                        >
                           <AddQuadModal
                              trip={item.trip}
                              callFunc={getQuadsParams}
                              type={filterQuad}
                           />
                        </PermBased>
                     </div>
                  );
               })
            )}
         </div>
      </>
   );
}

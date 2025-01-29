"use client";
import { useEffect, useState } from "react";

import { Button, Select } from "flowbite-react";
import { QuadPopover } from "./components/quadPopover";
import { QuadsTrip } from "./components/quadsTrip";
import { getQuads, getQuadsType } from "@/services/routes/quads";
import AddQuadModal from "./components/addQuad";
import { FaSearch } from "react-icons/fa";

export default function QuadPage() {
   const [filterFunc, setFilterFunc] = useState("mc");
   const [filterQuad, setFilterQuad] = useState(1);
   const [quadsType, setQuadsType] = useState([]);
   const [quads, setQuads] = useState([]);

   const [groupName, setGroupName] = useState("");
   const [typeName, setTypeName] = useState("");

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
         funcao: filterFunc,
         tipo_quad: filterQuad,
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
      if (quadsType.length == 0) {
         getQuadsType()
            .then((res) => res.json())
            .then((data) => setQuadsType(data));
      }
      getQuadsParams();
   }, [quadsType]);

   return (
      <>
         <h2>Quadrinhos</h2>

         <div className='my-5 w-5/12 flex justify-between'>
            <div className='flex gap-2'>
               <Select
                  value={filterFunc}
                  onChange={(e) => setFilterFunc(e.target.value)}
               >
                  <option value='mc'>Mecânico</option>
                  <option value='lm'>LoadMaster</option>
                  <option value='tf'>Taifeiro</option>
                  <option value='os'>Observador-SAR</option>
                  <option value='oe'>OE</option>
               </Select>

               <Select
                  value={filterQuad}
                  onChange={(e) => setFilterQuad(parseInt(e.target.value))}
               >
                  {quadsType.map((group, index) => {
                     const nameGroup = group.long.toUpperCase();
                     return (
                        <optgroup key={index} label={nameGroup}>
                           {group.types.map((type) => {
                              if (!type.exclude.includes(filterFunc)) {
                                 return (
                                    <option key={type.id} value={type.id}>
                                       {type.long.toUpperCase()}
                                    </option>
                                 );
                              }
                           })}
                        </optgroup>
                     );
                  })}
               </Select>

               <Button
                  className='grid p-0 items-center'
                  onClick={getQuadsParams}
               >
                  <FaSearch />
               </Button>
            </div>
         </div>

         <div className='m-4 uppercase'>
            <p className='font-bold text-2xl'>{groupName}</p>
            <p className='font-semibold text-base'>{typeName}</p>
         </div>

         <div className='flex flex-col px-2 py-3 gap-1 w-fit bg-white rounded-lg shadow-md'>
            {quads.map((item) => {
               return (
                  <div
                     key={item.trip.id}
                     className='flex justify-start items-center gap-1.5 '
                  >
                     <QuadsTrip
                        trip={item.trip}
                        lenTotalQuads={item.quads_len}
                        typeQuad={filterQuad}
                        quadsAllUpdate={getQuadsParams}
                     />
                     {item.quads.map((quad) => {
                        return <QuadPopover key={quad.id} quad={quad} />;
                     })}
                     <AddQuadModal
                        trip={item.trip}
                        callFunc={getQuadsParams}
                        type={filterQuad}
                     />
                  </div>
               );
            })}
         </div>
      </>
   );
}

"use client";
import { useEffect, useState } from "react";

import { Select } from "flowbite-react";
import { QuadPopover } from "./components/quadPopover";
import { QuadsTrip } from "./components/quadsTrip";
import { getQuads } from "@/services/routes/quads";
import AddQuadModal from "./components/addQuad";
import { SelectQuad, typeQuads } from "./components/infoQuads";

function getLongName(value) {
   const [group, quad] = value.split("-");

   const groupQuad = typeQuads.filter((g) => g.value == group)[0];
   const type = groupQuad.types.filter((t) => t.value == quad)[0];

   const res = {
      group: groupQuad.groupName,
      type: type.name.long,
   };

   return res;
}

export default function QuadPage() {
   const [filterFunc, setFilterFunc] = useState("mc");
   const [filterQuad, setFilterQuad] = useState("sobr-preto");
   const [quads, setQuads] = useState([]);

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
         });
   }

   useEffect(() => {
      getQuadsParams();
   }, [filterQuad, filterFunc]);

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

               <SelectQuad
                  value={filterQuad}
                  funcTrip={filterFunc}
                  onChange={setFilterQuad}
               />
            </div>
         </div>

         <div className='m-4'>
            <p className="font-bold text-lg">{`${getLongName(filterQuad).group}`}</p>
            <p className="font-semibold text-base">{`${getLongName(filterQuad).type}`}</p>
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

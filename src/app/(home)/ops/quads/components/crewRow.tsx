"use client";
import { useState } from "react";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { QuadsTrip } from "./quadsTrip";
import QuadForm from "./quadForm";
import { QuadPopover } from "./quadPopover";
import { CrewQuadRes } from "services/routes/quads";
import { VscAdd } from "react-icons/vsc";

interface CrewRowProps {
   tripQuadRes: CrewQuadRes;
   groupName: string;
   typeName: string;
   update: () => void;
}

export default function CrewRow({
   tripQuadRes,
   groupName,
   typeName,
   update,
}: CrewRowProps) {
   const [showForm, setShowForm] = useState(false);

   return (
      <div className='flex justify-start items-center gap-1 overflow-visible py-1 px-2'>
         <div className='flex-shrink-0 sticky px-1 left-0 z-10 bg-white overflow-visible'>
            <QuadsTrip
               trip={tripQuadRes.trip}
               totalQuads={tripQuadRes.quads_len}
               groupName={groupName}
               typeName={typeName}
               update={update}
            />
         </div>
         {tripQuadRes.quads.map((quad) => {
            return <QuadPopover key={quad.id} quad={quad} />;
         })}
         <PermBased resource={"quad_ops"} requiredPerm={"create"}>
            <VscAdd
               className='size-6 p-0 cursor-pointer flex-shrink-0'
               onClick={() => setShowForm(true)}
            />
         </PermBased>

         <QuadForm
            show={showForm}
            setShow={setShowForm}
            trip={tripQuadRes.trip}
            onSuccess={update}
         />
      </div>
   );
}

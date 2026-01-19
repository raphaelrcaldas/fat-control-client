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
}

export default function CrewRow({
   tripQuadRes,
   groupName,
   typeName,
}: CrewRowProps) {
   const [showForm, setShowForm] = useState(false);

   return (
      <div className="flex items-center justify-start gap-1 overflow-visible px-2 py-1">
         <div className="sticky left-0 z-10 shrink-0 overflow-visible bg-white px-1">
            <QuadsTrip
               trip={tripQuadRes.trip}
               totalQuads={tripQuadRes.quads_len}
               groupName={groupName}
               typeName={typeName}
            />
         </div>
         {tripQuadRes.quads.map((quad) => {
            return <QuadPopover key={quad.id} quad={quad} />;
         })}
         <PermBased resource={"quad_ops"} requiredPerm={"create"}>
            <VscAdd
               className="size-6 shrink-0 cursor-pointer p-0"
               onClick={() => setShowForm(true)}
            />
         </PermBased>

         <QuadForm
            show={showForm}
            setShow={setShowForm}
            trip={tripQuadRes.trip}
         />
      </div>
   );
}

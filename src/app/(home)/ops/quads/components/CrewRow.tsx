"use client";
import { useState } from "react";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { QuadsTrip } from "./QuadsTrip";
import { QuadForm } from "./QuadForm";
import { QuadPopover } from "./QuadPopover";
import { CrewQuadRes } from "services/routes/quads";
import { VscAdd } from "react-icons/vsc";

interface CrewRowProps {
   tripQuadRes: CrewQuadRes;
   groupName: string;
   typeName: string;
}

export function CrewRow({ tripQuadRes, groupName, typeName }: CrewRowProps) {
   const [showForm, setShowForm] = useState(false);

   return (
      <div className="flex items-center justify-start gap-1 overflow-visible px-1 py-0.5">
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
            <button
               type="button"
               aria-label={`Adicionar quadrinho de ${tripQuadRes.trip.trig}`}
               className="grid shrink-0 cursor-pointer place-items-center rounded p-1 hover:bg-slate-100 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
               onClick={() => setShowForm(true)}
            >
               <VscAdd className="size-6" />
            </button>
         </PermBased>

         <QuadForm
            show={showForm}
            setShow={setShowForm}
            trip={tripQuadRes.trip}
         />
      </div>
   );
}

import { FaGasPump } from "react-icons/fa";
import { GiParachute } from "react-icons/gi";
import { HiOutlineCube } from "react-icons/hi";
import type {
   HeavyCdsEtapaItem,
   HeavyCdsTipo,
   PqdEtapaItem,
   RevoEtapaItem,
} from "services/routes/estatistica/etapas";

const PQD_LABEL: Record<string, string> = {
   VTC: "VTC",
   LV: "LV",
   PREC: "PREC",
   LIVRE: "LIVRE",
};

const HVY_LABEL: Record<HeavyCdsTipo, string> = {
   heavy: "HEAVY",
   cds: "CDS",
};

interface EspecificosListProps {
   pqd: PqdEtapaItem[];
   revo: RevoEtapaItem[];
   heavyCds: HeavyCdsEtapaItem[];
}

/** Pequena unidade de exibicao: label em cima, valor mono embaixo. */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
   return (
      <div className="flex flex-col">
         <span className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
            {label}
         </span>
         <span className="font-mono text-sm font-bold text-gray-900">
            {value}
         </span>
      </div>
   );
}

export function EspecificosList({ pqd, revo, heavyCds }: EspecificosListProps) {
   if (pqd.length === 0 && revo.length === 0 && heavyCds.length === 0) {
      return null;
   }

   return (
      <div className="space-y-2">
         {pqd.map((p, i) => (
            <div
               key={`pqd-${i}`}
               className="flex flex-wrap items-center gap-4 rounded-xl border border-purple-200 bg-purple-50/40 p-3 shadow-sm"
            >
               <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <GiParachute className="h-4 w-4" />
               </span>
               <span className="text-sm font-semibold text-purple-800">
                  PQD
               </span>
               <div className="h-6 w-px bg-purple-200" />
               <Field label="Tipo" value={PQD_LABEL[p.tipo] ?? p.tipo} />
               <Field label="Qtd" value={p.qtd} />
            </div>
         ))}

         {revo.map((r, i) => (
            <div
               key={`revo-${i}`}
               className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/40 p-3 shadow-sm"
            >
               <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <FaGasPump className="h-4 w-4" />
               </span>
               <span className="text-sm font-semibold text-amber-800">
                  REVO
               </span>
               <div className="h-6 w-px bg-amber-200" />
               <Field
                  label="Comb. transferido (L)"
                  value={r.comb_transf.toLocaleString("pt-BR")}
               />
            </div>
         ))}

         {heavyCds.map((h, i) => (
            <div
               key={`hvy-${i}`}
               className="flex flex-wrap items-center gap-4 rounded-xl border border-red-200 bg-red-50/40 p-3 shadow-sm"
            >
               <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <HiOutlineCube className="h-4 w-4" />
               </span>
               <span className="text-sm font-semibold text-red-800">
                  {HVY_LABEL[h.tipo] ?? h.tipo}
               </span>
               <div className="h-6 w-px bg-red-200" />
               <Field
                  label="Peso (kg)"
                  value={h.peso.toLocaleString("pt-BR")}
               />
               <Field
                  label="Distância (m)"
                  value={h.dist.toLocaleString("pt-BR")}
               />
               <Field label="Radial (°)" value={h.radial} />
            </div>
         ))}
      </div>
   );
}

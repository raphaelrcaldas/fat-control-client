import { INDISP_OPTIONS } from "@/constants/ops/indisponibilidades";

// Status derivados (não são motivos de indisp) exibidos na grade.
const STATUS_EXTRA = [
   { label: "Disponível", swatch: "bg-emerald-600" },
   { label: "CEMAL Inválido", swatch: "bg-purple-600" },
   { label: "Desadaptado", swatch: "bg-slate-600" },
];

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
   return (
      <div className="flex items-center gap-1">
         <div className={`h-4 w-4 rounded ${swatch}`} />
         <span className="font-medium">{label}</span>
      </div>
   );
}

export function ColorLegend() {
   return (
      <div className="hidden shrink-0 flex-wrap justify-center gap-x-2 gap-y-1 border-b border-slate-200 bg-white p-2 text-xs sm:flex">
         {INDISP_OPTIONS.map((option) => (
            <LegendItem
               key={option.value}
               swatch={option.color.button}
               label={option.label}
            />
         ))}
         {STATUS_EXTRA.map((s) => (
            <LegendItem key={s.label} swatch={s.swatch} label={s.label} />
         ))}
      </div>
   );
}

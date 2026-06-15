import {
   getCartaoStatus,
   getDaysLabel,
   formatDate,
} from "../utils/cartaoStatus";
import { getStatusColors } from "../utils/statusColors";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
// Cor fixa por posição do pip (0=esquerda/A1 → 5=direita/C2)
const PIP_POSITION_COLORS = [
   "#EF9F27",
   "#F5C542",
   "#5DCAA5",
   "#1D9E75",
   "#0E7C5E",
   "#0A5640",
];

export default function LangCard({
   lang,
   level,
   validity,
}: {
   lang: string;
   level: string | null;
   validity: string | null;
}) {
   if (!level) {
      return (
         <div className="mb-2 rounded bg-gray-50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-700">{lang}</div>
            <div className="mt-0.5 text-[11px] text-gray-400">
               Não cadastrado
            </div>
         </div>
      );
   }

   const levelIdx = LEVELS.indexOf(level as (typeof LEVELS)[number]);
   const status = getCartaoStatus(validity);
   const colors = getStatusColors(status);

   return (
      <div className="mb-2 rounded bg-gray-50 px-3 py-2.5">
         <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">{lang}</span>
            <span
               className="rounded px-1.5 py-0.5 text-[11px] font-medium"
               style={{
                  backgroundColor: colors.badgeBg,
                  border: `0.5px solid ${colors.badgeBorder}`,
                  color: colors.text,
               }}
            >
               {level}
            </span>
         </div>
         <div className="mb-1 flex gap-1">
            {PIP_POSITION_COLORS.map((color, i) => (
               <div
                  key={i}
                  className="rounded-[3px]"
                  style={{
                     width: 18,
                     height: 6,
                     backgroundColor: i <= levelIdx ? color : "#e5e7eb",
                  }}
               />
            ))}
         </div>
         <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">A1 → C2</span>
            {validity && (
               <span className="text-[11px]" style={{ color: colors.text }}>
                  {formatDate(validity)} · {getDaysLabel(validity)}
               </span>
            )}
         </div>
      </div>
   );
}

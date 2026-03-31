import { MdExpandMore, MdExpandLess } from "react-icons/md";

interface RawSectionProps {
   showRaw: boolean;
   onToggle: () => void;
   metar: string;
   taf?: string | null;
}

export function RawSection({ showRaw, onToggle, metar, taf }: RawSectionProps) {
   return (
      <div>
         <button
            onClick={onToggle}
            className="flex items-center gap-1 text-xs font-medium text-gray-400 transition hover:text-gray-600"
         >
            {showRaw ? (
               <MdExpandLess size={16} />
            ) : (
               <MdExpandMore size={16} />
            )}
            Mensagem bruta
         </button>

         {showRaw && (
            <div className="mt-2 space-y-2 rounded-lg bg-slate-900 px-4 py-3">
               <p className="font-mono text-xs text-white/40">METAR</p>
               <p className="font-mono text-sm leading-relaxed break-all text-green-400">
                  {metar}
               </p>
               {taf && (
                  <>
                     <p className="mt-2 font-mono text-xs text-white/40">TAF</p>
                     <div className="font-mono text-sm text-blue-400">
                        {taf
                           .replace(
                              /\s+(BECMG|TEMPO|PROB\d+|RMK)/g,
                              "\n$1"
                           )
                           .split("\n")
                           .map((line, i) => (
                              <p
                                 key={i}
                                 className={
                                    i === 0
                                       ? "leading-relaxed"
                                       : "mt-1 pl-4 leading-relaxed"
                                 }
                              >
                                 {line}
                              </p>
                           ))}
                     </div>
                  </>
               )}
            </div>
         )}
      </div>
   );
}

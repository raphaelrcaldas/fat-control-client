import { CrewIndispList } from "services/routes/indisps";
import { DayColumn } from "./utils/indispDays";
import { TEXTO_VARREDURA } from "./utils/indispBoardLayout";
import { IndispBoardRow, IndispRowConfig } from "./IndispBoardRow";
import { IndispTrackColumns } from "./IndispTrackColumns";

/**
 * O Grid é um repassador: o contrato da linha é a FONTE, e ele só acrescenta
 * as duas listas. Redeclarar campo a campo fazia o `{...rowProps}` ser seguro
 * por coincidência — tirar um campo acusava erro no arquivo errado.
 */
interface IndispBoardGridProps extends IndispRowConfig {
   principais: CrewIndispList[];
   alunos: CrewIndispList[];
   /** Zebra e foco são desenhados uma vez para toda a trilha rolável. */
   days: DayColumn[];
}

/** Corpo rolável da grade: tripulantes, o corte de "Alunos", e os alunos. */
export function IndispBoardGrid({
   principais,
   alunos,
   days,
   ...rowProps
}: IndispBoardGridProps) {
   return (
      <div className="min-h-0 flex-1 overflow-y-auto">
         <div className="relative min-h-full">
            <IndispTrackColumns days={days} />
            <div className="relative z-10">
               {principais.map((tripData) => (
                  <IndispBoardRow
                     key={tripData.trip.id}
                     tripData={tripData}
                     {...rowProps}
                  />
               ))}

               {alunos.length > 0 && (
                  <>
                     <div className="flex items-center gap-2 bg-white px-3 pt-2 pb-1">
                        <span
                           className={`font-mono font-bold tracking-[0.14em] text-slate-500 ${TEXTO_VARREDURA}`}
                        >
                           ALUNOS
                        </span>
                        <div className="h-0.5 flex-1 bg-slate-300" />
                     </div>
                     {alunos.map((tripData) => (
                        <IndispBoardRow
                           key={tripData.trip.id}
                           tripData={tripData}
                           {...rowProps}
                        />
                     ))}
                  </>
               )}
            </div>
         </div>
      </div>
   );
}

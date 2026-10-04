import type {
   RelatorioMensal,
   ResumoMensal,
} from "services/routes/estatistica/relatorioMensal";
import { minutesToTime } from "utils/dateHandler";
import { RelatorioResumoTripulante } from "./RelatorioResumoTripulante";
import { EtapasMensais } from "./EtapasMensais";
import { TotaisMensais } from "./TotaisMensais";

function BlocoMensal({
   titulo,
   resumo,
}: {
   titulo: string;
   resumo: ResumoMensal;
}) {
   return (
      <section className="min-w-0 overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
            <span className="text-sm text-slate-700 tabular-nums">
               Total do mês <strong>{minutesToTime(resumo.total.tvoo)}</strong>
            </span>
         </div>
         {resumo.etapas.length ? (
            <EtapasMensais etapas={resumo.etapas} titulo={titulo} />
         ) : (
            <p className="px-4 py-3 text-sm text-slate-600">
               Nenhuma etapa registrada neste mês.
            </p>
         )}
         {resumo.total.sem_regime > 0 && (
            <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-600">
               {minutesToTime(resumo.total.sem_regime)} sem regime informado.
               Esse tempo está incluído nas horas totais.
            </p>
         )}
         <div className="border-t border-slate-200">
            <TotaisMensais resumo={resumo} titulo={titulo} />
         </div>
      </section>
   );
}

export function RelatorioMensalConteudo({
   relatorio,
}: {
   relatorio: RelatorioMensal;
}) {
   return (
      <div className="min-w-0 space-y-2">
         <RelatorioResumoTripulante
            tripulante={relatorio.tripulante}
            aeronaves={relatorio.aeronaves}
            simuladores={relatorio.simuladores}
            periodo="mês"
            mostrarUltimoVoo={false}
         />
         <BlocoMensal titulo="Aeronaves" resumo={relatorio.aeronaves} />
         <BlocoMensal titulo="Simuladores" resumo={relatorio.simuladores} />
      </div>
   );
}

import { MdEventAvailable } from "react-icons/md";

export function EmptyState() {
   return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center">
         <div className="grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-white shadow-inner">
            <MdEventAvailable className="text-2xl text-slate-400" />
         </div>
         <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">
            Briefing pendente
         </p>
         <h2 className="max-w-md text-base font-bold text-slate-700">
            Configure o período, o tipo de quadrinho e as funções para gerar a
            escala.
         </h2>
         <p className="max-w-md text-xs text-slate-500">
            A consulta cruza indisponibilidades, validade do CEMAL e contagem de
            quadrinhos para sugerir a tripulação disponível.
         </p>
      </div>
   );
}

export function NoResultsState() {
   return (
      <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
         <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">
            Sem retorno
         </p>
         <h2 className="text-sm font-bold text-slate-700">
            Nenhum tripulante elegível para os filtros selecionados.
         </h2>
      </div>
   );
}

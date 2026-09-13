interface ResultadosInfoProps {
   totalMissoes: number;
   totalEtapas: number;
}

/** Resumo da listagem: a busca agrupada nao e paginada, so totaliza. */
export function ResultadosInfo({
   totalMissoes,
   totalEtapas,
}: ResultadosInfoProps) {
   return (
      // aria-live: o total muda sozinho quando o filtro refaz a busca, sem
      // que nada receba foco — sem isso o leitor de tela nao anuncia.
      <span aria-live="polite" className="text-sm font-normal text-gray-500">
         <span className="font-semibold text-gray-900">{totalMissoes}</span>{" "}
         {totalMissoes === 1 ? "missao" : "missoes"}
         <span className="ml-1 font-normal">
            ({totalEtapas} {totalEtapas === 1 ? "etapa" : "etapas"})
         </span>
      </span>
   );
}

import { MdGroups } from "react-icons/md";

/**
 * Estado vazio da listagem, compartilhado pela tabela e pela lista de cards:
 * a mensagem diz por que a lista está vazia, e não só que está.
 *
 * Sem botão de limpar — ele mora na barra de contagem, sempre no mesmo lugar
 * enquanto houver filtro ativo. Tê-lo aqui fazia o botão pular do canto da
 * barra para o centro da tela justo quando o último filtro zerava a lista.
 */
export default function EmptyState({
   hasActiveFilters,
   searchTerm,
}: {
   hasActiveFilters: boolean;
   searchTerm: string;
}) {
   const description = searchTerm
      ? `Nenhum militar corresponde a “${searchTerm}”.`
      : hasActiveFilters
        ? "Nenhum militar corresponde aos filtros aplicados."
        : "Os militares aparecem aqui assim que houver tripulantes cadastrados na organização.";

   return (
      <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
         <MdGroups className="mb-4 h-16 w-16 text-gray-300" />
         <p className="text-lg font-medium text-gray-500">
            {hasActiveFilters
               ? "Nenhum resultado encontrado"
               : "Nenhum CRM lançado nesta organização"}
         </p>
         <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
   );
}

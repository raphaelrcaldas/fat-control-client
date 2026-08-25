import { MdHealthAndSafety } from "react-icons/md";

/**
 * Estado vazio da listagem, compartilhado pela tabela e pela lista de cards:
 * a mensagem diz por que a lista está vazia, e não só que está.
 *
 * Sem botão de limpar — já existe um na barra logo acima, sempre visível
 * enquanto houver filtro ativo.
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
        : "Nenhum militar cadastrado nesta organização.";

   return (
      <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
         <MdHealthAndSafety className="mb-4 h-12 w-12 text-gray-400" />
         <p className="font-medium text-gray-600">
            Nenhum resultado encontrado
         </p>
         <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
   );
}

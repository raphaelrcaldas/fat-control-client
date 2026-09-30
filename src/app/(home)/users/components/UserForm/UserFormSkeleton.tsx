import { Skeleton } from "@/components/ui/Skeleton";

// Campos por seção, no mesmo grid de `FormSections` (2 colunas no sm+): Dados
// Pessoais = nome (linha inteira) + 4 campos; Dados Militares = 10 campos + o
// "Usuário ativo" (linha inteira), que só existe na edição, o único modo que
// carrega dado.
// `true` = ocupa a linha inteira.
const PESSOAIS = [true, false, false, false, false];
const MILITARES = [...Array(10).fill(false), true];

function CampoSkeleton({ inteira }: { inteira: boolean }) {
   return (
      <div className={inteira ? "sm:col-span-2" : undefined}>
         <Skeleton className="mb-1 h-5 w-28" />
         <Skeleton className="h-[42px] w-full" />
      </div>
   );
}

function SecaoSkeleton({ campos }: { campos: boolean[] }) {
   return (
      <div className="rounded border border-slate-200 bg-white shadow">
         <div className="border-b border-slate-100 px-5 py-3">
            <Skeleton className="h-5 w-32" />
         </div>
         <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2">
            {campos.map((inteira, i) => (
               <CampoSkeleton key={i} inteira={inteira} />
            ))}
         </div>
      </div>
   );
}

/** Espelha o UserForm: duas seções em card + o rodapé com o botão. */
export function UserFormSkeleton() {
   return (
      <div role="status" className="space-y-3">
         <span className="sr-only">Carregando cadastro do usuário…</span>
         <SecaoSkeleton campos={PESSOAIS} />
         <SecaoSkeleton campos={MILITARES} />
         <div className="flex justify-end border-t border-gray-200 pt-5">
            <Skeleton className="h-12 w-44" />
         </div>
      </div>
   );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { TbClipboardList } from "react-icons/tb";

import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMissoesGle } from "@/hooks/queries/useGle";

import { MissaoGleCard } from "./components/MissaoGleCard";
import { MissoesSkeleton } from "./components/MissoesSkeleton";

/**
 * Os trabalhos de apuração salvos da unidade.
 *
 * A lista serve para **reconhecer e reabrir** uma missão, não para detalhar:
 * o cálculo mora dentro de cada uma, em rota própria.
 */
export function MissoesPage() {
   const router = useRouter();
   const { data: missoes, isLoading, isError, error } = useMissoesGle();

   return (
      <div className="space-y-2">
         <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
               Apurações salvas desta unidade. Abra uma para conferir ou
               corrigir o cálculo.
            </p>
            <PermBased resource="cegep.gle" requiredPerm="create">
               <Button
                  color="primary"
                  size="sm"
                  onClick={() => router.push("/cegep/gle/missoes/nova")}
               >
                  <HiPlus className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Nova missão</span>
                  <span className="sm:hidden">Nova</span>
               </Button>
            </PermBased>
         </div>

         {isError ? (
            <div
               className="rounded border border-slate-200 bg-white p-4 text-sm text-red-800 shadow-sm"
               role="alert"
            >
               Não foi possível carregar as missões
               {error instanceof Error ? `: ${error.message}` : "."}
            </div>
         ) : isLoading ? (
            <MissoesSkeleton />
         ) : (missoes ?? []).length === 0 ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
               <EmptyState
                  icon={TbClipboardList}
                  title="Nenhuma missão salva"
                  description="Crie uma missão para registrar os períodos em localidade especial e apurar o valor devido a cada militar."
               />
            </div>
         ) : (
            <ul className="space-y-2">
               {(missoes ?? []).map((missao) => (
                  <li key={missao.id}>
                     <MissaoGleCard missao={missao} />
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}

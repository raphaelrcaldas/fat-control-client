import clsx from "clsx";
import { Button } from "flowbite-react";
import {
   FaPlaneArrival,
   FaPlaneDeparture,
   FaRegMoneyBillAlt,
} from "react-icons/fa";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import type { CenarioCor } from "../cenarioPalette";
import type { PlanoStats } from "../propostaCalc";
import { PlanoMetricCard } from "./PlanoMetricCard";

interface PlanoMetricCardsProps {
   total: PlanoStats;
   aberturas: PlanoStats;
   fechamentos: PlanoStats;
   cor: CenarioCor;
   cenarioNome: string;
   /** Exercício em análise — aparece no aviso de teto ausente. */
   ano: number;
   /** Leva ao cadastro do teto do exercício (passa pela guarda de rascunho). */
   onCadastrarTeto: () => void;
   /**
    * Consolidado sendo refeito (troca de exercício). Esmaece os números em vez
    * de trocá-los por skeleton — os dados anteriores continuam legíveis.
    */
   isStale?: boolean;
   /** Primeira carga do consolidado: ainda não há resposta para afirmar nada. */
   isLoading?: boolean;
}

export function PlanoMetricCards({
   total,
   aberturas,
   fechamentos,
   cor,
   cenarioNome,
   ano,
   onCadastrarTeto,
   isStale = false,
   isLoading = false,
}: PlanoMetricCardsProps) {
   return (
      <>
         {/* Aviso ÚNICO de teto ausente: antes cada cartão repetia a frase. */}
         {!isLoading && total.semTeto && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50 px-4 py-2.5">
               <p className="flex items-center gap-2 text-sm text-amber-900">
                  <HiOutlineExclamationTriangle
                     aria-hidden
                     className="h-4 w-4 shrink-0"
                  />
                  Sem teto cadastrado para {ano} — os cartões mostram só o
                  comprometido, sem percentual nem saldo.
               </p>
               <PermBased resource="cegep.orcamento" requiredPerm="create">
                  <Button size="xs" color="light" onClick={onCadastrarTeto}>
                     Cadastrar teto
                  </Button>
               </PermBased>
            </div>
         )}

         <div
            className={clsx(
               "grid grid-cols-1 gap-2 transition-opacity md:grid-cols-3",
               isStale && "opacity-50"
            )}
         >
            <PlanoMetricCard
               label="Orçamento Total (Ano)"
               icon={<FaRegMoneyBillAlt />}
               stats={total}
               cor={cor}
               cenarioNome={cenarioNome}
               isLoading={isLoading}
            />
            {/* Fechamentos antes de Aberturas — mesma ordem da Gestão Fiscal,
                que lê o mesmo orçamento. */}
            <PlanoMetricCard
               label="Fechamentos (Términos)"
               icon={<FaPlaneArrival />}
               stats={fechamentos}
               cor={cor}
               cenarioNome={cenarioNome}
               isLoading={isLoading}
            />
            <PlanoMetricCard
               label="Aberturas (Inícios)"
               icon={<FaPlaneDeparture />}
               stats={aberturas}
               cor={cor}
               cenarioNome={cenarioNome}
               isLoading={isLoading}
            />
         </div>
      </>
   );
}

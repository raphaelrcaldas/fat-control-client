import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { realCurrency } from "utils/financeiro";
import type { CenarioDraft } from "../draftReducer";
import { corDoCenario } from "../cenarioPalette";
import {
   cenarioCodigo,
   type ImpactoFY,
   type PlanoStats,
} from "../propostaCalc";
import { CenarioResumoCard } from "./comparar/CenarioResumoCard";
import { MatrizComposicao } from "./comparar/MatrizComposicao";

interface CompararCenariosModalProps {
   show: boolean;
   onClose: () => void;
   cenarios: readonly CenarioDraft[];
   /** Impacto bruto de cada cenário no exercício em análise. */
   impactos: Map<string, ImpactoFY>;
   /** Consolidado + rascunho contra o teto, por cenário. */
   stats: Map<string, PlanoStats>;
   ano: number;
   /** Impacto de cada cenário no exercício seguinte (o que transborda). */
   anoSeguinteImpactos: Map<string, ImpactoFY>;
   /** Cenário aberto na tela de trás, para quem compara não se perder. */
   cenarioAtivoId: string | null;
}

const IMPACTO_ZERO: ImpactoFY = { aberturas: 0, fechamentos: 0, total: 0 };

/**
 * Comparação dos cenários da proposta. Só lê — nenhuma ação daqui altera o
 * rascunho.
 *
 * Duas leituras, porque a decisão precisa das duas: os **cartões** respondem
 * "quanto custa cada opção e como ela cabe no teto"; a **matriz** responde
 * "quem muda de uma para a outra" — que os totais escondem, já que dois
 * cenários podem custar o mesmo com gente diferente dentro.
 */
export function CompararCenariosModal({
   show,
   onClose,
   cenarios,
   impactos,
   stats,
   ano,
   anoSeguinteImpactos,
   cenarioAtivoId,
}: CompararCenariosModalProps) {
   const totalDe = (c: CenarioDraft) =>
      (impactos.get(c.localId) ?? IMPACTO_ZERO).total;

   // Referência de leitura: o mais barato do exercício. É contra ele que cada
   // cartão diz quanto custa a mais.
   const menorTotal = cenarios.length ? Math.min(...cenarios.map(totalDe)) : 0;
   const maiorTotal = cenarios.length ? Math.max(...cenarios.map(totalDe)) : 0;
   const amplitude = maiorTotal - menorTotal;

   // Teto e consolidado são do EXERCÍCIO, iguais para todos os cenários: um
   // qualquer serve de fonte, e dizê-los aqui evita repeti-los em cada cartão.
   const doExercicio = stats.get(cenarios[0]?.localId ?? "");
   const teto = doExercicio?.semTeto ? 0 : (doExercicio?.orcamento ?? 0);
   const comprometido = (doExercicio?.pago ?? 0) + (doExercicio?.previsto ?? 0);

   return (
      <Modal show={show} size="7xl" onClose={onClose} dismissible>
         <ModalHeader>Comparar cenários · exercício {ano}</ModalHeader>
         <ModalBody className="space-y-4">
            {/* Faixa de contexto: o que é igual para todos os cenários fica
                dito uma vez, em vez de repetido em cada cartão. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
               <span>
                  <strong className="font-semibold text-slate-700">
                     {cenarios.length}
                  </strong>{" "}
                  {cenarios.length === 1 ? "cenário" : "cenários"}
               </span>
               <span>
                  Teto de {ano}:{" "}
                  <strong className="font-semibold text-slate-700 tabular-nums">
                     {teto > 0 ? realCurrency(teto) : "não cadastrado"}
                  </strong>
               </span>
               <span title="Pago + previsto do exercício, antes da proposta">
                  Já comprometido:{" "}
                  <strong className="font-semibold text-slate-700 tabular-nums">
                     {realCurrency(comprometido)}
                  </strong>
               </span>
               {amplitude > 0 && (
                  <span>
                     Diferença entre o mais barato e o mais caro:{" "}
                     <strong className="font-semibold text-slate-700 tabular-nums">
                        {realCurrency(amplitude)}
                     </strong>
                  </span>
               )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
               {cenarios.map((c, i) => {
                  const imp = impactos.get(c.localId) ?? IMPACTO_ZERO;
                  return (
                     <CenarioResumoCard
                        key={c.localId}
                        codigo={cenarioCodigo(i)}
                        nome={c.nome}
                        cor={corDoCenario(c.cor)}
                        militares={c.linhas.length}
                        impacto={imp}
                        stats={stats.get(c.localId)}
                        transbordo={
                           (anoSeguinteImpactos.get(c.localId) ?? IMPACTO_ZERO)
                              .total
                        }
                        ano={ano}
                        delta={imp.total - menorTotal}
                        maisBarato={
                           cenarios.length > 1 && imp.total === menorTotal
                        }
                        ativo={c.localId === cenarioAtivoId}
                     />
                  );
               })}
            </div>

            <MatrizComposicao
               cenarios={cenarios}
               ano={ano}
               cenarioAtivoId={cenarioAtivoId}
            />

            <p className="text-xs leading-4 text-slate-500">
               {teto > 0
                  ? `A barra de cada cartão soma o que já está pago e previsto no exercício ao cenário — é o projetado contra o teto.`
                  : `Nenhum teto cadastrado para ${ano}: a barra mostra a composição do projetado, sem percentual.`}
            </p>
         </ModalBody>
      </Modal>
   );
}

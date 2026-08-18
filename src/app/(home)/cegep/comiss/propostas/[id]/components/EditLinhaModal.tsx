"use client";

import { useRef, useState } from "react";
import {
   Button,
   ButtonGroup,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Select,
   TextInput,
} from "flowbite-react";
import clsx from "clsx";
import { FaPlaneArrival, FaPlaneDeparture } from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import type { PropostaLinha } from "services/routes/cegep/propostas";
import {
   formatCents,
   parseDigitsToCents,
   realCurrency,
} from "utils/financeiro";
import type { LinhaDraft } from "../draftReducer";
import { getFiscalYears } from "../../../fiscalYears";

interface EditLinhaModalProps {
   /** `null` fecha o modal. */
   linha: LinhaDraft | null;
   anoSelecionado: number;
   /** Exercício da proposta — impõe o ano da abertura. */
   anoRef: number;
   onClose: () => void;
   onSave: (linhaId: string, patch: Partial<PropostaLinha>) => void;
}

/**
 * Quantidades de ajuda de custo aceitas pelo domínio — as mesmas do formulário
 * de comissionamento (`ComissForm`: `step 0.5`, teto 2, zero reprova). Lista
 * fechada em botões: com quatro opções, o `input[type=number]` só entregava
 * setinhas minúsculas e a chance de deixar 0.
 */
const QTDS_AJUDA = [0.5, 1, 1.5, 2] as const;

/** Exercícios oferecidos — os mesmos do resto do módulo de comissionamentos. */
const ANOS_FISCAIS = getFiscalYears();

const formatQtd = (q: number): string => q.toLocaleString("pt-BR");

/**
 * Edição de uma linha. O formulário é 100% local (valores em centavos) e só
 * toca o rascunho no "Aplicar" — digitar aqui não pode redesenhar a tabela nem
 * recalcular os cartões a cada tecla.
 *
 * O `<Modal>` fica SEMPRE montado (controlado por `show`) para o Flowbite
 * conseguir devolver o foco a quem abriu — desmontá-lo condicionalmente
 * (`{linha && <Modal/>}`) quebra o `FloatingFocusManager` do floating-ui, que
 * fecha em `document.body`. Quem reseta o formulário a cada linha é o
 * `LinhaFormContent` interno, com `key={linha.localId}` — só ele remonta.
 */
export function EditLinhaModal({
   linha,
   anoSelecionado,
   anoRef,
   onClose,
   onSave,
}: EditLinhaModalProps) {
   // Estável entre remontagens do formulário interno: é o que permite ao
   // Modal (que nunca desmonta) apontar o foco inicial para o campo certo em
   // vez de disputar com o `autoFocus` nativo — a raiz do foco perdido.
   const primeiroCampoRef = useRef<HTMLInputElement>(null);

   return (
      <Modal
         show={!!linha}
         size="2xl"
         onClose={onClose}
         dismissible
         initialFocus={primeiroCampoRef}
      >
         {linha && (
            <LinhaFormContent
               key={linha.localId}
               linha={linha}
               anoSelecionado={anoSelecionado}
               anoRef={anoRef}
               onClose={onClose}
               onSave={onSave}
               primeiroCampoRef={primeiroCampoRef}
            />
         )}
      </Modal>
   );
}

interface LinhaFormContentProps {
   linha: LinhaDraft;
   anoSelecionado: number;
   anoRef: number;
   onClose: () => void;
   onSave: (linhaId: string, patch: Partial<PropostaLinha>) => void;
   primeiroCampoRef: React.RefObject<HTMLInputElement | null>;
}

function LinhaFormContent({
   linha,
   anoSelecionado,
   anoRef,
   onClose,
   onSave,
   primeiroCampoRef,
}: LinhaFormContentProps) {
   const [baseAbCents, setBaseAbCents] = useState(
      Math.round((linha.base_ab ?? 0) * 100)
   );
   const [qtdAb, setQtdAb] = useState(linha.qtd_ab ?? 0);
   // A abertura é SEMPRE o exercício da proposta: uma proposta de 2026 não
   // planeja comissionamento que começa em outro ano. Não é campo, é fato.
   const anoAb = anoRef;

   const [baseFcCents, setBaseFcCents] = useState(
      Math.round((linha.base_fc ?? 0) * 100)
   );
   const [qtdFc, setQtdFc] = useState(linha.qtd_fc ?? 0);
   const [anoFc, setAnoFc] = useState(linha.ano_fc || anoRef);

   const valorAb = (baseAbCents / 100) * qtdAb;
   const valorFc = (baseFcCents / 100) * qtdFc;
   const subtotal = valorAb + valorFc;

   const impactoNoAno =
      (anoAb === anoSelecionado ? valorAb : 0) +
      (anoFc === anoSelecionado ? valorFc : 0);

   // Mesmas travas do `ComissForm`: quantidade zerada e valor zerado não são
   // planejamento, são linha esquecida. Bloqueiam o "Aplicar" e dizem por quê.
   const qtdAbOk = qtdAb > 0;
   const qtdFcOk = qtdFc > 0;
   const baseAbOk = baseAbCents > 0;
   const baseFcOk = baseFcCents > 0;
   const ordemOk = !anoFc || anoFc >= anoAb;

   const erros: string[] = [];
   if (!anoFc) erros.push("Escolha o exercício do fechamento.");
   if (!ordemOk)
      erros.push("O fechamento não pode cair antes do exercício da abertura.");
   if (!qtdAbOk || !qtdFcOk)
      erros.push("Escolha a quantidade de ajudas nas duas pernas.");
   if (!baseAbOk || !baseFcOk)
      erros.push("O valor-base não pode ficar zerado.");

   const podeSalvar = erros.length === 0;

   function aplicar() {
      if (!podeSalvar) return;
      onSave(linha.localId, {
         base_ab: baseAbCents / 100,
         qtd_ab: qtdAb,
         ano_ab: anoAb,
         base_fc: baseFcCents / 100,
         qtd_fc: qtdFc,
         ano_fc: anoFc,
      });
   }

   const militar = linha.user;

   return (
      <>
         <ModalHeader>
            <span className="block text-base leading-5 font-semibold text-slate-900">
               Editar linha
            </span>
            <span className="mt-0.5 block text-xs leading-4 font-medium text-slate-500 uppercase">
               {militar
                  ? [
                       militar.p_g,
                       militar.quadro,
                       militar.esp,
                       militar.nome_guerra,
                    ]
                       .filter(Boolean)
                       .join(" ")
                  : `Militar #${linha.user_id}`}
            </span>
         </ModalHeader>
         <ModalBody>
            <div className="space-y-4">
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <PernaFieldset
                     titulo="Abertura"
                     icone={<FaPlaneDeparture aria-hidden className="size-4" />}
                     idPrefix="ab"
                     baseCents={baseAbCents}
                     onBaseChange={setBaseAbCents}
                     baseOk={baseAbOk}
                     qtd={qtdAb}
                     onQtdChange={setQtdAb}
                     qtdOk={qtdAbOk}
                     ano={anoAb}
                     fixo
                     valor={valorAb}
                     anoSelecionado={anoSelecionado}
                     inputRef={primeiroCampoRef}
                  />

                  <PernaFieldset
                     titulo="Fechamento"
                     icone={<FaPlaneArrival aria-hidden className="size-4" />}
                     idPrefix="fc"
                     baseCents={baseFcCents}
                     onBaseChange={setBaseFcCents}
                     baseOk={baseFcOk}
                     qtd={qtdFc}
                     onQtdChange={setQtdFc}
                     qtdOk={qtdFcOk}
                     ano={anoFc}
                     onAnoChange={setAnoFc}
                     anoMin={anoAb}
                     anoInvalido={!ordemOk}
                     valor={valorFc}
                     anoSelecionado={anoSelecionado}
                  />
               </div>

               <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  {/* Duas pernas no mesmo exercício: um número só, dito uma
                      vez — repeti-lo sugere que são valores diferentes. */}
                  {Math.abs(impactoNoAno - subtotal) < 0.005 ? (
                     <span className="text-slate-600">
                        Subtotal da linha, todo em {anoSelecionado}:{" "}
                        <strong className="font-semibold text-slate-900 tabular-nums">
                           {realCurrency(subtotal)}
                        </strong>
                     </span>
                  ) : (
                     <>
                        <span className="text-slate-600">
                           Impacta {anoSelecionado} em{" "}
                           <strong className="font-semibold text-slate-900 tabular-nums">
                              {realCurrency(impactoNoAno)}
                           </strong>
                        </span>
                        <span className="text-slate-600">
                           Subtotal da linha{" "}
                           <strong className="font-semibold text-slate-900 tabular-nums">
                              {realCurrency(subtotal)}
                           </strong>
                        </span>
                     </>
                  )}
               </div>

               {erros.length > 0 && (
                  <div
                     role="alert"
                     className="flex gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                     <HiOutlineExclamationCircle
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0"
                     />
                     <ul className="space-y-0.5">
                        {erros.map((e) => (
                           <li key={e}>{e}</li>
                        ))}
                     </ul>
                  </div>
               )}

               <div className="flex justify-end gap-2">
                  <Button color="light" size="sm" onClick={onClose}>
                     Cancelar
                  </Button>
                  <Button
                     color="primary"
                     size="sm"
                     onClick={aplicar}
                     disabled={!podeSalvar}
                  >
                     Aplicar ao cenário
                  </Button>
               </div>
            </div>
         </ModalBody>
      </>
   );
}

interface PernaFieldsetProps {
   titulo: string;
   icone: React.ReactNode;
   idPrefix: string;
   baseCents: number;
   onBaseChange: (cents: number) => void;
   baseOk: boolean;
   qtd: number;
   onQtdChange: (qtd: number) => void;
   qtdOk: boolean;
   /** Exercício da perna; `0` = ainda não escolhido. */
   ano: number;
   /** Ausente quando o exercício é fixo (abertura). */
   onAnoChange?: (ano: number) => void;
   /** Exercício imposto pela proposta — exibido, não escolhido. */
   fixo?: boolean;
   /** Piso do fechamento: não faz sentido fechar antes de abrir. */
   anoMin?: number;
   /** Fechamento antes da abertura — marca o campo, o texto vai no alerta. */
   anoInvalido?: boolean;
   valor: number;
   anoSelecionado: number;
   /** Só a "Abertura" recebe: é o alvo do `initialFocus` do Modal. */
   inputRef?: React.RefObject<HTMLInputElement | null>;
}

function PernaFieldset({
   titulo,
   icone,
   idPrefix,
   baseCents,
   onBaseChange,
   baseOk,
   qtd,
   onQtdChange,
   qtdOk,
   ano,
   onAnoChange,
   fixo = false,
   anoMin,
   anoInvalido = false,
   valor,
   anoSelecionado,
   inputRef,
}: PernaFieldsetProps) {
   const noExercicio = ano === anoSelecionado;

   return (
      <fieldset className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-800">
            <span className="text-slate-500">{icone}</span>
            {titulo}
         </legend>

         <div className="space-y-3">
            <div>
               <Label
                  htmlFor={`${idPrefix}-base`}
                  className="mb-1.5 block text-xs font-medium text-slate-600"
               >
                  Valor-base
               </Label>
               <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm text-slate-500">
                     R$
                  </span>
                  <TextInput
                     id={`${idPrefix}-base`}
                     ref={inputRef}
                     inputMode="numeric"
                     value={formatCents(baseCents)}
                     onChange={(e) =>
                        onBaseChange(parseDigitsToCents(e.target.value))
                     }
                     placeholder="0,00"
                     aria-invalid={!baseOk}
                     className={clsx(
                        "[&_input]:pl-10 [&_input]:text-right [&_input]:tabular-nums",
                        !baseOk && "[&_input]:border-red-400"
                     )}
                  />
               </div>
            </div>

            <div>
               <span
                  id={`${idPrefix}-qtd-label`}
                  className="mb-1.5 block text-xs font-medium text-slate-600"
               >
                  Qtd. ajudas
               </span>
               <ButtonGroup
                  role="group"
                  aria-labelledby={`${idPrefix}-qtd-label`}
                  className={clsx(
                     "w-full",
                     !qtdOk && "rounded ring-1 ring-red-400"
                  )}
               >
                  {QTDS_AJUDA.map((q) => (
                     <Button
                        key={q}
                        size="sm"
                        color={qtd === q ? "primary" : "light"}
                        aria-pressed={qtd === q}
                        onClick={() => onQtdChange(q)}
                        className="flex-1 tabular-nums"
                     >
                        {formatQtd(q)}
                     </Button>
                  ))}
               </ButtonGroup>
            </div>

            <div>
               <Label
                  htmlFor={`${idPrefix}-ano`}
                  className="mb-1.5 block text-xs font-medium text-slate-600"
               >
                  Exercício
               </Label>
               {/* Lista fechada de exercícios — a proposta planeja por ANO. Dia
                   e mês não entram em cálculo nenhum e só pediriam do usuário
                   uma precisão que ele não tem no momento do planejamento. */}
               {fixo ? (
                  // Abertura: a proposta É de um exercício, então abrir fora
                  // dele não existe. Campo lido, não escolhido.
                  <p
                     id={`${idPrefix}-ano`}
                     className="flex items-baseline gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 tabular-nums"
                  >
                     {ano}
                     <span className="text-xs font-normal text-slate-500">
                        exercício da proposta
                     </span>
                  </p>
               ) : (
                  <Select
                     id={`${idPrefix}-ano`}
                     value={ano || ""}
                     onChange={(e) => onAnoChange?.(Number(e.target.value))}
                     aria-invalid={anoInvalido || !ano}
                     className={clsx(
                        "[&_select]:tabular-nums",
                        (anoInvalido || !ano) && "[&_select]:border-red-400"
                     )}
                  >
                     <option value="" disabled>
                        Selecione
                     </option>
                     {ANOS_FISCAIS.filter((y) => !anoMin || y >= anoMin).map(
                        (y) => (
                           <option key={y} value={y}>
                              {y}
                           </option>
                        )
                     )}
                  </Select>
               )}
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-2 text-xs leading-4">
               <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="text-slate-500 tabular-nums">
                     {formatQtd(qtd)} × {realCurrency(baseCents / 100)}
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                     {realCurrency(valor)}
                  </span>
               </div>
               <span
                  className={clsx(
                     "inline-block rounded px-1.5 py-0.5 font-medium",
                     !ano
                        ? "bg-slate-100 text-slate-500"
                        : noExercicio
                          ? "bg-slate-100 text-slate-700"
                          : "bg-amber-50 text-amber-800"
                  )}
               >
                  {ano
                     ? noExercicio
                        ? `Impacta ${anoSelecionado}`
                        : `Cai em ${ano}, fora do exercício`
                     : "Sem exercício"}
               </span>
            </div>
         </div>
      </fieldset>
   );
}

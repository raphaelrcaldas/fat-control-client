"use client";

import { useEffect, useState } from "react";
import {
   Button,
   Dropdown,
   DropdownItem,
   Modal,
   ModalBody,
   ModalHeader,
   TextInput,
} from "flowbite-react";
import clsx from "clsx";
import {
   HiDotsHorizontal,
   HiOutlinePlus,
   HiSwitchHorizontal,
} from "react-icons/hi";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import type { CenarioDraft } from "../draftReducer";
import { corDoCenario } from "../cenarioPalette";
import { cenarioCodigo, type PlanoStats } from "../propostaCalc";
import { CenarioChip } from "./CenarioChip";

interface CenarioChipsBarProps {
   cenarios: readonly CenarioDraft[];
   activeId: string | null;
   impactos: Map<string, PlanoStats>;
   dirtyIds: Set<string>;
   onSelect: (localId: string) => void;
   onAdd: () => void;
   onRename: (localId: string, nome: string) => void;
   onRemove: (localId: string) => void;
   onCompare: () => void;
   /** Consolidado sendo refeito: esmaece os valores, sem trocar por skeleton. */
   isStale?: boolean;
   /** Sem `comiss.propostas:update`, só comparar e trocar de cenário. */
   podeEditar: boolean;
}

const STATS_VAZIO: PlanoStats = {
   orcamento: 0,
   pago: 0,
   previsto: 0,
   rascunho: 0,
   projetado: 0,
   disponivel: 0,
   excedeTeto: false,
   semTeto: true,
   pctProjetado: 0,
};

/**
 * Trilho de cenários da proposta. Além de selecionar, é daqui que se cria
 * (duplicando o ativo), renomeia, remove e abre a comparação.
 */
export function CenarioChipsBar({
   cenarios,
   activeId,
   impactos,
   dirtyIds,
   onSelect,
   onAdd,
   onRename,
   onRemove,
   onCompare,
   isStale = false,
   podeEditar,
}: CenarioChipsBarProps) {
   const [renomeando, setRenomeando] = useState<CenarioDraft | null>(null);
   const [removendo, setRemovendo] = useState<CenarioDraft | null>(null);

   const ativo = cenarios.find((c) => c.localId === activeId) ?? null;
   const podeRemover = cenarios.length > 1;
   const podeComparar = cenarios.length > 1;

   return (
      <div className="rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
         <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            {/* `relative` para o indicador de overflow; o gradiente à direita
                avisa que o trilho de cenários continua fora da tela no
                mobile (mesmo padrão da LinhasTable). */}
            <div className="relative min-w-0">
               <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-linear-to-l from-white to-transparent md:hidden"
               />
               <div
                  role="group"
                  aria-label="Cenários da proposta"
                  className={clsx(
                     "flex gap-2 overflow-x-auto pb-1 transition-opacity",
                     isStale && "opacity-50"
                  )}
               >
                  {cenarios.map((c, i) => (
                     <CenarioChip
                        key={c.localId}
                        codigo={cenarioCodigo(i)}
                        nome={c.nome}
                        cor={corDoCenario(c.cor)}
                        stats={impactos.get(c.localId) ?? STATS_VAZIO}
                        militares={c.linhas.length}
                        active={c.localId === activeId}
                        dirty={dirtyIds.has(c.localId)}
                        onClick={() => onSelect(c.localId)}
                     />
                  ))}

                  {podeEditar && (
                     <button
                        type="button"
                        onClick={onAdd}
                        title="Duplica o cenário ativo como ponto de partida"
                        className="focus-visible:ring-primary-500 flex w-36 shrink-0 flex-col items-center justify-center gap-1 rounded border border-dashed border-slate-300 px-3 py-2 text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 pointer-coarse:min-h-[44px]"
                     >
                        <HiOutlinePlus className="h-4 w-4" />
                        <span className="text-xs font-semibold">
                           Novo cenário
                        </span>
                     </button>
                  )}
               </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
               <Button
                  size="sm"
                  color="light"
                  onClick={onCompare}
                  disabled={!podeComparar}
                  title={
                     podeComparar
                        ? "Comparar os cenários lado a lado"
                        : "Crie um segundo cenário para comparar"
                  }
               >
                  <HiSwitchHorizontal className="mr-2 h-4 w-4" />
                  Comparar
               </Button>

               {/* O menu só tem ações de escrita: em modo leitura ele some
                   inteiro, em vez de virar dois itens desabilitados. */}
               {podeEditar && (
                  <Dropdown
                     size="sm"
                     color="light"
                     arrowIcon={false}
                     disabled={!ativo}
                     label={
                        <span className="flex items-center gap-1.5">
                           <HiDotsHorizontal className="h-4 w-4" />
                           <span className="sr-only">
                              Ações do cenário {ativo?.nome ?? "ativo"}
                           </span>
                        </span>
                     }
                  >
                     <DropdownItem
                        onClick={() => ativo && setRenomeando(ativo)}
                        disabled={!ativo}
                     >
                        Renomear cenário
                     </DropdownItem>
                     <DropdownItem
                        onClick={() => ativo && setRemovendo(ativo)}
                        disabled={!ativo || !podeRemover}
                        className={podeRemover ? "text-red-700" : undefined}
                     >
                        Remover cenário
                     </DropdownItem>
                  </Dropdown>
               )}
            </div>
         </div>

         <RenomearCenarioModal
            cenario={renomeando}
            onClose={() => setRenomeando(null)}
            onConfirm={(nome) => {
               if (renomeando) onRename(renomeando.localId, nome);
               setRenomeando(null);
            }}
         />

         <RemoverCenarioModal
            cenario={removendo}
            onClose={() => setRemovendo(null)}
            onConfirm={() => {
               if (removendo) onRemove(removendo.localId);
               setRemovendo(null);
            }}
         />
      </div>
   );
}

/** Renomear: estado local, o rascunho só é tocado no confirmar. */
function RenomearCenarioModal({
   cenario,
   onClose,
   onConfirm,
}: {
   cenario: CenarioDraft | null;
   onClose: () => void;
   onConfirm: (nome: string) => void;
}) {
   const [nome, setNome] = useState("");

   useEffect(() => {
      if (cenario) setNome(cenario.nome);
   }, [cenario]);

   const valido = nome.trim().length > 0;

   return (
      <Modal show={!!cenario} size="md" onClose={onClose} dismissible>
         <ModalHeader>Renomear cenário</ModalHeader>
         <ModalBody>
            <div className="space-y-3">
               <TextInput
                  id="cenario-nome"
                  value={nome}
                  autoFocus
                  maxLength={60}
                  placeholder="Ex.: Escala mínima"
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === "Enter" && valido) onConfirm(nome.trim());
                  }}
               />
               <p className="text-xs text-slate-500">
                  O nome aparece nos cartões e na comparação. O código (A, B, C)
                  continua vindo da ordem dos cenários.
               </p>
               <div className="flex justify-end gap-2">
                  <Button color="light" size="sm" onClick={onClose}>
                     Cancelar
                  </Button>
                  <Button
                     color="primary"
                     size="sm"
                     disabled={!valido}
                     onClick={() => onConfirm(nome.trim())}
                  >
                     Salvar nome
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}

/** Remoção é destrutiva e leva as linhas junto — sempre confirmada. */
function RemoverCenarioModal({
   cenario,
   onClose,
   onConfirm,
}: {
   cenario: CenarioDraft | null;
   onClose: () => void;
   onConfirm: () => void;
}) {
   const linhas = cenario?.linhas.length ?? 0;

   return (
      <Modal show={!!cenario} size="md" onClose={onClose} popup dismissible>
         <ModalHeader />
         <ModalBody>
            <div className="px-2 pb-2 text-center">
               <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <HiOutlineExclamationTriangle className="h-8 w-8 text-red-600" />
               </div>
               <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Remover “{cenario?.nome}”?
               </h3>
               <p className="mb-6 text-sm text-slate-600">
                  {linhas === 0
                     ? "O cenário está vazio."
                     : linhas === 1
                       ? "A única linha deste cenário será descartada."
                       : `As ${linhas} linhas deste cenário serão descartadas.`}{" "}
                  A remoção só vale de fato quando você salvar a proposta.
               </p>
               <div className="flex justify-center gap-3">
                  <Button color="red" onClick={onConfirm}>
                     Sim, remover
                  </Button>
                  <Button color="light" onClick={onClose}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}

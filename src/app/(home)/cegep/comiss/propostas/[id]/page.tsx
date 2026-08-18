"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
   getStringParam,
   useSearchParamsUpdater,
} from "@/hooks/useSearchParamsState";
import { Button } from "flowbite-react";
import { useQueryClient } from "@tanstack/react-query";
import { useComissList, useComissSummary } from "@/hooks/queries";
import { remuneracaoQueryOptions } from "@/hooks/queries/useDadosBancarios";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useToast } from "@/app/context/toast";
import { ApiError } from "services/Api";
import type { UserPublic } from "services/routes/users";
import type { PropostaLinha } from "services/routes/cegep/propostas";
import { getDefaultFiscalYear } from "../../fiscalYears";
import { usePropostaDraft } from "./usePropostaDraft";
import { corDoCenario } from "./cenarioPalette";
import {
   calcImpactoCenario,
   combinarComTeto,
   type ImpactoFY,
   type PlanoStats,
} from "./propostaCalc";
import { novaLinhaDefaults } from "./linhaDefaults";
import { SandboxSubheader } from "./components/SandboxSubheader";
import { SairSemSalvarModal } from "./components/SairSemSalvarModal";
import { CenarioChipsBar } from "./components/CenarioChipsBar";
import { PlanoMetricCards } from "./components/PlanoMetricCards";
import { LinhasTable } from "./components/LinhasTable";
import { AddMilitaresModal } from "./components/AddMilitaresModal";
import { EditLinhaModal } from "./components/EditLinhaModal";
import { CompararCenariosModal } from "./components/CompararCenariosModal";
import { SandboxSkeleton } from "./components/SandboxSkeleton";

const IMPACTO_ZERO: ImpactoFY = { aberturas: 0, fechamentos: 0, total: 0 };

const HTTP_FORBIDDEN = 403;

/** Identidade militar em caixa alta, como manda a convenção do projeto. */
const identidadeDe = (user: UserPublic) =>
   `${user.p_g} ${user.nome_guerra}`.toUpperCase();

/**
 * Sandbox da proposta: única dona do rascunho da proposta. O consolidado
 * real do exercício vem do `/comiss/summary`; o cenário ativo e o exercício em
 * análise são estado de VIEW. O cenário mora na URL para sobreviver ao
 * voltar/avançar do histórico — não é link compartilhável nem sobrevive ao F5:
 * o identificador é o `localId`, recriado a cada carga (daí o fallback para o
 * primeiro cenário).
 */
export default function PropostaSandboxPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const queryClient = useQueryClient();

   // Sem `update` o rascunho nunca chega ao banco. Esconder só o botão Salvar
   // deixaria a pessoa montar a proposta inteira para perder tudo, então o
   // sandbox inteiro entra em modo leitura: quem só tem `view` compara e
   // consulta, não edita.
   const podeEditar = hasPerm("comiss.propostas", "update");

   const idBruto = Number(params.id);
   const idValido = Number.isInteger(idBruto) && idBruto > 0;
   const propostaId = idValido ? idBruto : null;

   const { status, draft, isDirty, dirtyCenarioIds, actions, save, isSaving } =
      usePropostaDraft(propostaId);

   // Espelho do rascunho para leitura DEPOIS de um await: o handler de adicionar
   // militar fecha sobre o `draft` do render em que foi criado, e a busca da
   // remuneração dá tempo de o cenário mudar debaixo dele.
   const draftRef = useRef(draft);
   draftRef.current = draft;

   // --- Estado de view ---
   const { searchParams, setParams } = useSearchParamsUpdater();
   const cenarioParam = getStringParam(searchParams, "cenario");

   // `null` = "ainda seguindo o exercício da proposta"; assim o seletor não
   // precisa de efeito de sincronização quando o rascunho chega.
   const [anoEscolhido, setAnoEscolhido] = useState<number | null>(null);
   const ano = anoEscolhido ?? draft?.ano_ref ?? getDefaultFiscalYear();

   const [showAdd, setShowAdd] = useState(false);
   const [showComparar, setShowComparar] = useState(false);
   const [linhaEditandoId, setLinhaEditandoId] = useState<string | null>(null);
   // Militar cuja remuneração está sendo buscada — o item do modal espera.
   const [buscandoRemunId, setBuscandoRemunId] = useState<number | null>(null);
   // Destino de uma navegação para fora barrada pelo rascunho pendente.
   const [saidaPendente, setSaidaPendente] = useState<string | null>(null);

   // --- Dados de apoio ---
   const {
      data: summary,
      isFetching: summaryFetching,
      isLoading: summaryLoading,
   } = useComissSummary(ano);
   const { data: comissAbertos = [] } = useComissList({ status: "aberto" });

   const conflitosIds = useMemo(
      () => new Set(comissAbertos.map((c) => c.user_id)),
      [comissAbertos]
   );

   // Cenário ativo: o da URL quando existe, senão o primeiro. Nada é reescrito
   // na URL nesse fallback — os `localId` são recriados a cada carga, e
   // corrigi-la aqui geraria navegação em laço.
   const cenarios = draft?.cenarios ?? [];
   const cenarioAtivo =
      cenarios.find((c) => c.localId === cenarioParam) ?? cenarios[0] ?? null;

   const cor = corDoCenario(cenarioAtivo?.cor ?? "sky");

   // --- Derivações ---
   const impactosPorCenario = useMemo(() => {
      const map = new Map<string, ImpactoFY>();
      for (const c of cenarios) {
         map.set(c.localId, calcImpactoCenario(c.linhas, ano));
      }
      return map;
   }, [cenarios, ano]);

   const impactosAnoSeguinte = useMemo(() => {
      const map = new Map<string, ImpactoFY>();
      for (const c of cenarios) {
         map.set(c.localId, calcImpactoCenario(c.linhas, ano + 1));
      }
      return map;
   }, [cenarios, ano]);

   const statsPorCenario = useMemo(() => {
      const map = new Map<string, PlanoStats>();
      for (const c of cenarios) {
         const imp = impactosPorCenario.get(c.localId) ?? IMPACTO_ZERO;
         map.set(c.localId, combinarComTeto(summary?.total, imp.total));
      }
      return map;
   }, [cenarios, impactosPorCenario, summary?.total]);

   const impactoAtivo = cenarioAtivo
      ? (impactosPorCenario.get(cenarioAtivo.localId) ?? IMPACTO_ZERO)
      : IMPACTO_ZERO;

   const cardsStats = useMemo(
      () => ({
         total: combinarComTeto(summary?.total, impactoAtivo.total),
         aberturas: combinarComTeto(summary?.abertura, impactoAtivo.aberturas),
         fechamentos: combinarComTeto(
            summary?.fechamento,
            impactoAtivo.fechamentos
         ),
      }),
      [summary, impactoAtivo]
   );

   const militaresNoCenario = useMemo(
      () => new Set((cenarioAtivo?.linhas ?? []).map((l) => l.user_id)),
      [cenarioAtivo?.linhas]
   );

   const linhaEditando =
      cenarioAtivo?.linhas.find((l) => l.localId === linhaEditandoId) ?? null;

   // --- Ações ---
   const cenarioAtivoId = cenarioAtivo?.localId ?? null;

   const handleSelectCenario = useCallback(
      (localId: string) => setParams({ cenario: localId }),
      [setParams]
   );

   const handleAddCenario = useCallback(() => {
      if (!cenarioAtivoId) return;
      const novoId = actions.addCenario(cenarioAtivoId);
      setParams({ cenario: novoId });
   }, [actions, cenarioAtivoId, setParams]);

   const handleRemoveCenario = useCallback(
      (localId: string) => {
         actions.removeCenario(localId);
         if (localId === cenarioAtivoId) setParams({ cenario: undefined });
      },
      [actions, cenarioAtivoId, setParams]
   );

   const handleToggleMilitar = useCallback(
      async (user: UserPublic, selecionado: boolean) => {
         if (!cenarioAtivoId || !draft) return;
         if (!selecionado) {
            const alvo = draft.cenarios
               .find((c) => c.localId === cenarioAtivoId)
               ?.linhas.find((l) => l.user_id === user.id);
            if (alvo) actions.removeLinha(cenarioAtivoId, alvo.localId);
            return;
         }

         // A remuneração é buscada aqui, no militar escolhido — e não para a
         // lista de busca inteira: é PII, e quem só apareceu num resultado de
         // busca não tem por que ter o salário carregado.
         const cenarioAlvo = cenarioAtivoId;
         setBuscandoRemunId(user.id);
         let base = 0;
         try {
            const { remuneracao } = await queryClient.fetchQuery(
               remuneracaoQueryOptions(user.id)
            );
            base = remuneracao ?? 0;
            if (remuneracao == null) {
               push({
                  title: "Sem remuneração cadastrada",
                  message: `${identidadeDe(user)} entrou no cenário com valor-base zerado — informe o valor na linha.`,
                  type: "warning",
               });
            }
         } catch (err: unknown) {
            // Sem permissão de PII ou falha de rede: a linha nasce mesmo
            // assim (zerada), porque montar o cenário não pode depender de
            // um valor que o planejador pode digitar. 403 não é falha: é o
            // sistema funcionando, então avisa em vez de acusar erro.
            const semPermissao =
               err instanceof ApiError && err.status === HTTP_FORBIDDEN;
            push({
               title: semPermissao
                  ? "Remuneração não visível"
                  : "Remuneração indisponível",
               message: semPermissao
                  ? "Você não tem permissão para ver remunerações; as linhas entram com valor-base zerado."
                  : "Não foi possível obter a remuneração do militar. A linha entrou com valor-base zerado.",
               type: semPermissao ? "warning" : "error",
            });
         } finally {
            setBuscandoRemunId(null);
         }

         // O rascunho pode ter mudado durante o `await`: o modal é dismissível,
         // e trocar/remover cenário no meio jogaria a linha no cenário errado —
         // ou a faria sumir sem aviso (o reducer ignora cenário inexistente).
         const cenarioAgora = draftRef.current?.cenarios.find(
            (c) => c.localId === cenarioAlvo
         );
         if (!cenarioAgora) {
            push({
               title: "Cenário não encontrado",
               message: `O cenário mudou enquanto a remuneração era buscada; ${identidadeDe(user)} não foi adicionado.`,
               type: "warning",
            });
            return;
         }
         // Cliques repetidos no mesmo militar não podem duplicar a linha —
         // `ADD_LINHAS` não deduplica.
         if (cenarioAgora.linhas.some((l) => l.user_id === user.id)) return;

         actions.addLinhas(cenarioAlvo, [
            novaLinhaDefaults(user, base, draft.ano_ref),
         ]);

         // A linha sempre nasce no exercício da proposta; analisando outro ano,
         // ela entra fora da vista e o cenário parece não ter mudado.
         if (ano !== draft.ano_ref) {
            push({
               title: `Linha criada em ${draft.ano_ref}`,
               message: `A proposta é do exercício ${draft.ano_ref}; você está analisando ${ano}, então a linha não aparece nos totais desta vista.`,
               type: "info",
            });
         }
      },
      [actions, ano, cenarioAtivoId, draft, push, queryClient]
   );

   const handleRemoveLinha = useCallback(
      (linhaId: string) => {
         if (cenarioAtivoId) actions.removeLinha(cenarioAtivoId, linhaId);
      },
      [actions, cenarioAtivoId]
   );

   const handleUpdateLinha = useCallback(
      (linhaId: string, patch: Partial<PropostaLinha>) => {
         if (cenarioAtivoId)
            actions.updateLinha(cenarioAtivoId, linhaId, patch);
         setLinhaEditandoId(null);
      },
      [actions, cenarioAtivoId]
   );

   // Saída pelos controles DESTA tela: com rascunho pendente, confirma antes
   // de navegar (o `beforeunload` abaixo só cobre F5/fechar aba).
   //
   // Limitação conhecida: o menu lateral do app navega pelos `Link` do shell,
   // que não passam por aqui — sair por ele descarta o rascunho sem aviso.
   // Cobrir isso exige um guard de rota no layout compartilhado.
   const navegar = useCallback(
      (href: string) => {
         if (isDirty) setSaidaPendente(href);
         else router.push(href);
      },
      [isDirty, router]
   );

   const handleSave = useCallback(async () => {
      try {
         await save();
         push({
            title: "Proposta salva",
            message: "As alterações da proposta foram gravadas.",
            type: "success",
         });
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar a proposta",
            type: "error",
         });
      }
   }, [push, save]);

   // Rede de proteção do rascunho: F5/fechar aba com alteração pendente.
   useEffect(() => {
      if (!isDirty) return;
      const handler = (e: BeforeUnloadEvent) => e.preventDefault();
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
   }, [isDirty]);

   if (!hasPerm("comiss.propostas", "view")) {
      return (
         <AvisoTelaCheia
            titulo="Sem permissão"
            texto="Você não tem permissão para acessar as propostas de comissionamento."
            onVoltar={() => router.push("/cegep/comiss")}
         />
      );
   }

   if (!idValido || status === "error") {
      return (
         <AvisoTelaCheia
            titulo="Proposta não encontrada"
            texto="A proposta que você tentou abrir não existe ou foi excluída."
            onVoltar={() => router.push("/cegep/comiss?tab=propostas")}
         />
      );
   }

   return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col space-y-2">
         <SandboxSubheader
            nome={draft?.nome ?? "Carregando…"}
            onRename={actions.renameProposta}
            ano={ano}
            anoRef={draft?.ano_ref ?? ano}
            onAnoChange={setAnoEscolhido}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={handleSave}
            onNavigate={navegar}
            podeEditar={podeEditar}
         />

         {status !== "ready" || !draft || !cenarioAtivo ? (
            <SandboxSkeleton />
         ) : (
            <>
               <CenarioChipsBar
                  cenarios={draft.cenarios}
                  activeId={cenarioAtivo.localId}
                  impactos={statsPorCenario}
                  dirtyIds={dirtyCenarioIds}
                  onSelect={handleSelectCenario}
                  onAdd={handleAddCenario}
                  onRename={actions.renameCenario}
                  onRemove={handleRemoveCenario}
                  onCompare={() => setShowComparar(true)}
                  isStale={summaryFetching}
                  podeEditar={podeEditar}
               />

               <PlanoMetricCards
                  total={cardsStats.total}
                  aberturas={cardsStats.aberturas}
                  fechamentos={cardsStats.fechamentos}
                  cor={cor}
                  cenarioNome={cenarioAtivo.nome}
                  ano={ano}
                  onCadastrarTeto={() =>
                     navegar(`/cegep/comiss/orcamento?ano=${ano}`)
                  }
                  isStale={summaryFetching}
                  isLoading={summaryLoading}
               />

               <LinhasTable
                  linhas={cenarioAtivo.linhas}
                  cenarioNome={cenarioAtivo.nome}
                  anoSelecionado={ano}
                  onEdit={setLinhaEditandoId}
                  onRemove={handleRemoveLinha}
                  onAdd={() => setShowAdd(true)}
                  podeEditar={podeEditar}
               />

               <AddMilitaresModal
                  show={showAdd}
                  onClose={() => setShowAdd(false)}
                  selecionadosIds={militaresNoCenario}
                  onToggle={handleToggleMilitar}
                  buscandoRemunId={buscandoRemunId}
                  conflitosIds={conflitosIds}
                  cenarioNome={cenarioAtivo.nome}
               />

               <EditLinhaModal
                  linha={linhaEditando}
                  anoSelecionado={ano}
                  anoRef={draft.ano_ref}
                  onClose={() => setLinhaEditandoId(null)}
                  onSave={handleUpdateLinha}
               />

               <CompararCenariosModal
                  show={showComparar}
                  onClose={() => setShowComparar(false)}
                  cenarios={draft.cenarios}
                  impactos={impactosPorCenario}
                  stats={statsPorCenario}
                  ano={ano}
                  anoSeguinteImpactos={impactosAnoSeguinte}
                  cenarioAtivoId={cenarioAtivoId}
               />
            </>
         )}

         <SairSemSalvarModal
            href={saidaPendente}
            onClose={() => setSaidaPendente(null)}
            onConfirm={() => {
               if (saidaPendente) router.push(saidaPendente);
               setSaidaPendente(null);
            }}
         />
      </div>
   );
}

function AvisoTelaCheia({
   titulo,
   texto,
   onVoltar,
}: {
   titulo: string;
   texto: string;
   onVoltar: () => void;
}) {
   return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
         <p className="text-lg font-semibold text-slate-700">{titulo}</p>
         <p className="max-w-md text-sm text-slate-500">{texto}</p>
         <Button size="sm" color="light" onClick={onVoltar}>
            Voltar para as propostas
         </Button>
      </div>
   );
}

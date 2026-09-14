"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { useToast } from "@/app/context/toast";
import {
   useDeleteOperacao,
   useOperacao,
   useOperacaoEtapas,
   usePessoal,
} from "@/hooks/queries/useOperacoes";
import { OperacaoFetchError } from "services/routes/ops/operacoes";
import { OperacaoIdentificacao } from "../components/OperacaoIdentificacao";
import { IndicadoresGrid } from "../components/IndicadoresGrid";
import { EsforcoResumo } from "../components/EsforcoResumo";
import { SeboResumo } from "../components/SeboResumo";
import { EtapasResumo } from "../components/EtapasResumo";
import { EfetivoResumo } from "../components/EfetivoResumo";
import { EsforcoModal } from "../components/EsforcoModal";
import { SeboModal } from "../components/SeboModal";
import { EtapasModal } from "../components/EtapasModal";
import { EfetivoModal } from "../components/EfetivoModal";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { OperacaoFormModal } from "../components/OperacaoFormModal";
import { AssociarEtapasModal } from "../components/AssociarEtapasModal";
import { OperacaoDetailSkeleton } from "../components/OperacaoDetailSkeleton";
import {
   agruparPessoal,
   contarPorCirculo,
} from "../components/pessoalAgrupado";

/**
 * Detalhe da operação — um dossiê.
 *
 * Coluna única, sem abas: o que estava numa aba não existia enquanto se olhava
 * outra, e o volume de cada lista só aparecia depois de clicar. Aqui cada seção
 * resume, e o rodapé de cada painel abre a lista inteira num modal.
 *
 * A divisão de papéis é o que sustenta o resto: o dossiê é leitura e não tem
 * filtro nenhum; busca, filtro e escrita vivem no modal. Foi assim que os três
 * dialetos de filtro da tela — um por aba — viraram um só.
 */
export default function OperacaoDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const opId = Number(params.id);

   const { data: op, isLoading, error, refetch } = useOperacao(opId);
   const { data: etapas, isError: etapasErro } = useOperacaoEtapas(opId);
   const {
      data: pessoal,
      isLoading: pessoalCarregando,
      isError: pessoalErro,
      refetch: refetchPessoal,
   } = usePessoal(opId);
   const deleteMutation = useDeleteOperacao();
   const { push } = useToast();

   const [showEdit, setShowEdit] = useState(false);
   const [showAssociar, setShowAssociar] = useState(false);
   const [showDelete, setShowDelete] = useState(false);
   const [modal, setModal] = useState<
      "etapas" | "efetivo" | "sebo" | "esforco" | null
   >(null);

   async function handleDelete() {
      try {
         const res = await deleteMutation.mutateAsync(opId);
         push({
            title: res.ok ? "Excluída" : "Erro",
            message: res.message || "Operação excluída",
            type: res.ok ? "success" : "error",
         });
         if (res.ok) {
            router.push("/ops/operacoes");
         } else {
            setShowDelete(false);
         }
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: err instanceof Error ? err.message : "Erro ao excluir",
            type: "error",
         });
         setShowDelete(false);
      }
   }

   if (isLoading) {
      return <OperacaoDetailSkeleton />;
   }

   // 404 e falha de rede pedem saídas diferentes: recarregar não faz uma
   // operação excluída voltar a existir, então lá o retry não aparece.
   if (error || !op) {
      const naoExiste =
         error instanceof OperacaoFetchError && error.status === 404;
      return (
         <div
            role="alert"
            className="space-y-3 rounded border border-slate-200 bg-white px-4 py-12 text-center shadow-sm"
         >
            <p className="text-sm font-semibold text-slate-900">
               {naoExiste
                  ? "Operação não encontrada"
                  : "Não foi possível carregar a operação"}
            </p>
            <p className="mx-auto max-w-[52ch] text-sm text-slate-600">
               {naoExiste
                  ? "Ela não existe ou foi excluída. Se você chegou por um link antigo, ele não vale mais."
                  : "A requisição falhou. Verifique a conexão e tente novamente."}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
               {!naoExiste && (
                  <Button color="primary" size="sm" onClick={() => refetch()}>
                     Tentar novamente
                  </Button>
               )}
               <Button
                  color="light"
                  size="sm"
                  onClick={() => router.push("/ops/operacoes")}
               >
                  Ver todas as operações
               </Button>
            </div>
         </div>
      );
   }

   const listaEtapas = etapas ?? [];
   const listaPessoal = pessoal ?? [];
   const militares = agruparPessoal(listaPessoal);
   const totalMilitares = militares.length;

   return (
      <div className="space-y-2">
         {/* Teto de largura: sem ele as tabelas esticam com a janela e a linha
             do voo se parte em blocos distantes num monitor largo. As seções
             mantêm o `id` — o link direto para uma delas continua valendo. */}
         <div className="mx-auto max-w-[96rem]">
            <div className="space-y-4">
               <section id="identificacao" className="scroll-mt-2">
                  <OperacaoIdentificacao
                     op={op}
                     onEdit={() => setShowEdit(true)}
                     onDelete={() => setShowDelete(true)}
                  />
               </section>

               <section id="indicadores" className="scroll-mt-2 space-y-2">
                  <SecaoTitulo>Indicadores</SecaoTitulo>
                  <IndicadoresGrid
                     kpis={op.kpis}
                     efetivo={
                        pessoalCarregando || pessoalErro
                           ? undefined
                           : totalMilitares
                     }
                     circulos={
                        pessoalCarregando || pessoalErro
                           ? undefined
                           : contarPorCirculo(militares)
                     }
                  />
               </section>

               <section id="distribuicao" className="scroll-mt-2 space-y-2">
                  <SecaoTitulo apoio="de onde vieram as horas">
                     Distribuição
                  </SecaoTitulo>
                  {/* `items-start`: cada painel tem a altura do seu conteúdo.
                      Esticar para igualar as alturas parece mais arrumado numa
                      medição, mas quando um dos dois não tem rodapé (Esforço só
                      ganha "ver tudo" acima de 4 categorias) o que se iguala é
                      espaço vazio — 89px de branco sem nada que o justifique. */}
                  <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
                     <EsforcoResumo
                        esforco={op.esforco}
                        onVerTudo={() => setModal("esforco")}
                     />
                     <SeboResumo
                        sebo={op.sebo}
                        onVerTudo={() => setModal("sebo")}
                     />
                  </div>
               </section>

               {/* Etapas e Efetivo lado a lado: são as duas listas do dossiê
                   e se lêem em paralelo — quem voou e quem foi. Só a partir de
                   `2xl`: em 1280px as nove colunas de Etapas medem 583px numa
                   coluna de 512px, e a tabela ficava cortada. Abaixo disso as
                   duas seções empilham e cada uma usa a largura inteira. */}
               <div className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-2">
                  <section id="etapas" className="scroll-mt-2 space-y-2">
                     <SecaoTitulo
                        apoio={
                           listaEtapas.length > 0
                              ? `${listaEtapas.length} ${listaEtapas.length === 1 ? "voo" : "voos"}`
                              : undefined
                        }
                     >
                        Etapas
                     </SecaoTitulo>
                     {etapasErro ? (
                        <ErroBloco
                           mensagem="Não foi possível carregar as etapas."
                           onTentar={() => refetch()}
                        />
                     ) : (
                        <EtapasResumo
                           etapas={listaEtapas}
                           onVerTudo={() => setModal("etapas")}
                           onAssociar={() => setShowAssociar(true)}
                        />
                     )}
                  </section>

                  <section id="efetivo" className="scroll-mt-2 space-y-2">
                     <SecaoTitulo
                        apoio={
                           totalMilitares > 0
                              ? `${totalMilitares} ${totalMilitares === 1 ? "militar" : "militares"}`
                              : undefined
                        }
                     >
                        Efetivo
                     </SecaoTitulo>
                     <EfetivoResumo
                        op={op}
                        pessoal={listaPessoal}
                        carregando={pessoalCarregando}
                        erro={pessoalErro}
                        onRecarregar={() => refetchPessoal()}
                        onVerTudo={() => setModal("efetivo")}
                        onAssociar={() => setModal("efetivo")}
                     />
                  </section>
               </div>
            </div>
         </div>

         {/* Listas completas — a bancada de trabalho. */}
         <EtapasModal
            show={modal === "etapas"}
            onClose={() => setModal(null)}
            opId={op.id}
            opNome={op.nome}
            opInicio={op.data_inicio}
            opFim={op.data_fim}
            etapas={listaEtapas}
            onAssociar={() => setShowAssociar(true)}
         />
         <EfetivoModal
            show={modal === "efetivo"}
            onClose={() => setModal(null)}
            op={op}
         />
         <SeboModal
            show={modal === "sebo"}
            onClose={() => setModal(null)}
            opNome={op.nome}
            sebo={op.sebo}
         />
         <EsforcoModal
            show={modal === "esforco"}
            onClose={() => setModal(null)}
            opNome={op.nome}
            esforco={op.esforco}
         />

         <OperacaoFormModal
            show={showEdit}
            onClose={() => setShowEdit(false)}
            editing={op}
         />
         <AssociarEtapasModal
            show={showAssociar}
            onClose={() => setShowAssociar(false)}
            op={op}
         />
         <ConfirmDeleteModal
            show={showDelete}
            message={`Excluir a operação "${op.nome}"? Os registros de voo (etapas) serão preservados.`}
            isDeleting={deleteMutation.isPending}
            onClose={() => setShowDelete(false)}
            onConfirm={handleDelete}
         />
      </div>
   );
}

function SecaoTitulo({
   children,
   apoio,
}: {
   children: React.ReactNode;
   apoio?: string;
}) {
   return (
      <h2 className="flex items-baseline gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
         {children}
         {apoio && (
            <span className="font-sans text-xs font-normal tracking-normal normal-case">
               {apoio}
            </span>
         )}
         <span aria-hidden className="h-px flex-1 bg-slate-200" />
      </h2>
   );
}

function ErroBloco({
   mensagem,
   onTentar,
}: {
   mensagem: string;
   onTentar: () => void;
}) {
   return (
      <div
         role="alert"
         className="space-y-3 rounded border border-slate-200 bg-white p-6 text-center shadow-sm"
      >
         <p className="text-sm text-red-700">{mensagem}</p>
         <Button color="light" size="sm" className="mx-auto" onClick={onTentar}>
            Tentar novamente
         </Button>
      </div>
   );
}

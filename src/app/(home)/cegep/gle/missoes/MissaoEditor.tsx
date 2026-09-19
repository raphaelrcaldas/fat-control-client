"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, TextInput } from "flowbite-react";
import { HiPlus } from "react-icons/hi";

import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useToast } from "@/app/context/toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SectionWrapper } from "../../components/SectionWrapper";
import {
   useCreateMissaoGle,
   useDeleteMissaoGle,
   useLocalidades,
   useMissaoGle,
   useUpdateMissaoGle,
} from "@/hooks/queries/useGle";
import type { MissaoGle } from "services/routes/cegep/gleMissoes";

import { formatGleSaveError, gleFieldErrors } from "./gleErrors";
import { MilitaresPicker, type MilitarSel } from "./components/MilitaresPicker";
import { MissaoGleActionBar } from "./components/MissaoGleActionBar";
import { MissaoGleHeader } from "./components/MissaoGleHeader";
import { ResultadoGle } from "./components/ResultadoGle";
import { TrechoRow, type TrechoForm } from "./components/TrechoRow";
import { MissaoEditorSkeleton } from "./components/MissaoEditorSkeleton";
import { ValidationModal } from "./components/ValidationModal";

function novoTrecho(): TrechoForm {
   return {
      uid: crypto.randomUUID(),
      loc_esp_id: "",
      chegada: "",
      afastamento: "",
   };
}

/** "2026-04-26T14:15:00" -> "2026-04-26T14:15" (o que o input aceita). */
function paraInput(iso: string): string {
   return iso.slice(0, 16);
}

interface MissaoEditorProps {
   /** `null` = missão nova. */
   missaoId: number | null;
}

/**
 * Cria ou edita uma missão de GLE.
 *
 * O valor exibido vem **do backend**, que recalcula a partir dos trechos
 * salvos: a tela nunca guarda número apurado, para não divergir do soldo
 * vigente nem da classificação da localidade.
 */
export function MissaoEditor({ missaoId }: MissaoEditorProps) {
   const router = useRouter();
   const { push: pushToast } = useToast();
   const { hasPerm } = usePermBased();

   const ehNova = missaoId === null;
   const podeSalvar = hasPerm("cegep.gle", ehNova ? "create" : "update");

   const { data: missao, isLoading, isError, error } = useMissaoGle(missaoId);
   const { data: localidades } = useLocalidades(undefined);
   const criar = useCreateMissaoGle();
   const atualizar = useUpdateMissaoGle();
   const remover = useDeleteMissaoGle();

   const [descricao, setDescricao] = useState("");
   const [trechos, setTrechos] = useState<TrechoForm[]>([novoTrecho()]);
   const [militares, setMilitares] = useState<MilitarSel[]>([]);
   const [buscaMilitarAberta, setBuscaMilitarAberta] = useState(false);
   const [erros, setErros] = useState<Record<string, string>>({});
   const [validationErrors, setValidationErrors] = useState<string[]>([]);
   const [showValidationModal, setShowValidationModal] = useState(false);
   const [confirmarExclusao, setConfirmarExclusao] = useState(false);
   // Guarda o que veio do servidor para a apuração exibida corresponder ao
   // que está salvo, não ao formulário ainda não gravado.
   const [apurado, setApurado] = useState<MissaoGle | null>(null);

   useEffect(() => {
      if (!missao) return;
      setDescricao(missao.descricao);
      setTrechos(
         missao.trechos.length > 0
            ? missao.trechos.map((t) => ({
                 uid: crypto.randomUUID(),
                 loc_esp_id: String(t.loc_esp_id),
                 chegada: paraInput(t.chegada),
                 afastamento: paraInput(t.afastamento),
              }))
            : [novoTrecho()]
      );
      setMilitares(
         missao.militares.map((m) => ({
            id: m.user_id,
            p_g: m.p_g.toUpperCase(),
            nome_guerra: m.nome_guerra.toUpperCase(),
         }))
      );
      setApurado(missao);
   }, [missao]);

   function validar(): boolean {
      const novos: Record<string, string> = {};
      const resumo: string[] = [];

      if (!descricao.trim()) {
         novos.descricao = "Informe a descrição.";
         resumo.push(novos.descricao);
      }

      trechos.forEach((t, index) => {
         let erroTrecho: string | undefined;
         if (!t.loc_esp_id) {
            erroTrecho = "Escolha a localidade.";
         } else if (!t.chegada || !t.afastamento) {
            erroTrecho = "Informe chegada e afastamento.";
         } else if (t.afastamento <= t.chegada) {
            erroTrecho = "O afastamento deve ser depois da chegada.";
         }

         if (erroTrecho) {
            novos[t.uid] = erroTrecho;
            resumo.push(`Trecho ${index + 1}: ${erroTrecho}`);
         }
      });
      // O backend recusa missão sem militar (não há rascunho): avisar aqui
      // evita que o usuário descubra pelo 422 depois de preencher tudo.
      if (militares.length === 0) {
         novos.militares = "Selecione ao menos um militar.";
         resumo.push(novos.militares);
      }
      setErros(novos);

      const valido = Object.keys(novos).length === 0;
      setValidationErrors(resumo);
      setShowValidationModal(!valido);
      return valido;
   }

   function tratarErroDaMutation(err: unknown, fallback: string) {
      setErros(
         gleFieldErrors(
            err,
            trechos.map((trecho) => trecho.uid)
         )
      );
      pushToast({
         type: "error",
         message: formatGleSaveError(err, fallback),
      });
   }

   async function salvar() {
      if (!validar()) return;
      const body = {
         descricao: descricao.trim(),
         trechos: trechos.map((t) => ({
            loc_esp_id: Number(t.loc_esp_id),
            chegada: t.chegada,
            afastamento: t.afastamento,
         })),
         militares_ids: militares.map((m) => m.id),
      };

      try {
         if (ehNova) {
            const criada = await criar.mutateAsync(body);
            pushToast({ type: "success", message: "Missão criada." });
            router.replace(`/cegep/gle/missoes/${criada.id}`);
         } else {
            const salva = await atualizar.mutateAsync({
               id: missaoId,
               data: body,
            });
            setApurado(salva);
            pushToast({ type: "success", message: "Missão salva." });
         }
      } catch (e) {
         tratarErroDaMutation(e, "Erro ao salvar.");
      }
   }

   async function excluir() {
      if (ehNova) return;
      try {
         await remover.mutateAsync(missaoId);
         pushToast({ type: "success", message: "Missão removida." });
         router.replace("/cegep/gle?tab=missoes");
      } catch (e) {
         tratarErroDaMutation(e, "Erro ao remover.");
      }
   }

   const salvando = criar.isPending || atualizar.isPending;

   if (!ehNova && isLoading) return <MissaoEditorSkeleton />;

   if (!ehNova && isError) {
      return (
         <div className="space-y-2">
            <MissaoGleHeader title="Missão" backHref="/cegep/gle?tab=missoes" />
            <div
               className="rounded border border-slate-200 bg-white p-4 text-sm text-red-800 shadow-sm"
               role="alert"
            >
               {error instanceof Error
                  ? error.message
                  : "Missão não encontrada."}
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-2">
         <MissaoGleHeader
            title={ehNova ? "Nova missão" : descricao.trim() || "Missão"}
            backHref="/cegep/gle?tab=missoes"
            actions={
               <MissaoGleActionBar
                  isNew={ehNova}
                  isLoading={salvando}
                  onSave={salvar}
                  onDelete={() => setConfirmarExclusao(true)}
               />
            }
         />

         {!podeSalvar && (
            <p className="px-1 text-xs text-slate-500">
               Você não tem permissão para {ehNova ? "criar" : "editar"}{" "}
               missões.
            </p>
         )}

         <SectionWrapper title="Descrição">
            <Label htmlFor="missao-desc" className="sr-only">
               Descrição
            </Label>
            <TextInput
               id="missao-desc"
               value={descricao}
               onChange={(e) => setDescricao(e.target.value)}
               placeholder="OS 168-BAGL-26042026"
               sizing="sm"
               color={erros.descricao ? "failure" : undefined}
               disabled={!podeSalvar}
            />
            {erros.descricao && (
               <p className="mt-1 text-sm text-red-600" role="alert">
                  {erros.descricao}
               </p>
            )}
         </SectionWrapper>

         <SectionWrapper
            title="Trechos"
            action={
               podeSalvar && (
                  <button
                     type="button"
                     onClick={() => setTrechos((ts) => [...ts, novoTrecho()])}
                     className="group text-primary-600 hover:text-primary-700 flex items-center gap-1.5 text-sm font-semibold transition-all"
                  >
                     <HiPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                     Adicionar
                  </button>
               )
            }
         >
            <div className="space-y-2">
               {trechos.map((trecho) => (
                  <TrechoRow
                     key={trecho.uid}
                     trecho={trecho}
                     localidades={localidades ?? []}
                     erro={erros[trecho.uid]}
                     podeRemover={trechos.length > 1 && podeSalvar}
                     onChange={(patch) =>
                        setTrechos((ts) =>
                           ts.map((t) =>
                              t.uid === trecho.uid ? { ...t, ...patch } : t
                           )
                        )
                     }
                     onRemove={() =>
                        setTrechos((ts) =>
                           ts.filter((t) => t.uid !== trecho.uid)
                        )
                     }
                  />
               ))}
            </div>
            {erros.trechos && (
               <p className="mt-2 text-sm text-red-600" role="alert">
                  {erros.trechos}
               </p>
            )}
         </SectionWrapper>

         <SectionWrapper
            title="Militares"
            action={
               podeSalvar && (
                  <Button
                     type="button"
                     color="light"
                     size="xs"
                     onClick={() => setBuscaMilitarAberta(true)}
                     disabled={buscaMilitarAberta}
                     aria-label="Adicionar militar"
                     aria-expanded={buscaMilitarAberta}
                     aria-haspopup="dialog"
                     className="text-primary-600 hover:text-primary-700 h-[24px] px-2"
                  >
                     <HiPlus className="h-4 w-4 sm:mr-1.5" />
                     <span>Adicionar</span>
                  </Button>
               )
            }
         >
            <MilitaresPicker
               selecionados={militares}
               onChange={setMilitares}
               buscaAberta={buscaMilitarAberta}
               onBuscaAbertaChange={setBuscaMilitarAberta}
               podeSalvar={podeSalvar}
            />
            {erros.militares && (
               <p className="mt-1 text-sm text-red-600" role="alert">
                  {erros.militares}
               </p>
            )}
         </SectionWrapper>

         {apurado && !ehNova && (
            <>
               <h2 className="px-1 pt-2 text-sm font-semibold text-slate-700">
                  Apuração salva
               </h2>
               <ResultadoGle calculo={apurado} />
            </>
         )}

         <ValidationModal
            show={showValidationModal}
            errors={validationErrors}
            onClose={() => setShowValidationModal(false)}
         />

         <ConfirmModal
            show={confirmarExclusao}
            onClose={() => setConfirmarExclusao(false)}
            onConfirm={excluir}
            isLoading={remover.isPending}
            title="Remover missão"
            description={`A missão "${descricao}" e todos os seus trechos e militares serão removidos. Esta ação não pode ser desfeita.`}
            confirmButtonText="Remover"
         />
      </div>
   );
}

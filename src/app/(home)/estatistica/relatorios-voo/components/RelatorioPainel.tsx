"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import {
   HiExternalLink,
   HiDownload,
   HiTrash,
   HiDocumentText,
} from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import {
   useArquivoRelatorio,
   useAtualizarObservacao,
   useExcluirRelatorio,
} from "@/hooks/queries/useRelatoriosVoo";
import {
   urlDoArquivo,
   type RelatorioVoo,
} from "services/routes/estatistica/relatoriosVoo";
import {
   formatDateFull,
   formatDiaSemana,
   formatTimeUTC,
} from "utils/dateHandler";
import { ExcluirRelatorioModal } from "./ExcluirRelatorioModal";
import { formatarTamanho } from "../utils/relatorios";

interface Props {
   relatorio: RelatorioVoo;
   onExcluido: () => void;
   /**
    * No Drawer mobile o pai já rola (`overflow-y-auto`) e não tem altura
    * própria para repartir entre cabeçalho/prévia/rodapé: aqui a seção não
    * pode travar `overflow-hidden`/`min-h-0`, senão o rodapé (observação)
    * fica cortado sem nenhuma forma de alcançá-lo. No desktop (`compacto`
    * ausente) o painel continua fixo, com `min-h-0 overflow-hidden` e a
    * lista rolando sozinha ao lado.
    */
   compacto?: boolean;
   /**
    * Avisa a página quando o modal de confirmação de exclusão abre/fecha,
    * para o Drawer (que também escuta Escape) ignorar o próprio `onClose`
    * enquanto a confirmação estiver aberta por cima dele.
    */
   onConfirmacaoChange?: (aberta: boolean) => void;
}

export function RelatorioPainel({
   relatorio,
   onExcluido,
   compacto = false,
   onConfirmacaoChange,
}: Props) {
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const podeEditar = hasPerm("estatistica.relatorios_voo", "update");
   const podeExcluir = hasPerm("estatistica.relatorios_voo", "delete");

   const arquivo = useArquivoRelatorio(relatorio.id);
   const salvarObs = useAtualizarObservacao();
   const excluir = useExcluirRelatorio();
   const [obs, setObs] = useState(relatorio.obs ?? "");
   const [confirmar, setConfirmar] = useState(false);
   // Último valor que `salvar()` já mandou (ou está mandando) para a API —
   // não basta comparar com `relatorio.obs`, porque ele só atualiza quando a
   // mutation resolve e a query invalida. Um Enter duplo em rápida sucessão
   // (ex.: 3ms de intervalo) chama `salvar()` de novo ANTES da resposta
   // chegar: `salvarObs.isPending` ainda não é `true` no primeiro render
   // síncrono e `relatorio.obs` ainda é o valor antigo, então as duas
   // guardas abaixo sozinhas deixavam passar 2 PATCHes do mesmo valor.
   const ultimoEnviado = useRef<string | null>(relatorio.obs ?? null);

   useEffect(() => setObs(relatorio.obs ?? ""), [relatorio.id, relatorio.obs]);
   useEffect(() => {
      ultimoEnviado.current = relatorio.obs ?? null;
   }, [relatorio.id, relatorio.obs]);

   useEffect(() => {
      onConfirmacaoChange?.(confirmar);
      // Se o painel desmontar (exclusão concluída fecha o Drawer no mesmo
      // commit de `setConfirmar(false)`), o efeito com `false` nunca chega a
      // rodar de novo — o cleanup garante que a página seja avisada mesmo
      // assim, evitando que a flag fique presa em `true`.
      return () => onConfirmacaoChange?.(false);
   }, [confirmar, onConfirmacaoChange]);

   // Enter na Observação chama `salvar()` e depois derruba o foco (o campo
   // fica `disabled` enquanto o PATCH está em voo); o `blur` resultante
   // dispara o `onBlur`, que chamaria `salvar()` de novo. Duas guardas:
   // ignora se já houver um PATCH em voo (`salvarObs.isPending`), e ignora
   // se o valor já é o último que foi enviado ou está sendo enviado agora
   // (`ultimoEnviado`, não `relatorio.obs`: um segundo Enter a poucos
   // milissegundos do primeiro chega antes da mutation resolver, quando
   // `isPending` ainda não virou `true` no primeiro render síncrono e
   // `relatorio.obs` ainda reflete o valor antigo — só a ref, atualizada
   // antes do `await`, cobre essa corrida).
   const salvar = async () => {
      if (salvarObs.isPending) return;
      const valor = obs.trim() || null;
      if (valor === ultimoEnviado.current) return;
      ultimoEnviado.current = valor;
      try {
         await salvarObs.mutateAsync({ id: relatorio.id, obs: valor });
         push({ message: "Observação salva", type: "success" });
      } catch (e) {
         ultimoEnviado.current = relatorio.obs ?? null;
         push({ title: "Erro", message: (e as Error).message, type: "error" });
      }
   };

   const baixar = async () => {
      try {
         window.location.href = await urlDoArquivo(relatorio.id, "attachment");
      } catch (e) {
         push({ title: "Erro", message: (e as Error).message, type: "error" });
      }
   };

   const confirmarExclusao = async () => {
      try {
         await excluir.mutateAsync(relatorio.id);
         push({ message: "Relatório excluído", type: "success" });
         setConfirmar(false);
         onExcluido();
      } catch (e) {
         push({ title: "Erro", message: (e as Error).message, type: "error" });
      }
   };

   return (
      <section
         aria-label={compacto ? undefined : "Relatório selecionado"}
         className={clsx(
            "flex flex-col rounded border border-slate-200 bg-white shadow-sm",
            compacto ? "min-h-full" : "min-h-0 overflow-hidden"
         )}
      >
         <div
            className={clsx(
               "flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3",
               // No compacto o título mora na barra do Drawer (h2 lá,
               // `aria-labelledby`); repeti-lo aqui duplicaria o heading.
               // A linha de ações permanece, alinhada à direita.
               compacto ? "justify-end" : "justify-between"
            )}
         >
            {!compacto && (
               <div className="flex items-baseline gap-2.5">
                  <h2 className="text-lg font-extrabold text-slate-900">
                     <span className="font-mono">{relatorio.anv}</span> ·{" "}
                     {formatDiaSemana(relatorio.data)}
                  </h2>
                  {relatorio.seq > 1 && (
                     <Badge color="info">{relatorio.seq}º do dia</Badge>
                  )}
               </div>
            )}
            <div className="flex items-center gap-1.5">
               {/* No compacto o cartão abaixo já tem "Abrir PDF" como ação
                   principal com o mesmo `href` — só "Abrir em nova aba" sai
                   da barra; "Baixar" continua aqui (não tem equivalente no
                   cartão). */}
               {!compacto && (
                  <Button
                     as="a"
                     color="light"
                     size="xs"
                     href={arquivo.data}
                     target="_blank"
                     rel="noopener noreferrer"
                     aria-disabled={!arquivo.data}
                     aria-label="Abrir em nova aba"
                     title="Abrir em nova aba"
                     className={
                        !arquivo.data
                           ? "pointer-events-none opacity-50"
                           : undefined
                     }
                  >
                     <HiExternalLink className="h-4 w-4 xl:mr-1.5" />
                     {/* Entre `lg` e `xl` a prévia ficava espremida com o
                         cabeçalho quebrando em 2 linhas (86px contra 50 a
                         partir de 1100) — o texto só some nessa faixa. */}
                     <span className="hidden xl:inline">Abrir em nova aba</span>
                  </Button>
               )}
               <Button
                  color="light"
                  size="xs"
                  onClick={baixar}
                  aria-label="Baixar"
                  title="Baixar"
               >
                  <HiDownload
                     className={clsx("h-4 w-4", !compacto && "xl:mr-1.5")}
                  />
                  {!compacto && (
                     <span className="hidden xl:inline">Baixar</span>
                  )}
               </Button>
               {podeExcluir && (
                  <button
                     type="button"
                     aria-label="Excluir relatório"
                     title="Excluir relatório"
                     onClick={() => setConfirmar(true)}
                     className="grid min-h-[24px] min-w-[24px] shrink-0 place-items-center rounded text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                     <HiTrash className="h-4 w-4" />
                  </button>
               )}
            </div>
         </div>

         <div
            className={clsx(
               "bg-slate-100",
               compacto
                  ? "flex min-h-[200px] items-center justify-center"
                  : "min-h-[240px] flex-1"
            )}
         >
            {arquivo.isLoading ? (
               compacto ? (
                  <Spinner color="primary" size="lg" />
               ) : (
                  <div className="grid h-full place-items-center">
                     <Spinner color="primary" size="lg" />
                  </div>
               )
            ) : arquivo.isError || !arquivo.data ? (
               <p className="p-6 text-center text-sm text-red-700">
                  Não foi possível abrir o PDF.
               </p>
            ) : compacto ? (
               <div className="flex w-full flex-col items-center gap-3 p-6 text-center">
                  <span className="bg-primary-50 text-primary-600 ring-primary-100 grid h-14 w-14 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <HiDocumentText className="h-7 w-7" />
                  </span>
                  <p className="text-sm text-slate-600">
                     {relatorio.num_paginas
                        ? `${relatorio.num_paginas} ${relatorio.num_paginas === 1 ? "página" : "páginas"} · `
                        : ""}
                     {formatarTamanho(relatorio.file_size)}
                  </p>
                  <Button
                     as="a"
                     color="primary"
                     size="lg"
                     href={arquivo.data}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full max-w-xs"
                  >
                     <HiExternalLink className="mr-2 h-4 w-4" />
                     Abrir PDF
                  </Button>
               </div>
            ) : (
               // Sem anel de foco próprio: o foco por Tab entra no
               // visualizador de PDF do Chrome dentro do iframe e não
               // borbulha ao documento pai — nem `:focus-within` nem
               // `focusin` no wrapper chegam a disparar. O indicador visual
               // é a própria moldura do visualizador do Chrome. Decisão
               // registrada em `docs/ai/notes/ui-ux.md`.
               <iframe
                  title={`Relatório ${relatorio.anv} ${relatorio.data}`}
                  src={`${arquivo.data}#navpanes=0&view=FitH`}
                  className="h-full w-full"
               />
            )}
         </div>

         <div className="flex shrink-0 flex-wrap gap-4 border-t border-slate-200 px-4 py-3 text-xs">
            <span className="flex min-w-0 flex-col">
               <span className="text-[11px] text-slate-500">Tamanho</span>
               <span className="truncate font-semibold text-slate-800">
                  {formatarTamanho(relatorio.file_size)}
                  {relatorio.num_paginas
                     ? ` · ${relatorio.num_paginas} pág.`
                     : ""}
               </span>
            </span>
            <span className="flex min-w-0 flex-col">
               <span className="text-[11px] text-slate-500">Enviado por</span>
               <span
                  title={`${relatorio.uploaded_by_p_g} ${relatorio.uploaded_by_nome_guerra}`}
                  className="truncate font-semibold text-slate-800 uppercase"
               >
                  {relatorio.uploaded_by_p_g}{" "}
                  {relatorio.uploaded_by_nome_guerra}
               </span>
            </span>
            <span className="flex min-w-0 flex-col">
               <span className="text-[11px] text-slate-500">Enviado em</span>
               <span
                  title={`${formatDateFull(relatorio.created_at)} ${formatTimeUTC(relatorio.created_at)}Z`}
                  className="truncate font-semibold text-slate-800"
               >
                  {formatDateFull(relatorio.created_at)}{" "}
                  {formatTimeUTC(relatorio.created_at)}Z
               </span>
            </span>
            <span className="flex min-w-0 flex-col">
               <span className="text-[11px] text-slate-500">Arquivo</span>
               <span
                  title={relatorio.file_path}
                  className="truncate font-mono text-[11px] text-slate-700"
               >
                  {relatorio.file_path.split("/").pop()}
               </span>
            </span>
            <label className="flex min-w-0 grow basis-[220px] flex-col gap-0.5 text-[11px] text-slate-500">
               Observação
               <TextInput
                  sizing="sm"
                  value={obs}
                  maxLength={500}
                  disabled={!podeEditar}
                  // `readOnly` durante o PATCH, não `disabled`: um campo
                  // `disabled` perde o foco (Enter dispara `salvar()`, o
                  // campo trava e o foco cai no BODY), e o `blur`
                  // resultante disparava um segundo PATCH pelo `onBlur`.
                  // `readOnly` impede a edição sem tirar o foco do campo.
                  readOnly={salvarObs.isPending}
                  onChange={(e) => setObs(e.target.value)}
                  onBlur={salvar}
                  onKeyDown={(e) => e.key === "Enter" && salvar()}
               />
            </label>
         </div>

         <ExcluirRelatorioModal
            relatorio={relatorio}
            aberto={confirmar}
            excluindo={excluir.isPending}
            onFechar={() => setConfirmar(false)}
            onConfirmar={confirmarExclusao}
         />
      </section>
   );
}

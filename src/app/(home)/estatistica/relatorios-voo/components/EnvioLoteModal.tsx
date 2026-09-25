"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   TextInput,
} from "flowbite-react";
import { HiUpload, HiX, HiInformationCircle } from "react-icons/hi";
import { ApiError } from "services/Api";
import { formatDiaSemana, todayIso } from "utils/dateHandler";
import {
   useEnviarRelatorio,
   useInvalidarRelatoriosVoo,
} from "@/hooks/queries/useRelatoriosVoo";
import { executarComLimite, formatarTamanho } from "../utils/relatorios";

const LIMITE_BYTES = 10 * 1024 * 1024;
const SIMULTANEOS = 2;

type Estado =
   | "pronto"
   | "incompleto"
   | "invalido"
   | "enviando"
   | "enviado"
   | "recusado"
   | "falhou";

interface Linha {
   chave: string;
   file: File;
   anv: string;
   data: string;
   estado: Estado;
   mensagem: string;
   nomeFinal?: string;
}

function avaliar(l: Linha): Linha {
   if (!l.file.name.toLowerCase().endsWith(".pdf"))
      return { ...l, estado: "invalido", mensagem: "Só PDF é aceito" };
   if (l.file.size > LIMITE_BYTES)
      return { ...l, estado: "invalido", mensagem: "Maior que 10 MB" };
   if (!l.anv || !l.data)
      return {
         ...l,
         estado: "incompleto",
         mensagem: "Falta aeronave ou dia",
      };
   if (l.data > todayIso())
      return { ...l, estado: "incompleto", mensagem: "Dia no futuro" };
   return { ...l, estado: "pronto", mensagem: "Pronto" };
}

const COR: Record<Estado, string> = {
   pronto: "text-green-700",
   incompleto: "text-amber-700",
   invalido: "text-red-700",
   enviando: "text-slate-500",
   enviado: "text-green-700",
   recusado: "text-red-700",
   falhou: "text-red-700",
};

interface Props {
   aberto: boolean;
   onFechar: () => void;
   frota: string[];
}

export function EnvioLoteModal({ aberto, onFechar, frota }: Props) {
   const [linhas, setLinhas] = useState<Linha[]>([]);
   const [enviando, setEnviando] = useState(false);
   const input = useRef<HTMLInputElement>(null);
   const enviar = useEnviarRelatorio();
   const invalidar = useInvalidarRelatoriosVoo();

   // Soltar um PDF fora da área tracejada (linhas, rodapé, fundo escuro)
   // faria o Chrome abrir o arquivo na própria aba e perder o lote. Enquanto
   // o modal está aberto, cancela o padrão no `window`. O `onDrop` da área
   // roda antes, na bolha, e é quem adiciona os arquivos; este só faz
   // `preventDefault`.
   useEffect(() => {
      if (!aberto) return;
      const bloquear = (e: DragEvent) => e.preventDefault();
      window.addEventListener("dragover", bloquear);
      window.addEventListener("drop", bloquear);
      return () => {
         window.removeEventListener("dragover", bloquear);
         window.removeEventListener("drop", bloquear);
      };
   }, [aberto]);

   const atualizar = (chave: string, mudanca: Partial<Linha>) =>
      setLinhas((ls) =>
         ls.map((l) => (l.chave === chave ? { ...l, ...mudanca } : l))
      );

   const adicionar = (files: FileList | null) => {
      if (!files) return;
      const novas = Array.from(files).map((file, i) =>
         avaliar({
            chave: `${file.name}-${file.size}-${Date.now()}-${i}`,
            file,
            anv: "",
            data: "",
            estado: "incompleto",
            mensagem: "",
         })
      );
      setLinhas((ls) => [...ls, ...novas]);
      if (input.current) input.current.value = "";
   };

   const editar = (chave: string, campo: "anv" | "data", valor: string) =>
      setLinhas((ls) =>
         ls.map((l) =>
            l.chave === chave ? avaliar({ ...l, [campo]: valor }) : l
         )
      );

   const prontas = linhas.filter(
      (l) => l.estado === "pronto" || l.estado === "falhou"
   );

   const enviarTodas = async () => {
      setEnviando(true);
      await executarComLimite(prontas, SIMULTANEOS, async (l) => {
         atualizar(l.chave, { estado: "enviando", mensagem: "Enviando…" });
         try {
            const r = await enviar.mutateAsync({
               file: l.file,
               anv: l.anv,
               data: l.data,
            });
            atualizar(l.chave, {
               estado: "enviado",
               mensagem: r.seq > 1 ? `Enviado · ${r.seq}º do dia` : "Enviado",
               nomeFinal: r.file_path.split("/").pop(),
            });
         } catch (e) {
            const erro = e as ApiError;
            const existente = erro.errors as {
               anv?: string;
               data?: string;
            } | null;
            // Transitória (sem status — erro de rede/timeout — ou 5xx): a
            // máquina da API tem 512 MB e roda Ghostscript por envio, um
            // 5xx ocasional é esperado. Qualquer outro status é recusa
            // definitiva do servidor — 400 (PDF inválido, maior que 10 MB,
            // aeronave fora da frota), 403 (sem permissão), 409 (duplicado),
            // 422 (dia futuro) — e a linha não pode ser reenviada sem mudar
            // o arquivo, a aeronave ou o dia.
            const transitoria = erro.status == null || erro.status >= 500;
            if (transitoria) {
               atualizar(l.chave, {
                  estado: "falhou",
                  mensagem: "Falhou — tente de novo",
               });
            } else {
               atualizar(l.chave, {
                  estado: "recusado",
                  mensagem:
                     erro.status === 409 && existente?.anv && existente?.data
                        ? `Já enviado como ${existente.anv} · ${formatDiaSemana(existente.data)}`
                        : erro.message,
               });
            }
         }
      });
      setEnviando(false);
      invalidar();
   };

   const fechar = () => {
      if (enviando) return;
      setLinhas([]);
      onFechar();
   };

   return (
      <Modal
         show={aberto}
         size="5xl"
         dismissible={linhas.length === 0 && !enviando}
         onClose={fechar}
      >
         <ModalHeader>Enviar relatórios</ModalHeader>
         <ModalBody className="space-y-3">
            <p className="text-sm text-slate-500">
               Cada arquivo precisa da aeronave e do dia do voo. O nome no
               arquivo é gerado a partir deles.
            </p>
            <input
               ref={input}
               type="file"
               accept="application/pdf,.pdf"
               multiple
               className="hidden"
               aria-label="Escolher PDFs"
               onChange={(e) => adicionar(e.target.files)}
            />
            <button
               type="button"
               aria-disabled={enviando}
               onClick={() => {
                  if (!enviando) input.current?.click();
               }}
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                  e.preventDefault();
                  if (!enviando) adicionar(e.dataTransfer.files);
               }}
               className="border-primary-300 bg-primary-50 text-primary-700 flex min-h-20 w-full flex-col items-center justify-center gap-1.5 rounded border-2 border-dashed p-3 text-center text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50 sm:flex-row sm:gap-3 sm:p-0 sm:text-left"
            >
               <HiUpload className="h-5 w-5 shrink-0" />
               <span>
                  <span className="pointer-coarse:hidden">
                     <strong>Arraste os PDFs escaneados</strong> ou clique para
                     escolher · até 10 MB cada
                  </span>
                  <span className="hidden pointer-coarse:inline">
                     <strong>Toque para escolher os PDFs</strong> escaneados ·
                     até 10 MB cada
                  </span>
               </span>
            </button>

            {linhas.map((l) => {
               // Trava a linha durante o lote inteiro, não só a partir do
               // instante em que um trabalhador a pega: `prontas` é um
               // retrato tirado no clique de "Enviar", então uma linha ainda
               // na fila (estado "pronto") não pode ser editada nem removida
               // enquanto `enviarTodas` roda, ou o envio parte de um valor
               // diferente do exibido.
               const bloqueado = enviando || l.estado === "enviado";
               const invalido = l.estado === "invalido";
               return (
                  <div
                     key={l.chave}
                     className="space-y-2 border-t border-slate-100 py-2 text-xs lg:grid lg:grid-cols-[minmax(160px,1fr)_110px_150px_minmax(0,160px)_minmax(120px,180px)] lg:items-center lg:gap-2.5 lg:space-y-0"
                  >
                     <div className="flex items-center gap-2">
                        <span className="flex min-w-0 flex-1 flex-col">
                           <span
                              title={l.file.name}
                              className="truncate font-semibold"
                           >
                              {l.file.name}
                           </span>
                           <span className="text-[11px] text-slate-500">
                              {formatarTamanho(l.file.size)}
                           </span>
                        </span>
                        <button
                           type="button"
                           aria-label="Remover do lote"
                           disabled={bloqueado}
                           onClick={() =>
                              setLinhas((ls) =>
                                 ls.filter((x) => x.chave !== l.chave)
                              )
                           }
                           className="hidden size-[24px] shrink-0 place-items-center rounded text-slate-500 hover:bg-slate-100 lg:grid"
                        >
                           <HiX className="h-4 w-4" />
                        </button>
                     </div>
                     <div className="grid grid-cols-2 gap-2 lg:contents">
                        <Select
                           sizing="sm"
                           aria-label={`Aeronave de ${l.file.name}`}
                           value={l.anv}
                           disabled={bloqueado || invalido}
                           onChange={(e) =>
                              editar(l.chave, "anv", e.target.value)
                           }
                        >
                           <option value="">Selecione</option>
                           {frota.map((a) => (
                              <option key={a} value={a}>
                                 {a}
                              </option>
                           ))}
                        </Select>
                        <TextInput
                           sizing="sm"
                           type="date"
                           aria-label={`Dia do voo de ${l.file.name}`}
                           max={todayIso()}
                           value={l.data}
                           disabled={bloqueado || invalido}
                           onChange={(e) =>
                              editar(l.chave, "data", e.target.value)
                           }
                        />
                     </div>
                     <span
                        title={l.nomeFinal}
                        className={clsx(
                           "hidden truncate font-mono text-[11.5px] lg:inline",
                           l.nomeFinal ? "text-slate-700" : "text-slate-400"
                        )}
                     >
                        {l.nomeFinal ?? "definido no envio"}
                     </span>
                     <div className="flex items-center justify-between gap-2">
                        <span
                           title={`${l.mensagem}${l.nomeFinal ? ` · ${l.nomeFinal}` : ""}`}
                           className={clsx(
                              "truncate font-semibold",
                              COR[l.estado]
                           )}
                        >
                           {l.mensagem}
                           {l.nomeFinal ? (
                              <span className="ml-1 font-mono text-[11px] font-normal text-slate-500 lg:hidden">
                                 · {l.nomeFinal}
                              </span>
                           ) : null}
                        </span>
                        <button
                           type="button"
                           aria-label="Remover do lote"
                           disabled={bloqueado}
                           onClick={() =>
                              setLinhas((ls) =>
                                 ls.filter((x) => x.chave !== l.chave)
                              )
                           }
                           className="grid size-[24px] shrink-0 place-items-center rounded text-slate-500 hover:bg-slate-100 lg:hidden"
                        >
                           <HiX className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               );
            })}

            <div className="bg-primary-50 text-primary-800 flex items-start gap-2 rounded px-3 py-2.5 text-xs">
               <HiInformationCircle className="mt-0.5 h-4 w-4 shrink-0" />
               Aeronave e dia não mudam depois de enviados. Se errar, exclua o
               relatório e envie de novo.
            </div>
         </ModalBody>
         <ModalFooter className="justify-between">
            <span className="text-xs text-slate-600">
               <strong>{prontas.length}</strong> de {linhas.length} prontos para
               envio
            </span>
            <div className="flex gap-2">
               <Button color="light" onClick={fechar} disabled={enviando}>
                  Fechar
               </Button>
               <Button
                  color="primary"
                  onClick={enviarTodas}
                  disabled={enviando || prontas.length === 0}
               >
                  {enviando
                     ? "Enviando…"
                     : prontas.length > 0 &&
                         prontas.every((l) => l.estado === "falhou")
                       ? `Reenviar ${prontas.length}`
                       : `Enviar ${prontas.length}`}
               </Button>
            </div>
         </ModalFooter>
      </Modal>
   );
}

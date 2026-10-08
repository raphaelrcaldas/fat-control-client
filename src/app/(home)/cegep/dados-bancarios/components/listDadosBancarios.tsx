import { useMemo, useState } from "react";
import clsx from "clsx";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { HiPencil } from "react-icons/hi";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import {
   dateToIso,
   formatDateFull,
   formatMesAno,
} from "@/../utils/dateHandler";
import DetailDadosBancarios from "./detailDadosBancarios";
import { SortableHeadCell, type SortDirection } from "./SortableHeadCell";

/** Dia da última gravação no fuso local; sem edição, o do cadastro. Direto em
 *  `formatDateFull` o datetime sai em UTC: gravar às 22h mostrava o dia seguinte. */
function ultimaGravacao(dado: DadosBancariosWithUser): string {
   const iso = dado.updated_at ?? dado.created_at;
   return iso ? formatDateFull(dateToIso(new Date(iso))) : "—";
}

/**
 * Compartilhado com o skeleton (zero shift). Padding lateral menor que o
 * `px-6` do tema (21px × 2 × 9 colunas): com ele a tabela estourava 108px a
 * 1280. O tema do projeto não separa as linhas — a régua vem do `divide-y`.
 */
export const TABELA_DADOS_BANCARIOS_THEME = {
   head: {
      base: "text-slate-500",
      cell: {
         base: "border-b border-slate-200 bg-slate-50 px-3 font-semibold 2xl:px-5",
      },
   },
   body: {
      base: "divide-y divide-slate-100",
      cell: { base: "px-3 2xl:px-5" },
   },
   row: { base: "border-slate-100", hovered: "hover:bg-slate-50" },
};

/** Ausência de valor recua: não compete com os dados da linha. */
const Vazio = () => <span className="text-slate-400">—</span>;

const FORMATO_BRL = new Intl.NumberFormat("pt-BR", {
   style: "currency",
   currency: "BRL",
});

/** Moeda com o "R$" esmaecido: o olho corre só pelos números alinhados. */
function Moeda({ valor, forte }: { valor: number | null; forte?: boolean }) {
   if (valor == null) return <Vazio />;
   const partes = FORMATO_BRL.formatToParts(valor);
   const simbolo = partes.find((p) => p.type === "currency")?.value;
   const numero = partes
      .filter((p) => p.type !== "currency" && p.type !== "literal")
      .map((p) => p.value)
      .join("");
   return (
      <>
         <span className="mr-1 text-xs text-slate-500">{simbolo}</span>
         <span
            className={
               forte ? "font-semibold text-slate-900" : "text-slate-700"
            }
         >
            {numero}
         </span>
      </>
   );
}

type SortField = "militar" | "mes_ano" | "atualizado";

/** Datas começam pela mais recente; militar, pelo mais antigo. */
const DIRECAO_INICIAL: Record<SortField, SortDirection> = {
   militar: "asc",
   mes_ano: "desc",
   atualizado: "desc",
};

/** Chave de data da coluna; `null` (sem valor) vai sempre para o fim. */
function chaveData(dado: DadosBancariosWithUser, field: SortField) {
   if (field === "mes_ano") return dado.mes_ano;
   const iso = dado.updated_at ?? dado.created_at;
   return iso ? new Date(iso).toISOString() : null;
}

/**
 * A API já entrega por antiguidade (`sortByAntiguidade` no hook), então
 * "militar" é a ordem recebida ou a inversa. As datas usam sort estável: no
 * empate, mantém a antiguidade.
 */
function ordenar(
   dados: DadosBancariosWithUser[],
   field: SortField,
   direction: SortDirection
) {
   if (field === "militar") {
      return direction === "asc" ? dados : [...dados].reverse();
   }
   const sinal = direction === "asc" ? 1 : -1;
   return [...dados].sort((a, b) => {
      const ka = chaveData(a, field);
      const kb = chaveData(b, field);
      if (ka === kb) return 0;
      if (ka === null) return 1;
      if (kb === null) return -1;
      return ka.localeCompare(kb) * sinal;
   });
}

interface ListDadosBancariosProps {
   dados: DadosBancariosWithUser[];
}

export default function ListDadosBancarios({ dados }: ListDadosBancariosProps) {
   const [selectedDados, setSelectedDados] =
      useState<DadosBancariosWithUser | null>(null);
   const [showDetail, setShowDetail] = useState(false);
   const [sort, setSort] = useState<{
      field: SortField;
      direction: SortDirection;
   }>({ field: "militar", direction: "asc" });

   const ordenados = useMemo(
      () => ordenar(dados, sort.field, sort.direction),
      [dados, sort]
   );

   const handleSort = (field: SortField) =>
      setSort((prev) =>
         prev.field === field
            ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
            : { field, direction: DIRECAO_INICIAL[field] }
      );

   const headProps = (field: SortField) => ({
      active: sort.field === field,
      direction: sort.direction,
      onSort: () => handleSort(field),
   });

   const handleRowClick = (dado: DadosBancariosWithUser) => {
      setSelectedDados(dado);
      setShowDetail(true);
   };

   const handleClose = () => {
      setShowDetail(false);
      setSelectedDados(null);
   };

   return (
      <>
         <div
            role="region"
            aria-label="Tabela de dados bancários"
            tabIndex={0}
            className="overflow-x-auto rounded border border-slate-200 shadow-sm"
         >
            {/* Linha de altura única: só "Nome completo" é elástica e trunca
                (valor inteiro no title); as demais não quebram. */}
            <Table
               hoverable
               className="whitespace-nowrap"
               theme={TABELA_DADOS_BANCARIOS_THEME}
            >
               <TableHead>
                  <TableRow>
                     <SortableHeadCell
                        label="Militar"
                        {...headProps("militar")}
                     />
                     <TableHeadCell className="min-w-[140px]">
                        Nome Completo
                     </TableHeadCell>
                     <TableHeadCell>Banco</TableHeadCell>
                     <TableHeadCell>Agência</TableHeadCell>
                     <TableHeadCell>Conta</TableHeadCell>
                     <TableHeadCell className="text-right">
                        Remuneração
                     </TableHeadCell>
                     <SortableHeadCell
                        label="Mês/Ano"
                        align="center"
                        {...headProps("mes_ano")}
                     />
                     <TableHeadCell className="text-right">
                        Aux. Transp.
                     </TableHeadCell>
                     <SortableHeadCell
                        label="Atualizado em"
                        align="center"
                        {...headProps("atualizado")}
                     />
                  </TableRow>
               </TableHead>
               <TableBody>
                  {ordenados.map((dado) => (
                     <TableRow
                        key={dado.id}
                        onClick={() => handleRowClick(dado)}
                        className={clsx(
                           "cursor-pointer",
                           // A linha em edição fica marcada atrás do modal.
                           selectedDados?.id === dado.id
                              ? "bg-primary-50"
                              : "bg-white"
                        )}
                     >
                        <TableCell className="w-px">
                           {/* Alvo de teclado da linha: o clique na linha
                               inteira continua, mas sem este botão a edição
                               era inalcançável por Tab. */}
                           <button
                              type="button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleRowClick(dado);
                              }}
                              className="group/mil focus-visible:ring-primary-600 min-h-[24px] rounded text-left uppercase focus-visible:ring-2 focus-visible:outline-none"
                           >
                              <span className="font-medium text-slate-500">
                                 {dado.user.posto.short}
                              </span>{" "}
                              <span className="group-hover/mil:text-primary-700 font-semibold text-slate-900 underline-offset-2 group-hover/mil:underline">
                                 {dado.user.nome_guerra}
                              </span>
                           </button>
                        </TableCell>
                        {/* Piso de 140px: sem ele a coluna colapsava em
                            ~90px ("JOYCE DE SO…"); min-width vence max-w-0. */}
                        <TableCell className="w-full max-w-0 min-w-[140px] text-slate-600 uppercase">
                           <span
                              className="block truncate"
                              title={dado.user.nome_completo}
                           >
                              {dado.user.nome_completo}
                           </span>
                        </TableCell>
                        {/* Código antes do nome: os códigos formam uma coluna
                            alinhada e o nome do banco fica legível sozinho. */}
                        <TableCell>
                           <span className="inline-flex items-baseline gap-2">
                              <span className="w-7 text-xs text-slate-500 tabular-nums">
                                 {dado.codigo_banco}
                              </span>
                              <span className="text-slate-700">
                                 {dado.banco}
                              </span>
                           </span>
                        </TableCell>
                        <TableCell className="text-slate-700 tabular-nums">
                           {dado.agencia}
                        </TableCell>
                        <TableCell className="text-slate-700 tabular-nums">
                           {dado.conta}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                           <Moeda valor={dado.remuneracao} forte />
                        </TableCell>
                        <TableCell className="text-center text-slate-600 tabular-nums">
                           {dado.mes_ano ? (
                              formatMesAno(dado.mes_ano)
                           ) : (
                              <Vazio />
                           )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                           <Moeda valor={dado.aux_transp} />
                        </TableCell>
                        <TableCell className="relative text-center text-slate-500 tabular-nums">
                           {ultimaGravacao(dado)}
                           {/* Indício de que a linha abre a edição, só com
                               mouse: no toque não há hover para revelá-lo. */}
                           <HiPencil
                              aria-hidden
                              className="invisible absolute top-1/2 right-1 size-3.5 -translate-y-1/2 text-slate-400 pointer-fine:group-hover/row:visible"
                           />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         {showDetail && selectedDados && (
            <DetailDadosBancarios
               show={showDetail}
               onClose={handleClose}
               dados={selectedDados}
            />
         )}
      </>
   );
}

import {
   Fragment,
   memo,
   ReactNode,
   useLayoutEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import { useRouter } from "next/navigation";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { Missao } from "services/routes/cegep/missoes";
import clsx from "clsx";
import { formatNaiveDateTime } from "utils/dateHandler";
import { HiDocumentText, HiTag } from "react-icons/hi2";
import { getSituacaoConfig } from "./useSituacaoConfig";

interface TableMissionProps {
   missoes: Missao[];
}

export const TableMission = memo(function TableMission({
   missoes,
}: TableMissionProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table
            hoverable
            theme={{
               head: { cell: { base: "bg-white border-b border-slate-200" } },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell>Documento</TableHeadCell>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Descricao</TableHeadCell>
                  <TableHeadCell>Afastamento</TableHeadCell>
                  <TableHeadCell>Regresso</TableHeadCell>
                  {/* Militares, Pernoites e Etiquetas dividem a sobra de
                      largura; as demais colunas ficam no tamanho do conteúdo. */}
                  <TableHeadCell className="w-[70%]">Militares</TableHeadCell>
                  <TableHeadCell className="w-1/5">Pernoites</TableHeadCell>
                  <TableHeadCell className="w-[10%]">Etiquetas</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {missoes.map((missao) => (
                  <TableMissionRow key={missao.id} missao={missao} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
});

const TableMissionRow = memo(function TableMissionRow({
   missao,
}: {
   missao: Missao;
}) {
   const router = useRouter();

   const etiquetas = missao.etiquetas || [];
   const users = missao.users || [];
   const pernoites = missao.pernoites || [];

   const { ini, fim } = useMemo(
      () => ({
         ini: formatNaiveDateTime(missao.afast),
         fim: formatNaiveDateTime(missao.regres),
      }),
      [missao.afast, missao.regres]
   );

   const cidades = useMemo(() => {
      const cidadeSet = new Set<string>();
      pernoites.forEach((p) => {
         if (p.cidade) {
            cidadeSet.add(`${p.cidade.nome}-${p.cidade.uf}`);
         }
      });
      return Array.from(cidadeSet);
   }, [pernoites]);

   return (
      <TableRow
         onClick={() => router.push(`/cegep/missoes/${missao.id}`)}
         className="cursor-pointer bg-white"
      >
         <TableCell className="font-medium whitespace-nowrap text-gray-900">
            <div className="flex items-center gap-2">
               <div
                  className={clsx("rounded-md p-1.5", {
                     "bg-blue-600": missao.tipo_doc === "om",
                     "bg-orange-600": missao.tipo_doc === "os",
                  })}
               >
                  <HiDocumentText className="text-sm text-white" />
               </div>
               <span className="font-mono uppercase">
                  {missao.tipo_doc} {missao.n_doc}
               </span>
            </div>
         </TableCell>

         <TableCell className="whitespace-nowrap">
            <span className="font-mono uppercase">{missao.tipo}</span>
         </TableCell>

         <TableCell className="max-w-48 truncate" title={missao.desc}>
            <span className="uppercase">{missao.desc || "-"}</span>
         </TableCell>

         <TableCell className="font-mono whitespace-nowrap">{ini}</TableCell>

         <TableCell className="font-mono whitespace-nowrap">{fim}</TableCell>

         <TableCell>
            <ChipsQueCabem
               titulo={users
                  .map((u) => `${u.p_g} ${u.user.nome_guerra}`)
                  .join(", ")
                  .toUpperCase()}
               chips={users.map((u) => {
                  const config = getSituacaoConfig(u.sit);
                  return (
                     <span
                        className={clsx(
                           CHIP_BASE,
                           config.bgColor,
                           config.borderColor,
                           config.textColor
                        )}
                     >
                        <span className="font-bold">{u.p_g}</span>{" "}
                        {u.user.nome_guerra}
                     </span>
                  );
               })}
            />
         </TableCell>

         <TableCell>
            <ChipsQueCabem
               titulo={cidades.join(", ").toUpperCase()}
               chips={cidades.map((c) => (
                  <span className={CHIP}>{c}</span>
               ))}
            />
         </TableCell>

         <TableCell>
            <ChipsQueCabem
               titulo={etiquetas.map((e) => e.nome).join(", ")}
               chips={etiquetas.map((etiqueta) => (
                  <span
                     className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white"
                     style={{ backgroundColor: etiqueta.cor }}
                     title={etiqueta.descricao}
                  >
                     <HiTag className="h-2.5 w-2.5" />
                     {etiqueta.nome}
                  </span>
               ))}
            />
         </TableCell>
      </TableRow>
   );
});

// Cor fora da base: `clsx` não resolve conflito do Tailwind, e o chip de
// militar troca fundo, borda e texto pela situação (C/D/G), como no card.
const CHIP_BASE =
   "inline-block shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap uppercase shadow-sm";
const CHIP = clsx(CHIP_BASE, "border-slate-200 bg-gray-100 text-gray-700");

/**
 * Chips inteiros numa linha só, quantos couberem na largura da célula; o que
 * não cabe vira "+N", e a lista completa fica no `title` (mouse) e num
 * `sr-only` (leitor de tela). As posições dos chips são lidas numa cópia
 * invisível — já com o gap real, que acompanha a fonte do navegador — e
 * observadas, porque mudam quando a fonte carrega. A cópia é recortada pelo
 * `overflow-hidden` da caixa: sem ele, ela entra na área rolável da tabela e
 * cria scroll lateral. A caixa tem `w-0` para não ditar a largura da coluna;
 * quem dita o mínimo é um calço invisível com o primeiro chip e o "+N", então
 * o primeiro chip sempre aparece inteiro. O resto vem da sobra da tabela.
 */
function ChipsQueCabem({
   chips,
   titulo,
}: {
   chips: ReactNode[];
   titulo: string;
}) {
   const caixaRef = useRef<HTMLDivElement>(null);
   const medidaRef = useRef<HTMLDivElement>(null);
   const [visiveis, setVisiveis] = useState(chips.length);
   const total = chips.length;

   useLayoutEffect(() => {
      const caixa = caixaRef.current;
      const medida = medidaRef.current;
      if (!caixa || !medida) return;

      const calcular = () => {
         // Borda direita de cada chip, contada do início da cópia; o último
         // filho é o "+N". Cada fim sai do layout, sem somar arredondamentos.
         const inicio = medida.getBoundingClientRect().left;
         const fins = Array.from(medida.children).map(
            (el) => el.getBoundingClientRect().right - inicio
         );
         const fimMais = fins.pop() ?? 0;
         const reservaMais = fimMais - (fins[fins.length - 1] ?? 0); // gap + "+N"
         const disponivel = caixa.getBoundingClientRect().width;
         let n = 0;
         while (n < fins.length) {
            const reserva = n < fins.length - 1 ? reservaMais : 0;
            if (fins[n] + reserva > disponivel) break;
            n++;
         }
         setVisiveis(Math.max(n, 1));
      };

      calcular();
      const ro = new ResizeObserver(calcular);
      ro.observe(caixa);
      ro.observe(medida);
      return () => ro.disconnect();
   }, [total, titulo]);

   if (total === 0) return <span className="text-gray-400">-</span>;

   const resto = total - visiveis;

   return (
      <>
         <div className="invisible flex h-0 gap-1 overflow-hidden">
            {chips[0]}
            {total > 1 && <span className={CHIP}>+{total - 1}</span>}
         </div>
         <div
            ref={caixaRef}
            className="relative w-0 min-w-full overflow-hidden"
         >
            <div
               ref={medidaRef}
               className="invisible absolute flex w-max gap-1"
            >
               {chips.map((chip, i) => (
                  <Fragment key={i}>{chip}</Fragment>
               ))}
               <span className={CHIP}>+{total}</span>
            </div>
            <span className="sr-only">{titulo}</span>
            <div aria-hidden className="flex gap-1" title={titulo}>
               {chips.slice(0, visiveis).map((chip, i) => (
                  <Fragment key={i}>{chip}</Fragment>
               ))}
               {resto > 0 && <span className={CHIP}>+{resto}</span>}
            </div>
         </div>
      </>
   );
}

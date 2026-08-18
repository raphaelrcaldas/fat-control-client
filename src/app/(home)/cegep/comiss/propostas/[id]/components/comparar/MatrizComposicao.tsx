import { useMemo, useState } from "react";
import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import clsx from "clsx";
import { realCurrency } from "utils/financeiro";
import type { CenarioDraft } from "../../draftReducer";
import { corDoCenario } from "../../cenarioPalette";
import { calcImpactoLinhaFY, cenarioCodigo } from "../../propostaCalc";

interface MatrizComposicaoProps {
   cenarios: readonly CenarioDraft[];
   ano: number;
   /** Cenário aberto na tela de trás — sua coluna fica realçada. */
   cenarioAtivoId: string | null;
}

interface MatrizLinha {
   userId: number;
   identidade: string;
   /** Custo no exercício por cenário; `null` = o militar não está nele. */
   valores: (number | null)[];
   /** Entra em cenário nenhum de forma idêntica — é o que separa as opções. */
   difere: boolean;
}

/**
 * Quem entra em cada cenário, lado a lado. É a informação que os totais
 * escondem: dois cenários podem custar quase o mesmo com gente diferente
 * dentro, e a decisão é sobre a gente, não sobre o total.
 *
 * A linha "difere" é o miolo — militar ausente de algum cenário, ou presente
 * em todos por valores distintos. O filtro esconde o resto, que é justamente
 * o que os cenários têm em comum.
 */
export function MatrizComposicao({
   cenarios,
   ano,
   cenarioAtivoId,
}: MatrizComposicaoProps) {
   const [soDiferencas, setSoDiferencas] = useState(false);

   const linhas = useMemo<MatrizLinha[]>(() => {
      const porUser = new Map<number, MatrizLinha>();

      cenarios.forEach((c, col) => {
         for (const l of c.linhas) {
            let linha = porUser.get(l.user_id);
            if (!linha) {
               linha = {
                  userId: l.user_id,
                  identidade: l.user
                     ? `${l.user.p_g} ${l.user.nome_guerra}`.toUpperCase()
                     : `MILITAR #${l.user_id}`,
                  valores: cenarios.map(() => null),
                  difere: false,
               };
               porUser.set(l.user_id, linha);
            }
            linha.valores[col] = calcImpactoLinhaFY(l, ano);
         }
      });

      const todas = [...porUser.values()];
      for (const linha of todas) {
         const [primeiro, ...resto] = linha.valores;
         linha.difere = resto.some((v) => v !== primeiro);
      }

      return todas.sort((a, b) =>
         a.identidade.localeCompare(b.identidade, "pt-BR")
      );
   }, [cenarios, ano]);

   const divergentes = linhas.filter((l) => l.difere).length;
   const visiveis = soDiferencas ? linhas.filter((l) => l.difere) : linhas;
   const totais = cenarios.map((_, col) =>
      linhas.reduce((acc, l) => acc + (l.valores[col] ?? 0), 0)
   );

   if (!linhas.length) {
      return (
         <p className="rounded border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            Nenhum militar nos cenários ainda.
         </p>
      );
   }

   return (
      <section className="space-y-2">
         <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
               <h3 className="text-sm font-semibold text-slate-900">
                  Composição
               </h3>
               <p className="text-xs text-slate-500">
                  {divergentes === 0
                     ? "Os cenários têm exatamente os mesmos militares e valores."
                     : `${divergentes} de ${linhas.length} ${
                          linhas.length === 1 ? "militar" : "militares"
                       } ${divergentes === 1 ? "muda" : "mudam"} entre cenários.`}
               </p>
            </div>

            {divergentes > 0 && (
               <Button
                  size="xs"
                  color={soDiferencas ? "primary" : "light"}
                  aria-pressed={soDiferencas}
                  onClick={() => setSoDiferencas((v) => !v)}
               >
                  Só as diferenças
               </Button>
            )}
         </div>

         <div className="overflow-x-auto rounded border border-slate-200">
            <Table>
               <TableHead>
                  <TableRow>
                     {/* Coluna-âncora: com 3+ cenários a tabela rola na
                         horizontal, e sem ela o valor perde o dono. */}
                     <TableHeadCell className="sticky left-0 z-10 bg-slate-50 text-left!">
                        Militar
                     </TableHeadCell>
                     {cenarios.map((c, i) => {
                        const cor = corDoCenario(c.cor);
                        return (
                           <TableHeadCell
                              key={c.localId}
                              className={clsx(
                                 "text-right! whitespace-nowrap",
                                 // Coluna do cenário aberto atrás do modal.
                                 c.localId === cenarioAtivoId
                                    ? cor.soft
                                    : "bg-slate-50"
                              )}
                           >
                              <span className="flex items-center justify-end gap-1.5">
                                 <span
                                    aria-hidden
                                    className={clsx(
                                       "h-2 w-2 rounded-full",
                                       cor.dot
                                    )}
                                 />
                                 {cenarioCodigo(i)} · {c.nome}
                              </span>
                           </TableHeadCell>
                        );
                     })}
                  </TableRow>
               </TableHead>

               <TableBody className="divide-y divide-slate-100">
                  {visiveis.map((l) => (
                     <TableRow key={l.userId} className="bg-white">
                        <TableCell className="sticky left-0 z-10 bg-white font-medium whitespace-nowrap text-slate-800 uppercase">
                           <span className="flex items-center gap-1.5">
                              {l.identidade}
                              {l.difere && (
                                 <span
                                    title="Este militar muda entre os cenários"
                                    className="rounded bg-slate-100 px-1 text-[10px] leading-4 font-bold text-slate-500"
                                 >
                                    ≠
                                 </span>
                              )}
                           </span>
                        </TableCell>
                        {l.valores.map((v, i) => (
                           <TableCell
                              key={cenarios[i].localId}
                              className={clsx(
                                 "text-right whitespace-nowrap tabular-nums",
                                 v === null
                                    ? "bg-slate-50/70 text-slate-400"
                                    : "text-slate-700"
                              )}
                           >
                              {v === null ? "—" : realCurrency(v)}
                           </TableCell>
                        ))}
                     </TableRow>
                  ))}

                  {/* Total como última linha, e não em `tfoot`: o `Table` do
                      Flowbite 0.12.17 não expõe rodapé. */}
                  <TableRow className="border-t border-slate-200 bg-slate-50">
                     <TableCell className="sticky left-0 z-10 bg-slate-50 text-xs font-bold tracking-wide whitespace-nowrap text-slate-600 uppercase">
                        Total em {ano}
                     </TableCell>
                     {totais.map((t, i) => (
                        <TableCell
                           key={cenarios[i].localId}
                           className="text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums"
                        >
                           {realCurrency(t)}
                        </TableCell>
                     ))}
                  </TableRow>
               </TableBody>
            </Table>
         </div>

         {cenarios.length > 1 && (
            <p className="text-xs text-slate-400 md:hidden">
               Arraste a tabela para o lado para ver os demais cenários.
            </p>
         )}
      </section>
   );
}

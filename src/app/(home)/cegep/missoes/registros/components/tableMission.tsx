import { memo, useMemo } from "react";
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
                  <TableHeadCell className="text-center">
                     Militares
                  </TableHeadCell>
                  <TableHeadCell>Pernoites</TableHeadCell>
                  <TableHeadCell>Etiquetas</TableHeadCell>
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

         <TableCell className="text-center whitespace-nowrap">
            {users.length > 0 ? (
               <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                  {users.length}
               </span>
            ) : (
               <span className="text-gray-400">-</span>
            )}
         </TableCell>

         <TableCell className="max-w-56">
            {cidades.length > 0 ? (
               <div
                  className="flex flex-nowrap gap-1 overflow-hidden"
                  title={cidades.join(", ")}
               >
                  {cidades.slice(0, 2).map((cidade) => (
                     <span
                        key={cidade}
                        className="inline-block max-w-42 truncate rounded border border-slate-200 bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 uppercase shadow-sm"
                     >
                        {cidade}
                     </span>
                  ))}
                  {cidades.length > 2 && (
                     <span className="inline-block rounded border border-slate-200 bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm">
                        +{cidades.length - 2}
                     </span>
                  )}
               </div>
            ) : (
               <span className="text-gray-400">-</span>
            )}
         </TableCell>

         <TableCell>
            {etiquetas.length > 0 ? (
               <div className="flex flex-wrap gap-1">
                  {etiquetas.map((etiqueta) => (
                     <span
                        key={etiqueta.id}
                        className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: etiqueta.cor }}
                        title={etiqueta.descricao}
                     >
                        <HiTag className="h-2.5 w-2.5" />
                        {etiqueta.nome}
                     </span>
                  ))}
               </div>
            ) : (
               <span className="text-gray-400">-</span>
            )}
         </TableCell>
      </TableRow>
   );
});

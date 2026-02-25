import { useState, memo, useMemo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import MissionDetail from "./missionDetail";
import { Missao } from "services/routes/cegep/missoes";
import clsx from "clsx";
import { DATE_FORMAT_EXTENDED } from "utils/dateHandler";
import { HiDocumentText, HiTag } from "react-icons/hi2";

interface TableMissionProps {
   missoes: Missao[];
   setClone: (missao: Missao) => void;
   setShowForm: (show: boolean) => void;
}

export const TableMission = memo(function TableMission({
   missoes,
   setClone,
   setShowForm,
}: TableMissionProps) {
   return (
      <div className="overflow-x-auto">
         <Table striped hoverable>
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
                  <TableMissionRow
                     key={missao.id}
                     missao={missao}
                     setClone={setClone}
                     setShowForm={setShowForm}
                  />
               ))}
            </TableBody>
         </Table>
      </div>
   );
});

const TableMissionRow = memo(function TableMissionRow({
   missao,
   setClone,
   setShowForm,
}: {
   missao: Missao;
   setClone: (missao: Missao) => void;
   setShowForm: (show: boolean) => void;
}) {
   const [showDetail, setShowDetail] = useState(false);

   const etiquetas = missao.etiquetas || [];
   const users = missao.users || [];
   const pernoites = missao.pernoites || [];

   const { ini, fim } = useMemo(
      () => ({
         ini: new Date(missao.afast).toLocaleDateString(
            "pt-BR",
            DATE_FORMAT_EXTENDED
         ),
         fim: new Date(missao.regres).toLocaleDateString(
            "pt-BR",
            DATE_FORMAT_EXTENDED
         ),
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
      <>
         <TableRow
            onClick={() => setShowDetail(true)}
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
                  <span className="font-semibold uppercase">
                     {missao.tipo_doc} {String(missao.n_doc).padStart(3, "0")}
                  </span>
               </div>
            </TableCell>

            <TableCell className="whitespace-nowrap">
               <span className="font-medium uppercase">{missao.tipo}</span>
            </TableCell>

            <TableCell className="max-w-48 truncate" title={missao.desc}>
               <span className="uppercase">{missao.desc || "-"}</span>
            </TableCell>

            <TableCell className="whitespace-nowrap">{ini}</TableCell>

            <TableCell className="whitespace-nowrap">{fim}</TableCell>

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
                  <div className="flex flex-wrap gap-1">
                     {cidades.map((cidade) => (
                        <span
                           key={cidade}
                           className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 uppercase"
                        >
                           {cidade}
                        </span>
                     ))}
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

         {showDetail && (
            <MissionDetail
               missao={missao}
               show={showDetail}
               setShow={setShowDetail}
               setClone={setClone}
               setShowForm={setShowForm}
               edit={false}
            />
         )}
      </>
   );
});

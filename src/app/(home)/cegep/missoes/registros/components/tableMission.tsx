import { useState, memo, useMemo } from "react";
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
      <div className="overflow-x-auto rounded-lg border border-gray-200">
         <table className="w-full text-left text-sm text-gray-700">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600 uppercase">
               <tr>
                  <th scope="col" className="px-4 py-3">
                     Documento
                  </th>
                  <th scope="col" className="px-4 py-3">
                     Tipo
                  </th>
                  <th scope="col" className="px-4 py-3">
                     Descricao
                  </th>
                  <th scope="col" className="px-4 py-3">
                     Afastamento
                  </th>
                  <th scope="col" className="px-4 py-3">
                     Regresso
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                     Militares
                  </th>
                  <th scope="col" className="px-4 py-3">
                     Pernoites
                  </th>
                  <th scope="col" className="px-4 py-3">
                     Etiquetas
                  </th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
               {missoes.map((missao, index) => (
                  <TableMissionRow
                     key={missao.id}
                     missao={missao}
                     index={index}
                     setClone={setClone}
                     setShowForm={setShowForm}
                  />
               ))}
            </tbody>
         </table>
      </div>
   );
});

const TableMissionRow = memo(function TableMissionRow({
   missao,
   index,
   setClone,
   setShowForm,
}: {
   missao: Missao;
   index: number;
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
         <tr
            onClick={() => setShowDetail(true)}
            className={clsx(
               "cursor-pointer transition-colors hover:bg-red-50",
               index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
            )}
         >
            {/* Documento */}
            <td className="px-4 py-3 whitespace-nowrap">
               <div className="flex items-center gap-2">
                  <div
                     className={clsx("rounded-md p-1.5", {
                        "bg-blue-600": missao.tipo_doc === "om",
                        "bg-orange-600": missao.tipo_doc === "os",
                     })}
                  >
                     <HiDocumentText className="text-sm text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 uppercase">
                     {missao.tipo_doc} {String(missao.n_doc).padStart(3, "0")}
                  </span>
               </div>
            </td>

            {/* Tipo */}
            <td className="px-4 py-3 whitespace-nowrap">
               <span className="font-medium uppercase">{missao.tipo}</span>
            </td>

            {/* Descricao */}
            <td className="max-w-48 truncate px-4 py-3" title={missao.desc}>
               <span className="uppercase">{missao.desc || "-"}</span>
            </td>

            {/* Afastamento */}
            <td className="px-4 py-3 whitespace-nowrap">{ini}</td>

            {/* Regresso */}
            <td className="px-4 py-3 whitespace-nowrap">{fim}</td>

            {/* Militares */}
            <td className="px-4 py-3 text-center whitespace-nowrap">
               {users.length > 0 ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                     {users.length}
                  </span>
               ) : (
                  <span className="text-gray-400">-</span>
               )}
            </td>

            {/* Pernoites (cidades) */}
            <td className="max-w-56 px-4 py-3">
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
            </td>

            {/* Etiquetas */}
            <td className="px-4 py-3">
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
            </td>
         </tr>

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

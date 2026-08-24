import {
   HiOutlineArchiveBox,
   HiOutlineUser,
   HiOutlineArrowPath,
} from "react-icons/hi2";
import type { LocalPassaporte } from "services/routes/inteligencia/passaportes";

/** Ordem de exibição no filtro e no segmento do modal. */
export const LOCAIS_PASSAPORTE: LocalPassaporte[] = [
   "secao",
   "militar",
   "renovacao",
];

/**
 * Custódia do passaporte físico — onde o caderno está agora.
 *
 * Paleta deliberadamente fora do farol de validade (green/yellow/orange/red):
 * custódia não é urgência, e reaproveitar aquelas cores faria "com o militar"
 * parecer um alerta. Texto em tom 700 para cumprir AA sobre branco; `dot` mais
 * claro por ser grafismo, não texto (mesma regra de `utils/dateStatus.ts`).
 */
export function getLocalConfig(local: LocalPassaporte) {
   switch (local) {
      case "secao":
         return {
            label: "Na seção",
            // `short`: rótulo do segmento no modal, onde três botões dividem
            // a largura de uma coluna de formulário e o rótulo completo
            // quebrava linha.
            short: "Seção",
            color: "text-slate-700",
            bg: "bg-slate-100",
            border: "border-slate-200",
            dot: "bg-slate-400",
            icon: HiOutlineArchiveBox,
         };
      case "militar":
         return {
            label: "Com o militar",
            short: "Militar",
            color: "text-sky-700",
            bg: "bg-sky-50",
            border: "border-sky-200",
            dot: "bg-sky-500",
            icon: HiOutlineUser,
         };
      case "renovacao":
         return {
            label: "Em renovação",
            short: "Renovação",
            color: "text-violet-700",
            bg: "bg-violet-50",
            border: "border-violet-200",
            dot: "bg-violet-500",
            icon: HiOutlineArrowPath,
         };
   }
}

import {
   HiOutlineArchiveBox,
   HiOutlineUser,
   HiOutlinePaperAirplane,
   HiOutlineArrowPath,
} from "react-icons/hi2";
import type { StatusPassaporte } from "services/routes/inteligencia/passaportes";

/** Ordem de exibição no filtro e no segmento do modal. */
export const STATUS_PASSAPORTE: StatusPassaporte[] = [
   "disponivel",
   "militar",
   "missao",
   "renovacao",
];

/**
 * Situação do passaporte físico — onde o caderno está e se a seção pode
 * contar com ele.
 *
 * Não confundir com o farol de validade (`utils/dateStatus.ts`), que ocupa
 * a mesma tela: lá a cor mede urgência de vencimento, aqui mede posse.
 * Por isso as quatro cores ficam em matizes bem separados e só "disponível"
 * toma emprestado o verde — é o estado bom nas duas leituras. Texto em tom
 * 700 para cumprir AA sobre branco; `dot` mais claro por ser grafismo.
 */
export function getStatusPassaporteConfig(status: StatusPassaporte) {
   switch (status) {
      case "disponivel":
         return {
            label: "Disponível",
            // `short`: rótulo do segmento no modal, onde quatro botões
            // dividem a largura de uma coluna de formulário e o rótulo
            // completo quebrava linha.
            short: "Disponível",
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            dot: "bg-emerald-500",
            icon: HiOutlineArchiveBox,
         };
      case "militar":
         return {
            label: "Com o militar",
            short: "Militar",
            color: "text-slate-700",
            bg: "bg-slate-100",
            border: "border-slate-300",
            dot: "bg-slate-400",
            icon: HiOutlineUser,
         };
      case "missao":
         return {
            label: "Em missão",
            short: "Missão",
            color: "text-sky-700",
            bg: "bg-sky-50",
            border: "border-sky-200",
            dot: "bg-sky-500",
            icon: HiOutlinePaperAirplane,
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

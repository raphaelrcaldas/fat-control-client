import {
   MdSort,
   MdAirplaneTicket,
   MdAirplanemodeInactive,
   MdHail,
   MdOutlinePeopleAlt,
   MdHome,
   MdMoney,
   MdAccountBalance,
   MdAssignment,
   MdAttachMoney,
} from "react-icons/md";
import { FaUsers, FaShield } from "react-icons/fa6";
import { FaPaperPlane } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { GiSecurityGate } from "react-icons/gi";
import { TbLogs } from "react-icons/tb";

export const navItems = [
   {
      type: "item",
      icon: MdHome,
      label: "Início",
      path: "/",
      roles: [],
   },
   {
      type: "collapse",
      icon: FaPaperPlane,
      label: "Operações",
      roles: [
         "ops_avancado",
         "ops_basico",
         "dout_avancado",
         "dout_basico",
         "apoio_avancado",
      ],
      children: [
         {
            icon: MdSort,
            label: "Pau de Sebo",
            path: "/ops/sebo",
            resource: "sebo",
            permission: "view",
         },
         {
            icon: MdAirplaneTicket,
            label: "Quadrinhos",
            path: "/ops/quads",
            resource: "quad_ops",
            permission: "view",
         },
         {
            icon: MdAirplanemodeInactive,
            label: "Indisponibilidades",
            path: "/ops/indisp",
            resource: "indisp_trips",
            permission: "view",
         },
         {
            icon: MdHail,
            label: "Tripulantes",
            path: "/ops/trip",
            resource: "trips",
            permission: "view",
         },
         {
            icon: MdAssignment,
            label: "Ordens de Missão",
            path: "/ops/om",
            resource: "ordens_missao",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: FaUsers,
      label: "Pessoal",
      roles: [],
      children: [
         {
            icon: MdAirplaneTicket,
            label: "Missões",
            path: "/cegep/missoes",
            roles: ["apoio_avancado"],
         },
         {
            icon: MdMoney,
            label: "Comissionamento",
            path: "/cegep/comiss",
            roles: [],
         },
         {
            icon: MdAttachMoney,
            label: "Soldos",
            path: "/cegep/soldos",
            resource: "soldo",
            permission: "view",
         },
         {
            icon: MdMoney,
            label: "Diárias",
            path: "/cegep/diarias",
            resource: "diaria",
            permission: "view",
         },
         {
            icon: MdAccountBalance,
            label: "Dados Bancários",
            path: "/cegep/dados-bancarios",
            resource: "dados_bancarios",
            permission: "view",
         },
      ],
   },
   {
      type: "item",
      icon: MdOutlinePeopleAlt,
      label: "Usuários",
      path: "/users",
      roles: ["apoio_avancado", "apoio_basico"],
   },
   {
      type: "collapse",
      icon: RiAdminLine,
      label: "Admin",
      roles: ["admin"],
      children: [
         {
            icon: GiSecurityGate,
            label: "Roles",
            path: "/admin/roles",
         },
         {
            icon: TbLogs,
            label: "Logs",
            path: "/admin/logs",
         },
      ],
   },
] as const;

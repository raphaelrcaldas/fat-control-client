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
   MdCalendarViewWeek,
   MdFlightTakeoff,
   MdBarChart,
   MdHealthAndSafety,
   MdMedicalServices,
   MdStorage,
   MdSecurity,
   MdGroups,
   MdSchool,
   MdTranslate,
   MdPolicy,
   MdBadge,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { FaPaperPlane } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { GiSecurityGate } from "react-icons/gi";
import { TbLogs } from "react-icons/tb";
import { ImStatsDots } from "react-icons/im";
import { CiPaperplane } from "react-icons/ci";

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
            icon: MdCalendarViewWeek,
            label: "Quadro Operacional",
            path: "/ops/quadro",
         },
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
            icon: MdAssignment,
            label: "Ordens de Missão",
            path: "/ops/om",
            resource: "ordem_missao",
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
            icon: MdFlightTakeoff,
            label: "Aeronaves",
            path: "/ops/aeronaves",
            resource: "aeronaves",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdBarChart,
      label: "Estatística",
      roles: [
         "ops_avancado",
         "ops_basico",
         "dout_avancado",
         "dout_basico",
         "apoio_avancado",
         "apoio_basico",
         "aeromed",
      ],
      children: [
         {
            icon: MdSort,
            label: "Pau de Sebo",
            path: "/estatistica/sebo",
            resource: "estatistica",
            permission: "view",
         },
         {
            icon: CiPaperplane,
            label: "Etapas",
            path: "/estatistica/etapas",
         },
         {
            icon: ImStatsDots,
            label: "Esforço Aéreo",
            path: "/estatistica/esfaer",
            resource: "esf_aer",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdHealthAndSafety,
      label: "Aeromédica",
      roles: ["aeromed"],
      children: [
         {
            icon: MdMedicalServices,
            label: "Cartões de Saúde",
            path: "/aeromedica/cartoes-saude",
            // resource: "cartoes_saude",
            // permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdSecurity,
      label: "Segurança de Voo",
      roles: ["seg_voo"],
      children: [
         {
            icon: MdGroups,
            label: "CRM",
            path: "/seg-voo/crm",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdSchool,
      label: "Instrução",
      roles: ["dout_avancado", "dout_basico"],
      children: [
         {
            icon: MdTranslate,
            label: "Idiomas",
            path: "/instrucao/idiomas",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdPolicy,
      label: "Inteligência",
      roles: ["inteligencia"],
      children: [
         {
            icon: MdBadge,
            label: "Passaportes",
            path: "/inteligencia/passaportes",
         },
      ],
   },
   {
      type: "collapse",
      icon: FaUsers,
      label: "Pessoal",
      roles: [
         "ops_avancado",
         "ops_basico",
         "dout_avancado",
         "dout_basico",
         "apoio_avancado",
         "apoio_basico",
      ],
      children: [
         {
            icon: MdAirplaneTicket,
            label: "Missões",
            path: "/cegep/missoes",
            roles: ["apoio_avancado", "apoio_basico"],
         },
         {
            icon: MdMoney,
            label: "Comissionamento",
            path: "/cegep/comiss",
            resource: "comiss",
            permission: "view",
         },
         {
            icon: MdAccountBalance,
            label: "Dados Bancários",
            path: "/cegep/dados-bancarios",
            resource: "dados_bancarios",
            permission: "view",
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
      ],
   },
   {
      type: "item",
      icon: MdOutlinePeopleAlt,
      label: "Usuários",
      path: "/users",
      roles: ["apoio_avancado", "apoio_basico", "dout_avancado", "dout_basico"],
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
         {
            icon: MdStorage,
            label: "Storage",
            path: "/admin/storage",
         },
      ],
   },
] as const;

import {
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
   MdPolicy,
   MdBadge,
   MdSort,
   MdEventAvailable,
   MdManageAccounts,
   MdDeleteSweep,
   MdFlag,
} from "react-icons/md";
import { FaUsers, FaBuilding, FaSitemap } from "react-icons/fa6";
import { FaPaperPlane } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { GiSecurityGate, GiJoystick } from "react-icons/gi";
import { TbLogs } from "react-icons/tb";
import { ImStatsDots } from "react-icons/im";
import { CiPaperplane } from "react-icons/ci";

export const navItems = [
   {
      type: "item",
      icon: MdHome,
      label: "Início",
      path: "/",
      scope: "shared",
      roles: [],
   },
   {
      type: "collapse",
      icon: FaPaperPlane,
      label: "Operações",
      scope: "tenant",
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
            resource: "quadro-oper",
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
            icon: MdFlag,
            label: "Operações",
            path: "/ops/operacoes",
            resource: "operacoes",
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
            icon: MdEventAvailable,
            label: "Escala",
            path: "/ops/escala",
            resource: "quad_ops",
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
      scope: "tenant",
      roles: [],
      children: [
         {
            icon: MdSort,
            label: "Pau de Sebo",
            path: "/estatistica/sebo",
            resource: "sebo",
            permission: "view",
         },
         {
            icon: CiPaperplane,
            label: "Etapas",
            path: "/estatistica/etapas",
            resource: "etapas",
            permission: "view",
         },
         {
            icon: ImStatsDots,
            label: "Esforço Aéreo",
            path: "/estatistica/esfaer",
            resource: "esf_aer",
            permission: "view",
         },
         {
            icon: MdFlightTakeoff,
            label: "Horas por ANV",
            path: "/estatistica/horas-anv",
            resource: "aeronaves",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdHealthAndSafety,
      label: "Aeromédica",
      scope: "tenant",
      roles: [],
      children: [
         {
            icon: MdMedicalServices,
            label: "Cartões de Saúde",
            path: "/aeromedica/cartoes-saude",
            resource: "cartoes-saude",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdSecurity,
      label: "Segurança de Voo",
      scope: "tenant",
      roles: [],
      children: [
         {
            icon: MdGroups,
            label: "CRM",
            path: "/seg-voo/crm",
            resource: "crm",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdSchool,
      label: "Instrução",
      scope: "tenant",
      roles: [],
      children: [
         {
            icon: MdBadge,
            label: "Cartões",
            path: "/instrucao/cartoes",
            resource: "instrucao-cartoes",
            permission: "view",
         },
         {
            icon: GiJoystick,
            label: "Simulador",
            path: "/instrucao/simulador",
            resource: "simulador",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: MdPolicy,
      label: "Inteligência",
      scope: "tenant",
      roles: [],
      children: [
         {
            icon: MdBadge,
            label: "Passaportes",
            path: "/inteligencia/passaportes",
            resource: "passaportes",
            permission: "view",
         },
      ],
   },
   {
      type: "collapse",
      icon: FaUsers,
      label: "Pessoal",
      scope: "tenant",
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
            resource: "missoes_cegep",
            permission: "view",
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
      ],
   },
   {
      // Diretório universal de usuários: visível em ambos os contextos
      // (Sistema e unidade). Ver project-users-universal.
      type: "item",
      icon: MdOutlinePeopleAlt,
      label: "Usuários",
      path: "/users",
      scope: "shared",
      roles: ["apoio_avancado", "apoio_basico", "dout_avancado", "dout_basico"],
   },
   {
      // Vínculos usuário→perfil (controle de acesso operacional).
      // Escopo por org ativa é aplicado no backend: admin de unidade
      // gerencia só a própria org; admin de sistema, os vínculos de
      // sistema. Por isso "shared" (visível em ambos os contextos).
      type: "item",
      icon: MdManageAccounts,
      label: "Controle de Acesso",
      path: "/acessos",
      scope: "shared",
      roles: ["admin"],
   },
   {
      type: "collapse",
      icon: RiAdminLine,
      label: "Admin",
      scope: "system",
      roles: ["admin"],
      children: [
         {
            icon: FaBuilding,
            label: "Organizações",
            path: "/admin/organizacoes",
         },
         {
            icon: FaSitemap,
            label: "Tenants",
            path: "/admin/tenants",
         },
         {
            icon: GiSecurityGate,
            label: "Roles & Permissões",
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
         {
            icon: MdAttachMoney,
            label: "Soldos",
            path: "/admin/soldos",
         },
         {
            icon: MdMoney,
            label: "Diárias",
            path: "/admin/diarias",
         },
         {
            icon: MdDeleteSweep,
            label: "Limpeza",
            path: "/admin/cleanup",
         },
      ],
   },
] as const;

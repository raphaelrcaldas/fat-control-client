"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabItem } from "flowbite-react";
import { OrdemMissao, FiltrosOrdem } from "./types";
import { FiltrosOrdemComponent } from "./components/FiltrosOrdem";
import { ListaOrdens } from "./components/ListaOrdens";
import { OrdemModal } from "./components/OrdemModal";

// Dados de exemplo com tripulação real
const initialOrdens: OrdemMissao[] = [
   {
      id: 1,
      numero: "001/1GT1/251225",
      documentoReferencia: "OF-001/2025",
      matriculaAeronave: 2853,
      projeto: "kc-390",
      tipo: "Transporte Aerologístico",
      status: "Elaborada",
      etapas: [
         {
            dataDecolagem: "2025-12-25",
            horaDecolagem: "10:00",
            origem: "SBGL",
            eta: "11:30",
            destino: "SBBR",
            alternativa: "SBSP",
            tempoVooEtapa: "01:30",
            tempoVooAlternativa: "00:45",
            quantidadeCombustivel: "1500",
            esforcoAereo: "Transporte de pessoal",
         },
         {
            dataDecolagem: "2025-12-25",
            horaDecolagem: "14:30",
            origem: "SBBR",
            eta: "16:45",
            destino: "SBMN",
            alternativa: "SBCG",
            tempoVooEtapa: "02:15",
            tempoVooAlternativa: "01:00",
            quantidadeCombustivel: "1800",
            esforcoAereo: "Transporte de carga",
         },
      ],
      tripulacao: {
         pil: [
            {
               id: 5,
               trig: "joy",
               p_g: "tc",
               nome_guerra: "joyce",
               oper: "in",
               posto_ant: 5,
               ult_promo: "2025-08-31",
               ant_rel: 238,
               id_fab: 100005,
            },
            {
               id: 9,
               trig: "boi",
               p_g: "mj",
               nome_guerra: "boris",
               oper: "in",
               posto_ant: 6,
               ult_promo: "2024-08-31",
               ant_rel: 150,
               id_fab: 100009,
            },
         ],
         mc: [
            {
               id: 34,
               trig: "cld",
               p_g: "so",
               nome_guerra: "claudio c",
               oper: "in",
               posto_ant: 11,
               ult_promo: "2020-12-01",
               ant_rel: null,
               id_fab: 100034,
            },
         ],
         lm: [
            {
               id: 49,
               trig: "ass",
               p_g: "1s",
               nome_guerra: "assis",
               oper: "in",
               posto_ant: 12,
               ult_promo: "2018-12-01",
               ant_rel: null,
               id_fab: 100049,
            },
            {
               id: 50,
               trig: "dnl",
               p_g: "1s",
               nome_guerra: "daniel barros",
               oper: "in",
               posto_ant: 12,
               ult_promo: "2019-12-01",
               ant_rel: null,
               id_fab: 100050,
            },
         ],
         tf: [
            {
               id: 110,
               trig: "net",
               p_g: "1s",
               nome_guerra: "neto",
               oper: "in",
               posto_ant: 12,
               ult_promo: "2016-12-01",
               ant_rel: null,
               id_fab: 100110,
            },
            {
               id: 118,
               trig: "ala",
               p_g: "2s",
               nome_guerra: "alessandra",
               oper: "op",
               posto_ant: 13,
               ult_promo: "2023-08-01",
               ant_rel: null,
               id_fab: 100118,
            },
         ],
         oe: [],
         os: [],
      },
   },
   {
      id: 2,
      numero: "002/1GT1/261225",
      documentoReferencia: "OF-002/2025",
      matriculaAeronave: 2857,
      projeto: "kc-390",
      tipo: "Lançamento de PQD",
      status: "Rascunho",
      etapas: [
         {
            dataDecolagem: "2025-12-26",
            horaDecolagem: "08:00",
            origem: "SBBR",
            eta: "09:45",
            destino: "SBCG",
            alternativa: "SBGO",
            tempoVooEtapa: "01:45",
            tempoVooAlternativa: "00:30",
            quantidadeCombustivel: "1200",
            esforcoAereo: "Lançamento de paraquedistas",
         },
      ],
      tripulacao: {
         pil: [
            {
               id: 7,
               trig: "glb",
               p_g: "mj",
               nome_guerra: "glauber",
               oper: "in",
               posto_ant: 6,
               ult_promo: "2023-08-31",
               ant_rel: 200,
               id_fab: 100007,
            },
            {
               id: 10,
               trig: "crz",
               p_g: "mj",
               nome_guerra: "cruz",
               oper: "in",
               posto_ant: 6,
               ult_promo: "2024-08-31",
               ant_rel: 180,
               id_fab: 100010,
            },
         ],
         mc: [
            {
               id: 37,
               trig: "ivy",
               p_g: "1s",
               nome_guerra: "ivy",
               oper: "in",
               posto_ant: 12,
               ult_promo: "2019-12-01",
               ant_rel: null,
               id_fab: 100037,
            },
         ],
         lm: [
            {
               id: 55,
               trig: "brh",
               p_g: "1s",
               nome_guerra: "bruno henrique",
               oper: "in",
               posto_ant: 12,
               ult_promo: "2020-12-01",
               ant_rel: null,
               id_fab: 100055,
            },
         ],
         tf: [
            {
               id: 121,
               trig: "myl",
               p_g: "3s",
               nome_guerra: "mylena",
               oper: "op",
               posto_ant: 14,
               ult_promo: "2020-11-27",
               ant_rel: null,
               id_fab: 100121,
            },
         ],
         oe: [],
         os: [],
      },
   },
   {
      id: 3,
      numero: "003/2GT2/271225",
      documentoReferencia: "OF-003/2025",
      matriculaAeronave: 2859,
      projeto: "kc-390",
      tipo: "Transporte Aerologístico",
      status: "Finalizada",
      etapas: [
         {
            dataDecolagem: "2025-12-27",
            horaDecolagem: "06:00",
            origem: "SBSP",
            eta: "08:00",
            destino: "SBRF",
            alternativa: "SBSV",
            tempoVooEtapa: "02:00",
            tempoVooAlternativa: "00:50",
            quantidadeCombustivel: "1600",
            esforcoAereo: "Transporte logístico",
         },
         {
            dataDecolagem: "2025-12-27",
            horaDecolagem: "10:00",
            origem: "SBRF",
            eta: "11:20",
            destino: "SBFZ",
            alternativa: "SBNT",
            tempoVooEtapa: "01:20",
            tempoVooAlternativa: "00:40",
            quantidadeCombustivel: "1400",
            esforcoAereo: "Continuação transporte",
         },
      ],
      tripulacao: {
         pil: [
            {
               id: 23,
               trig: "cps",
               p_g: "cp",
               nome_guerra: "campos",
               oper: "op",
               posto_ant: 7,
               ult_promo: "2022-08-31",
               ant_rel: 100,
               id_fab: 100023,
            },
            {
               id: 13,
               trig: "cre",
               p_g: "cp",
               nome_guerra: "corrêa",
               oper: "op",
               posto_ant: 7,
               ult_promo: "2023-08-31",
               ant_rel: 120,
               id_fab: 100013,
            },
         ],
         mc: [
            {
               id: 45,
               trig: "fer",
               p_g: "1s",
               nome_guerra: "fernanda",
               oper: "op",
               posto_ant: 12,
               ult_promo: "2021-12-01",
               ant_rel: null,
               id_fab: 100045,
            },
         ],
         lm: [
            {
               id: 64,
               trig: "brg",
               p_g: "so",
               nome_guerra: "braga",
               oper: "in",
               posto_ant: 11,
               ult_promo: "2022-12-01",
               ant_rel: null,
               id_fab: 100064,
            },
         ],
         tf: [
            {
               id: 107,
               trig: "anr",
               p_g: "1s",
               nome_guerra: "anderson araujo",
               oper: "in",
               posto_ant: 12,
               ult_promo: "2019-12-01",
               ant_rel: null,
               id_fab: 100107,
            },
            {
               id: 111,
               trig: "bce",
               p_g: "2s",
               nome_guerra: "bruno cesar",
               oper: "in",
               posto_ant: 13,
               ult_promo: "2018-12-01",
               ant_rel: null,
               id_fab: 100111,
            },
         ],
         oe: [],
         os: [],
      },
   },
   {
      id: 4,
      numero: "004/1GT1/281225",
      documentoReferencia: "OF-004/2025",
      matriculaAeronave: 2860,
      projeto: "kc-390",
      tipo: "Lançamento de PQD",
      status: "Revisada",
      etapas: [
         {
            dataDecolagem: "2025-12-28",
            horaDecolagem: "07:30",
            origem: "SBGL",
            eta: "08:20",
            destino: "SBCW",
            alternativa: "SBSP",
            tempoVooEtapa: "00:50",
            tempoVooAlternativa: "00:30",
            quantidadeCombustivel: "1100",
            esforcoAereo: "Treinamento PQD",
         },
      ],
      tripulacao: {
         pil: [
            {
               id: 25,
               trig: "gon",
               p_g: "cp",
               nome_guerra: "gondim",
               oper: "op",
               posto_ant: 7,
               ult_promo: "2021-08-31",
               ant_rel: 90,
               id_fab: 100025,
            },
         ],
         mc: [
            {
               id: 2,
               trig: "gua",
               p_g: "so",
               nome_guerra: "guerra",
               oper: "op",
               posto_ant: 11,
               ult_promo: "2018-12-01",
               ant_rel: null,
               id_fab: 100002,
            },
         ],
         lm: [
            {
               id: 52,
               trig: "bso",
               p_g: "1s",
               nome_guerra: "barroso",
               oper: "op",
               posto_ant: 12,
               ult_promo: "2020-12-01",
               ant_rel: null,
               id_fab: 100052,
            },
         ],
         tf: [
            {
               id: 112,
               trig: "lad",
               p_g: "2s",
               nome_guerra: "ladeira",
               oper: "op",
               posto_ant: 13,
               ult_promo: "2020-12-01",
               ant_rel: null,
               id_fab: 100112,
            },
         ],
         oe: [],
         os: [],
      },
   },
   {
      id: 5,
      numero: "005/2GT2/291225",
      documentoReferencia: "OF-005/2025",
      matriculaAeronave: 2853,
      projeto: "kc-390",
      tipo: "Transporte Aerologístico",
      status: "Rascunho",
      etapas: [
         {
            dataDecolagem: "2025-12-29",
            horaDecolagem: "09:00",
            origem: "SBKP",
            eta: "10:00",
            destino: "SBPA",
            alternativa: "SBCT",
            tempoVooEtapa: "01:00",
            tempoVooAlternativa: "00:25",
            quantidadeCombustivel: "1250",
            esforcoAereo: "Transporte administrativo",
         },
      ],
      tripulacao: {
         pil: [
            {
               id: 21,
               trig: "cav",
               p_g: "1t",
               nome_guerra: "carvalho",
               oper: "ba",
               posto_ant: 8,
               ult_promo: "2023-12-25",
               ant_rel: null,
               id_fab: 100021,
            },
            {
               id: 24,
               trig: "jce",
               p_g: "1t",
               nome_guerra: "jeciane",
               oper: "ba",
               posto_ant: 8,
               ult_promo: "2024-12-25",
               ant_rel: null,
               id_fab: 100024,
            },
         ],
         mc: [
            {
               id: 38,
               trig: "jam",
               p_g: "1s",
               nome_guerra: "jamys",
               oper: "op",
               posto_ant: 12,
               ult_promo: "2020-12-01",
               ant_rel: null,
               id_fab: 100038,
            },
         ],
         lm: [
            {
               id: 53,
               trig: "cao",
               p_g: "1s",
               nome_guerra: "caio",
               oper: "op",
               posto_ant: 12,
               ult_promo: "2021-12-01",
               ant_rel: null,
               id_fab: 100053,
            },
         ],
         tf: [
            {
               id: 122,
               trig: "crl",
               p_g: "3s",
               nome_guerra: "carlos",
               oper: "op",
               posto_ant: 14,
               ult_promo: "2022-04-01",
               ant_rel: null,
               id_fab: 100122,
            },
         ],
         oe: [],
         os: [],
      },
   },
];

// Helpers para datas padrão
const getDefaultDates = () => {
   const hoje = new Date();
   const trintaDiasAtras = new Date();
   const trintaDiasAFrente = new Date();
   trintaDiasAtras.setDate(hoje.getDate() - 30);
   trintaDiasAFrente.setDate(hoje.getDate() + 30);

   const formatDate = (date: Date) => date.toISOString().split("T")[0];

   return {
      dataInicio: formatDate(trintaDiasAtras),
      dataFim: formatDate(trintaDiasAFrente),
   };
};

const defaultDates = getDefaultDates();

export default function OrdensMissao() {
   const [ordens, setOrdens] = useState<OrdemMissao[]>(initialOrdens);
   const [filtros, setFiltros] = useState<FiltrosOrdem>({
      busca: "",
      status: [],
      tipo: "",
      dataInicio: defaultDates.dataInicio,
      dataFim: defaultDates.dataFim,
   });
   const [debouncedBusca, setDebouncedBusca] = useState(filtros.busca);
   const [debouncedTipo, setDebouncedTipo] = useState(filtros.tipo);
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedOrdem, setSelectedOrdem] = useState<OrdemMissao | null>(null);
   const [isCloning, setIsCloning] = useState(false);
   const [activeTab, setActiveTab] = useState(0);

   // Debounce apenas para campos de texto (busca e tipo)
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedBusca(filtros.busca);
         setDebouncedTipo(filtros.tipo);
      }, 300);
      return () => clearTimeout(timer);
   }, [filtros.busca, filtros.tipo]);

   // Rascunhos: sem nenhum filtro (lista completa)
   const ordensRascunho = useMemo(
      () => ordens.filter((o) => o.status === "Rascunho"),
      [ordens]
   );

   // Aprovadas: aplica filtros (debounce apenas em campos de texto)
   const ordensAprovadas = useMemo(() => {
      return ordens
         .filter((o) => o.status !== "Rascunho")
         .filter((ordem) => {
            // Campos de texto com debounce
            const matchBusca =
               !debouncedBusca ||
               ordem.numero
                  .toLowerCase()
                  .includes(debouncedBusca.toLowerCase()) ||
               ordem.etapas.some(
                  (e) =>
                     e.origem
                        .toLowerCase()
                        .includes(debouncedBusca.toLowerCase()) ||
                     e.destino
                        .toLowerCase()
                        .includes(debouncedBusca.toLowerCase())
               );
            const matchTipo =
               !debouncedTipo ||
               ordem.tipo.toLowerCase().includes(debouncedTipo.toLowerCase());

            // Campos de seleção/data sem debounce (atualização imediata)
            const matchStatus =
               filtros.status.length === 0 ||
               filtros.status.includes(ordem.status);
            const dataOrdem = ordem.etapas[0]?.dataDecolagem || "";
            const matchDataInicio =
               !filtros.dataInicio || dataOrdem >= filtros.dataInicio;
            const matchDataFim =
               !filtros.dataFim || dataOrdem <= filtros.dataFim;

            return (
               matchBusca &&
               matchTipo &&
               matchStatus &&
               matchDataInicio &&
               matchDataFim
            );
         });
   }, [
      ordens,
      debouncedBusca,
      debouncedTipo,
      filtros.status,
      filtros.dataInicio,
      filtros.dataFim,
   ]);

   const handleSaveOrdem = (ordem: OrdemMissao) => {
      if (selectedOrdem && !isCloning) {
         setOrdens(ordens.map((o) => (o.id === ordem.id ? ordem : o)));
      } else {
         setOrdens([ordem, ...ordens]);
      }
      setModalOpen(false);
      setSelectedOrdem(null);
      setIsCloning(false);
   };

   const handleOpenOrdem = (ordem: OrdemMissao) => {
      setSelectedOrdem(ordem);
      setIsCloning(false);
      setModalOpen(true);
   };

   const handleCloneOrdem = (ordem: OrdemMissao) => {
      setSelectedOrdem(ordem);
      setIsCloning(true);
      setModalOpen(true);
   };

   const clearFiltros = () => {
      setFiltros({
         busca: "",
         status: [],
         tipo: "",
         dataInicio: defaultDates.dataInicio,
         dataFim: defaultDates.dataFim,
      });
   };

   const handleTabChange = (tab: number) => {
      setActiveTab(tab);
      // Limpa filtro de status ao trocar de tab para evitar inconsistências
      if (filtros.status.length > 0) {
         setFiltros((prev) => ({ ...prev, status: [] }));
      }
   };

   return (
      <div className="min-h-screen text-gray-900">
         <div className="mx-auto p-2">
            {/* Header */}

            <header className="mb-3 flex items-center justify-between">
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Ordens de Missão
                  </h1>
                  <p className="text-sm text-gray-500">
                     Gerenciamento de Ordens
                  </p>
               </div>
               <button
                  onClick={() => {
                     setSelectedOrdem(null);
                     setModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 font-bold text-white shadow hover:bg-red-700"
               >
                  <span className="text-lg">+</span>
                  Nova Ordem de Missão
               </button>
            </header>

            {/* Tabs */}
            <Tabs
               onActiveTabChange={handleTabChange}
               variant="underline"
               theme={{
                  tablist: {
                     tabitem: {
                        base: "flex items-center justify-center rounded-t-lg p-4 text-sm font-medium first:ml-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-gray-400",
                        variant: {
                           underline: {
                              base: "rounded-t-lg",
                              active: {
                                 on: "active rounded-t-lg border-b-2 border-red-500 text-red-500",
                                 off: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600",
                              },
                           },
                        },
                     },
                  },
               }}
            >
               <TabItem
                  active={activeTab === 0}
                  title={
                     <span className="flex items-center gap-2">
                        Missões
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           {ordensAprovadas.length}
                        </span>
                     </span>
                  }
               >
                  {/* Filtros dentro da tab Aprovadas */}
                  <FiltrosOrdemComponent
                     filtros={filtros}
                     onFiltrosChange={setFiltros}
                     onClearFiltros={clearFiltros}
                  />
                  <p className="mb-3 text-sm text-gray-500">
                     {ordensAprovadas.length}{" "}
                     {ordensAprovadas.length === 1
                        ? "missão encontrada"
                        : "missões encontradas"}
                  </p>
                  <ListaOrdens
                     ordens={ordensAprovadas}
                     onOrdemClick={handleOpenOrdem}
                     onCloneOrdem={handleCloneOrdem}
                  />
               </TabItem>
               <TabItem
                  active={activeTab === 1}
                  title={
                     <span className="flex items-center gap-2">
                        Rascunhos
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                           {ordensRascunho.length}
                        </span>
                     </span>
                  }
               >
                  <p className="mb-3 text-sm text-gray-500">
                     {ordensRascunho.length}{" "}
                     {ordensRascunho.length === 1
                        ? "rascunho encontrado"
                        : "rascunhos encontrados"}
                  </p>
                  <ListaOrdens
                     ordens={ordensRascunho}
                     onOrdemClick={handleOpenOrdem}
                     onCloneOrdem={handleCloneOrdem}
                  />
               </TabItem>
            </Tabs>
         </div>

         {/* Modal */}
         <OrdemModal
            ordem={selectedOrdem}
            onSave={handleSaveOrdem}
            onClose={() => {
               setModalOpen(false);
               setSelectedOrdem(null);
               setIsCloning(false);
            }}
            isNew={!selectedOrdem || isCloning}
            isCloning={isCloning}
            isOpen={modalOpen}
         />
      </div>
   );
}

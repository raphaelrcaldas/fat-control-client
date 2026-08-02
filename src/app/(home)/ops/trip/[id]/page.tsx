"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Spinner } from "flowbite-react";
import clsx from "clsx";
import {
   HiUser,
   HiClipboardList,
   HiCheckCircle,
   HiXCircle,
   HiArrowLeft,
   HiIdentification,
} from "react-icons/hi";
import { useTrip, usePatchTrip } from "@/hooks/queries/useTrips";
import { useToast } from "@/app/context/toast";
import { PermBased } from "../../../hooks/usePermBased";
import { TripReadView } from "./components/TripReadView";
import { TripAudit } from "./components/TripAudit";
import { TripDetailSkeleton } from "./components/TripDetailSkeleton";

const TABS = [
   { key: "dados", label: "Dados Cadastrais", icon: HiUser },
   { key: "historico", label: "Histórico", icon: HiClipboardList },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function TripDetailsPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const tripId = Number(params.id);
   const [activeTab, setActiveTab] = useState<TabKey>("dados");

   const { data: trip, isLoading } = useTrip(tripId);
   const patchTrip = usePatchTrip();
   const { push } = useToast();

   async function toggleActive() {
      if (!trip) return;
      const newStatus = !trip.active;
      try {
         await patchTrip.mutateAsync({
            id: tripId,
            data: { active: newStatus },
         });
         push({
            message: `Tripulante ${newStatus ? "ativado" : "desativado"}`,
            type: "success",
         });
      } catch (err: unknown) {
         push({
            message:
               err instanceof Error ? err.message : "Erro ao alterar status",
            type: "error",
         });
      }
   }

   if (isLoading) {
      return <TripDetailSkeleton />;
   }

   if (!trip) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">Tripulante não encontrado.</p>
            <Button color="light" onClick={() => router.push("/ops/trip")}>
               Voltar para lista de tripulantes
            </Button>
         </div>
      );
   }

   return (
      <div className="flex flex-col space-y-2">
         {/* Perfil do Tripulante */}
         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="from-primary-500 to-primary-700 bg-linear-to-r px-6 py-4">
               <div className="flex flex-wrap items-center gap-4">
                  {/* Voltar */}
                  <button
                     onClick={() => router.back()}
                     className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                     title="Voltar"
                  >
                     <HiArrowLeft size={24} />
                  </button>

                  {/* Avatar */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm">
                     <span className="text-xl font-bold text-white">
                        {trip.user.posto?.short?.toUpperCase() || "??"}
                     </span>
                  </div>

                  {/* Nome e identificação */}
                  <div className="min-w-0 flex-1">
                     <div className="flex items-center gap-2">
                        <h1 className="truncate text-xl font-bold text-white uppercase">
                           {trip.user.nome_guerra}
                        </h1>
                        <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                           #{trip.trig.toUpperCase()}
                        </span>
                     </div>
                     <p className="text-primary-100 truncate text-sm capitalize">
                        {trip.user.nome_completo}
                     </p>
                  </div>

                  {/* Ações — à direita no desktop; quebram para uma segunda
                      linha no mobile em vez de sumir (esconder tirava do
                      celular a ativação do tripulante e o link da ficha). */}
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                     <PermBased resource="trips" requiredPerm="update">
                        <Button
                           color="light"
                           size="sm"
                           onClick={toggleActive}
                           disabled={patchTrip.isPending}
                           title={
                              trip.active
                                 ? "Clique para desativar"
                                 : "Clique para ativar"
                           }
                        >
                           {patchTrip.isPending ? (
                              <Spinner size="sm" color="primary" />
                           ) : (
                              <>
                                 {trip.active ? (
                                    <HiCheckCircle className="mr-1.5 h-4 w-4 text-green-600" />
                                 ) : (
                                    <HiXCircle className="mr-1.5 h-4 w-4 text-gray-500" />
                                 )}
                                 {trip.active ? "Ativo" : "Inativo"}
                              </>
                           )}
                        </Button>
                     </PermBased>
                     <Button
                        as={Link}
                        href={`/users/${trip.user.id}`}
                        color="light"
                        size="sm"
                        title="Ver ficha do usuário"
                     >
                        <HiIdentification className="mr-1.5 h-4 w-4" />
                        Ficha do usuário
                     </Button>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
               <nav
                  className="flex gap-0 overflow-x-auto px-6"
                  aria-label="Abas do tripulante"
               >
                  {TABS.map((tab) => (
                     <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                           "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                           activeTab === tab.key
                              ? "border-primary-500 text-primary-600"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        )}
                     >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                     </button>
                  ))}
               </nav>
            </div>

            {/* Conteúdo da Tab */}
            <div className="p-3">
               {activeTab === "dados" && (
                  <TripReadView trip={trip} tripId={tripId} />
               )}
               {activeTab === "historico" && <TripAudit tripId={tripId} />}
            </div>
         </div>
      </div>
   );
}

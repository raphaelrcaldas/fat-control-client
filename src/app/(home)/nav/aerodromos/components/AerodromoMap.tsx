"use client";

import { useEffect, useState, useRef } from "react";
// Removemos os imports dynamic internos, pois o pai já trata o SSR
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HiMap } from "react-icons/hi";

// --- TIPOS DE MAPAS DISPONÍVEIS ---
const mapTypes = {
   osm: {
      name: "Padrão",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   },
   satellite: {
      name: "Satélite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
   },
};

export type MapType = keyof typeof mapTypes;

// --- CONSTANTES ---
const DEFAULT_CENTER: [number, number] = [-15.79, -47.86];
const DEFAULT_ZOOM = 4;

// --- HELPER: Ícone Customizado ---
const createCustomIcon = () => {
   return L.divIcon({
      className: "custom-marker",
      html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-md bg-red-600 flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
           </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -28],
   });
};

// --- HELPER COMPONENT: Controlador de Voo ---
const FlyToLocation = ({
   target,
   defaultCenter,
   resetKey,
}: {
   target: any;
   defaultCenter: [number, number];
   resetKey: number;
}) => {
   const map = useMap();

   useEffect(() => {
      // Aumenta o delay para garantir que o mapa está completamente pronto
      const timer = setTimeout(() => {
         try {
            // Validações rigorosas
            if (!map) return;

            // Verifica se o mapa tem o método flyTo
            if (typeof map.flyTo !== 'function') return;

            if (target && typeof target.latitude === 'number' && typeof target.longitude === 'number' && !isNaN(target.latitude) && !isNaN(target.longitude)) {
               const targetLat = Number(target.latitude);
               const targetLng = Number(target.longitude);

               if (isFinite(targetLat) && isFinite(targetLng)) {
                  map.flyTo([targetLat, targetLng], 13, {
                     duration: 1.5,
                  });
               }
            } else {
               // Validação extra do defaultCenter com valores hardcoded como fallback
               const centerLat = defaultCenter?.[0] ?? -15.79;
               const centerLng = defaultCenter?.[1] ?? -47.86;

               if (isFinite(centerLat) && isFinite(centerLng) && !isNaN(centerLat) && !isNaN(centerLng)) {
                  map.flyTo([centerLat, centerLng], 4, {
                     duration: 1.5,
                  });
               }
            }
         } catch (error) {
            // Silencia o erro para evitar poluição do console
            // O mapa continuará funcionando normalmente sem o flyTo
         }
      }, 250);

      return () => clearTimeout(timer);
   }, [target, defaultCenter, resetKey, map]);

   return null;
};

// --- COMPONENTE PRINCIPAL ---
interface AerodromoMapProps {
   aerodromos: any[];
   selectedAero: any;
   resetKey: number;
}

export default function AerodromoMap({
   aerodromos,
   selectedAero,
   resetKey,
}: AerodromoMapProps) {
   // Estado para controlar o tipo de mapa selecionado
   const [selectedMapType, setSelectedMapType] = useState<MapType>("osm");
   const [showMapSelector, setShowMapSelector] = useState(false);

   // Ref para detectar cliques fora do dropdown
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Obter configurações do mapa atual
   const currentMap = mapTypes[selectedMapType];

   // Fechar dropdown ao clicar fora
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setShowMapSelector(false);
         }
      };

      if (showMapSelector) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [showMapSelector]);

   return (
      <div className='h-full w-full absolute inset-0 z-0'>
         <MapContainer
            // @ts-expect-error - MapContainer props typing issue
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
         >
            <TileLayer key={selectedMapType} url={currentMap.url} />

            <FlyToLocation
               target={selectedAero}
               defaultCenter={DEFAULT_CENTER}
               resetKey={resetKey}
            />

            {aerodromos
               .filter((aero) => {
                  // Filtra aeródromos com coordenadas válidas
                  return (
                     typeof aero.latitude === 'number' &&
                     typeof aero.longitude === 'number' &&
                     isFinite(aero.latitude) &&
                     isFinite(aero.longitude) &&
                     !isNaN(aero.latitude) &&
                     !isNaN(aero.longitude)
                  );
               })
               .map((aero) => (
                  <Marker
                     key={aero.id}
                     position={[aero.latitude, aero.longitude]}
                     // @ts-expect-error - Marker icon prop typing issue
                     icon={createCustomIcon()}
                  >
                     <Popup>
                        <div className='text-center'>
                           <strong className='block text-sm text-gray-900'>
                              {aero.nome}
                           </strong>
                           <span className='text-xs text-gray-500 font-mono'>
                              {aero.codigo_icao}
                           </span>
                           <div className='mt-1 text-xs'>
                              {aero.cidade
                                 ? `${aero.cidade.nome} - ${aero.cidade.uf}`
                                 : aero.cidade_manual || 'Localização não informada'}
                           </div>
                        </div>
                     </Popup>
                  </Marker>
               ))}
         </MapContainer>

         {/* Controle de Seleção de Mapa */}
         <div
            className='absolute top-4 left-1/2 -translate-x-1/2 z-[500]'
            ref={dropdownRef}
         >
            <div className='relative'>
               {/* Botão para abrir o seletor */}
               <button
                  onClick={() => setShowMapSelector(!showMapSelector)}
                  className='bg-white/95 backdrop-blur p-2.5 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors group flex items-center gap-2'
                  title='Selecionar tipo de mapa'
               >
                  <HiMap className='w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors' />
                  <span className='text-sm font-medium text-gray-700'>
                     {currentMap.name}
                  </span>
               </button>

               {/* Dropdown com opções de mapas */}
               {showMapSelector && (
                  <div className='absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[180px]'>
                     {(Object.keys(mapTypes) as MapType[]).map((type) => (
                        <button
                           key={type}
                           onClick={() => {
                              setSelectedMapType(type);
                              setShowMapSelector(false);
                           }}
                           className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                              selectedMapType === type
                                 ? "bg-red-50 text-red-700 font-semibold"
                                 : "text-gray-700"
                           }`}
                        >
                           {selectedMapType === type && (
                              <div className='w-2 h-2 rounded-full bg-red-600' />
                           )}
                           <span
                              className={selectedMapType !== type ? "ml-4" : ""}
                           >
                              {mapTypes[type].name}
                           </span>
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

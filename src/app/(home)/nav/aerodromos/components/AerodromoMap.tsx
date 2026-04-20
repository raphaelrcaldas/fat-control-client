"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HiMap } from "react-icons/hi";
import { Aerodromo } from "../types";

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

const DEFAULT_CENTER: [number, number] = [-15.79, -52.86];
const DEFAULT_ZOOM = 4;

const CUSTOM_ICON = L.divIcon({
   className: "custom-marker",
   html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-md bg-red-600 flex items-center justify-center">
           <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>`,
   iconSize: [24, 24],
   iconAnchor: [12, 24],
   popupAnchor: [0, -28],
});

const MapResizer = () => {
   const map = useMap();

   useEffect(() => {
      const container = map.getContainer();

      const timer = setTimeout(() => {
         map.invalidateSize();
      }, 100);

      const observer = new ResizeObserver(() => {
         map.invalidateSize();
      });
      observer.observe(container);

      return () => {
         clearTimeout(timer);
         observer.disconnect();
      };
   }, [map]);

   return null;
};

const hasValidCoords = (
   aero: Aerodromo | null
): aero is Aerodromo & { latitude: number; longitude: number } => {
   if (!aero) return false;
   const { latitude, longitude } = aero;
   return (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      isFinite(latitude) &&
      isFinite(longitude)
   );
};

const FlyToLocation = ({
   target,
   defaultCenter,
   resetKey,
}: {
   target: Aerodromo | null;
   defaultCenter: [number, number];
   resetKey: number;
}) => {
   const map = useMap();

   useEffect(() => {
      const timer = setTimeout(() => {
         try {
            if (typeof map.flyTo !== "function") return;

            if (hasValidCoords(target)) {
               map.flyTo([target.latitude, target.longitude], 13, {
                  duration: 1.5,
               });
            } else {
               map.flyTo(defaultCenter, DEFAULT_ZOOM, { duration: 1.5 });
            }
         } catch (error) {
            if (process.env.NODE_ENV !== "production") {
               console.warn("[AerodromoMap] flyTo falhou:", error);
            }
         }
      }, 250);

      return () => clearTimeout(timer);
   }, [target, defaultCenter, resetKey, map]);

   return null;
};

interface AerodromoMapProps {
   aerodromos: Aerodromo[];
   selectedAero: Aerodromo | null;
   resetKey: number;
}

export default function AerodromoMap({
   aerodromos,
   selectedAero,
   resetKey,
}: AerodromoMapProps) {
   const [selectedMapType, setSelectedMapType] = useState<MapType>("osm");
   const [showMapSelector, setShowMapSelector] = useState(false);

   const dropdownRef = useRef<HTMLDivElement>(null);

   const currentMap = mapTypes[selectedMapType];

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
      <div className="absolute inset-0 z-0 h-full w-full">
         <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
         >
            <TileLayer key={selectedMapType} url={currentMap.url} />

            <MapResizer />

            <FlyToLocation
               target={selectedAero}
               defaultCenter={DEFAULT_CENTER}
               resetKey={resetKey}
            />

            {aerodromos.filter(hasValidCoords).map((aero) => (
               <Marker
                  key={aero.id}
                  position={[aero.latitude, aero.longitude]}
                  icon={CUSTOM_ICON}
               >
                  <Popup>
                     <div className="text-center">
                        <strong className="block text-sm text-gray-900">
                           {aero.nome}
                        </strong>
                        <span className="font-mono text-xs text-gray-500">
                           {aero.codigo_icao}
                        </span>
                        <div className="mt-1 text-xs">
                           {aero.cidade
                              ? `${aero.cidade.nome} - ${aero.cidade.uf}`
                              : aero.cidade_manual ||
                                "Localização não informada"}
                        </div>
                     </div>
                  </Popup>
               </Marker>
            ))}
         </MapContainer>

         <div
            className="absolute top-4 left-1/2 z-500 -translate-x-1/2"
            ref={dropdownRef}
         >
            <div className="relative">
               <button
                  onClick={() => setShowMapSelector(!showMapSelector)}
                  className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 p-2.5 shadow-lg backdrop-blur transition-colors hover:bg-gray-50"
                  title="Selecionar tipo de mapa"
               >
                  <HiMap className="h-5 w-5 text-gray-600 transition-colors group-hover:text-red-600" />
                  <span className="text-sm font-medium text-gray-700">
                     {currentMap.name}
                  </span>
               </button>

               {showMapSelector && (
                  <div className="absolute top-full left-1/2 mt-2 min-w-45 -translate-x-1/2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                     {(Object.keys(mapTypes) as MapType[]).map((type) => (
                        <button
                           key={type}
                           onClick={() => {
                              setSelectedMapType(type);
                              setShowMapSelector(false);
                           }}
                           className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                              selectedMapType === type
                                 ? "bg-red-50 font-semibold text-red-700"
                                 : "text-gray-700"
                           }`}
                        >
                           {selectedMapType === type && (
                              <div className="h-2 w-2 rounded-full bg-red-600" />
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

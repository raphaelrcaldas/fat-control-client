import {
   MdAir,
   MdVisibility,
   MdCloud,
   MdThermostat,
   MdSpeed,
   MdSchedule,
   MdWaves,
} from "react-icons/md";
import { WiThunderstorm, WiRain, WiFog, WiSnow } from "react-icons/wi";
import { MetarInfoTile } from "./MetarInfoTile";
import type { ParsedMetar } from "./types";

function WxIcon({ wxList }: { wxList: string[] }) {
   const combined = wxList.join(" ").toLowerCase();
   if (combined.includes("trovoada"))
      return <WiThunderstorm className="text-amber-500" size={20} />;
   if (combined.includes("chuva") || combined.includes("garoa"))
      return <WiRain className="text-blue-500" size={20} />;
   if (combined.includes("nevoeiro") || combined.includes("névoa"))
      return <WiFog className="text-gray-400" size={20} />;
   if (combined.includes("neve"))
      return <WiSnow className="text-sky-300" size={20} />;
   return <MdWaves className="text-gray-400" />;
}

export function ParsedView({ metar }: { metar: ParsedMetar }) {
   const windDir =
      metar.wind == null
         ? "—"
         : metar.wind.direction === "VRB"
           ? "VRB"
           : `${String(metar.wind.direction).padStart(3, "0")}°`;

   const windSpeed =
      metar.wind == null
         ? "—"
         : metar.wind.gust
           ? `${metar.wind.speed}G${metar.wind.gust} ${metar.wind.unit}`
           : `${metar.wind.speed} ${metar.wind.unit}`;

   const cloudText = metar.cavok
      ? "CAVOK"
      : metar.skyCondition === "SKC" || metar.skyCondition === "CLR"
        ? "Céu limpo"
        : metar.skyCondition === "NSC" || metar.skyCondition === "NCD"
          ? "Sem nuvens significativas"
          : metar.clouds.length > 0
            ? metar.clouds
                 .map(
                    (c) =>
                       `${c.coverText} ${c.height.toLocaleString("pt-BR")} ft${c.type ? ` (${c.type})` : ""}`
                 )
                 .join(" · ")
            : "—";

   const tempText = metar.temp !== null ? `${metar.temp}°C` : "—";
   const dewText = metar.dew !== null ? `DP: ${metar.dew}°C` : undefined;

   const trendLabels: Record<string, string> = {
      NOSIG: "Sem mudança significativa",
      BECMG: "Tornando-se",
      TEMPO: "Temporariamente",
   };

   return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
         {/* Vento */}
         <MetarInfoTile
            icon={<MdAir />}
            label="Vento"
            value={windDir}
            sub={windSpeed}
            highlight={metar.wind?.gust !== undefined}
         />

         {/* Visibilidade */}
         <MetarInfoTile
            icon={<MdVisibility />}
            label="Visibilidade"
            value={metar.vis?.text ?? "—"}
            highlight={
               metar.vis !== null && !metar.cavok && metar.vis.meters < 5000
            }
         />

         {/* Nuvens */}
         <MetarInfoTile
            icon={<MdCloud />}
            label="Nuvens"
            value={
               metar.cavok
                  ? "CAVOK"
                  : metar.skyCondition === "SKC" || metar.skyCondition === "CLR"
                    ? "Céu limpo"
                    : metar.clouds.length > 0
                      ? `${metar.clouds[0].coverText} ${metar.clouds[0].height.toLocaleString("pt-BR")} ft`
                      : "—"
            }
            sub={
               metar.clouds.length > 1
                  ? metar.clouds
                       .slice(1)
                       .map(
                          (c) =>
                             `${c.cover} ${c.height.toLocaleString("pt-BR")} ft`
                       )
                       .join(" · ")
                  : undefined
            }
            highlight={metar.clouds.some(
               (c) =>
                  (c.cover === "BKN" || c.cover === "OVC") && c.height < 1000
            )}
         />

         {/* Fenômenos */}
         {metar.weather.length > 0 && (
            <MetarInfoTile
               icon={<WxIcon wxList={metar.weather} />}
               label="Fenômenos"
               value={metar.weather[0]}
               sub={metar.weather.slice(1).join(" · ") || undefined}
               highlight={metar.weather.some((w) =>
                  w.toLowerCase().includes("trovoada")
               )}
            />
         )}

         {/* Temperatura */}
         <MetarInfoTile
            icon={<MdThermostat />}
            label="Temperatura"
            value={tempText}
            sub={dewText}
         />

         {/* QNH */}
         {metar.qnh !== null && (
            <MetarInfoTile
               icon={<MdSpeed />}
               label="QNH"
               value={`${metar.qnh} hPa`}
               highlight={metar.qnh < 990 || metar.qnh > 1040}
            />
         )}

         {/* Tendência */}
         {metar.trend && (
            <MetarInfoTile
               icon={<MdSchedule />}
               label="Tendência"
               value={metar.trend}
               sub={trendLabels[metar.trend]}
            />
         )}
      </div>
   );
}

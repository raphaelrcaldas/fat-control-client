import {
   CLOUD_COVER,
   WX_DESCRIPTOR,
   WX_PRECIP,
   WX_OBSCUR,
   WX_OTHER,
} from "./constants";
import type { ParsedMetar } from "./types";

export function decodeWx(token: string): string {
   const intensity = token.startsWith("+")
      ? "Forte "
      : token.startsWith("-")
        ? "Leve "
        : "";
   const code = token.replace(/^[+-]/, "");

   const parts: string[] = [];
   let remaining = code;

   // Descriptors (2-char prefix)
   for (const [k, v] of Object.entries(WX_DESCRIPTOR)) {
      if (remaining.startsWith(k)) {
         parts.push(v);
         remaining = remaining.slice(k.length);
         break;
      }
   }

   // Precipitation or obscuration
   for (const [k, v] of Object.entries({
      ...WX_PRECIP,
      ...WX_OBSCUR,
      ...WX_OTHER,
   })) {
      if (remaining.includes(k)) {
         parts.push(v);
         remaining = remaining.replace(k, "");
      }
   }

   if (parts.length === 0) return token;
   return `${intensity}${parts.join(" ")}`;
}

export function parseTemp(raw: string): number {
   return raw.startsWith("M") ? -parseInt(raw.slice(1)) : parseInt(raw);
}

export function parseMetar(raw: string): ParsedMetar {
   const tokens = raw.trim().split(/\s+/);
   let i = 0;

   const result: ParsedMetar = {
      station: "",
      day: "",
      time: "",
      wind: null,
      vis: null,
      cavok: false,
      weather: [],
      clouds: [],
      skyCondition: null,
      temp: null,
      dew: null,
      qnh: null,
      trend: null,
      flightCategory: "VFR",
   };

   // Station
   result.station = tokens[i++] ?? "";

   // AUTO / COR
   if (tokens[i] === "AUTO" || tokens[i] === "COR") i++;

   // Datetime: DDHHMMZ
   const dtMatch = tokens[i]?.match(/^(\d{2})(\d{2})(\d{2})Z$/);
   if (dtMatch) {
      result.day = `Dia ${dtMatch[1]}`;
      result.time = `${dtMatch[2]}:${dtMatch[3]}Z`;
      i++;
   }

   // Wind: DDDSSKT, DDDSSGSSGKT, VRBSSKT, /////KT
   const windMatch = tokens[i]?.match(
      /^(VRB|\d{3})(\d{2,3})(?:G(\d{2,3}))?(KT|MPS|KMH)$/
   );
   if (windMatch) {
      result.wind = {
         direction: windMatch[1] === "VRB" ? "VRB" : parseInt(windMatch[1]),
         speed: parseInt(windMatch[2]),
         gust: windMatch[3] ? parseInt(windMatch[3]) : undefined,
         unit: windMatch[4],
      };
      i++;
   }

   // Wind variation (e.g. 280V350) - skip
   if (/^\d{3}V\d{3}$/.test(tokens[i] ?? "")) i++;

   // CAVOK
   if (tokens[i] === "CAVOK") {
      result.cavok = true;
      result.vis = { meters: 10000, text: "CAVOK" };
      i++;
   } else {
      // Visibility
      const visMatch = tokens[i]?.match(/^(\d{4})$/);
      const visNDV = tokens[i]?.match(/^(\d{4})NDV$/);
      if (visMatch || visNDV) {
         const m = parseInt((visMatch ?? visNDV)![1]);
         result.vis = {
            meters: m,
            text:
               m >= 9999 ? "≥10 km" : m >= 1000 ? `${m / 1000} km` : `${m} m`,
         };
         i++;
      }

      // RVR (R28L/1000U) - skip
      while (/^R\d+/.test(tokens[i] ?? "")) i++;

      // Weather phenomena
      const WX_RE =
         /^(\+|-|VC)?(MI|PR|BC|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|BR|FG|FU|VA|DU|SA|HZ|PO|SQ|FC|SS|DS)+$/;
      while (WX_RE.test(tokens[i] ?? "")) {
         result.weather.push(decodeWx(tokens[i]!));
         i++;
      }

      // Clouds
      const SKY_COND = /^(FEW|SCT|BKN|OVC)(\d{3})(CB|TCU)?$/;
      const FIXED = ["SKC", "CLR", "NSC", "NCD"];
      while (
         SKY_COND.test(tokens[i] ?? "") ||
         FIXED.includes(tokens[i] ?? "")
      ) {
         if (FIXED.includes(tokens[i]!)) {
            result.skyCondition = tokens[i]!;
            i++;
            break;
         }
         const m = tokens[i]!.match(SKY_COND)!;
         result.clouds.push({
            cover: m[1],
            coverText: CLOUD_COVER[m[1]] ?? m[1],
            height: parseInt(m[2]) * 100,
            type: m[3],
         });
         i++;
      }
   }

   // Temperature/Dewpoint: T1/T2 or M01/M02
   const tdMatch = tokens[i]?.match(/^(M?\d{2})\/(M?\d{2})$/);
   if (tdMatch) {
      result.temp = parseTemp(tdMatch[1]);
      result.dew = parseTemp(tdMatch[2]);
      i++;
   }

   // QNH: Q1013 or A2992
   const qMatch = tokens[i]?.match(/^Q(\d{4})$/);
   const aMatch = tokens[i]?.match(/^A(\d{4})$/);
   if (qMatch) {
      result.qnh = parseInt(qMatch[1]);
      i++;
   } else if (aMatch) {
      result.qnh = Math.round(parseInt(aMatch[1]) * 0.338639);
      i++;
   }

   // Trend
   const trendTokens = ["NOSIG", "BECMG", "TEMPO"];
   if (trendTokens.includes(tokens[i] ?? "")) {
      result.trend = tokens[i]!;
   }

   // Flight category
   const lowestCeiling = result.cavok
      ? 9999
      : (result.clouds
           .filter((c) => c.cover === "BKN" || c.cover === "OVC")
           .map((c) => c.height)
           .sort((a, b) => a - b)[0] ?? 9999);

   const visMet = result.vis?.meters ?? 9999;

   if (lowestCeiling < 500 || visMet < 1600) result.flightCategory = "LIFR";
   else if (lowestCeiling < 1000 || visMet < 3000)
      result.flightCategory = "IFR";
   else if (lowestCeiling < 3000 || visMet < 5000)
      result.flightCategory = "MVFR";
   else result.flightCategory = "VFR";

   return result;
}

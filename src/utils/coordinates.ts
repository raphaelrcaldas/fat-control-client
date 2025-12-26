/**
 * Utilitários para conversão e validação de coordenadas geográficas
 * Suporta múltiplos formatos: DD, DMS, DMM
 */

export interface CoordinateParseResult {
   decimal: number;
   isValid: boolean;
   error?: string;
}

/**
 * Converte DMS (Degrees Minutes Seconds) para Decimal
 * Ex: 15° 52' 11" S → -15.869722
 */
function dmsToDecimal(
   degrees: number,
   minutes: number,
   seconds: number,
   direction: string
): number {
   let decimal = Math.abs(degrees) + minutes / 60 + seconds / 3600;

   if (direction === "S" || direction === "W") {
      decimal = -decimal;
   }

   return decimal;
}

/**
 * Converte DMM (Degrees Decimal Minutes) para Decimal
 * Ex: 15° 52.183' S → -15.869722
 */
function dmmToDecimal(
   degrees: number,
   minutes: number,
   direction: string
): number {
   let decimal = Math.abs(degrees) + minutes / 60;

   if (direction === "S" || direction === "W") {
      decimal = -decimal;
   }

   return decimal;
}

/**
 * Parse coordenada em diversos formatos
 */
export function parseCoordinate(
   input: string,
   type: "latitude" | "longitude"
): CoordinateParseResult {
   if (!input || input.trim() === "") {
      return { decimal: 0, isValid: false, error: "Coordenada vazia" };
   }

   const cleaned = input.trim().toUpperCase();

   // Tenta parse como decimal simples primeiro
   const simpleDecimal = parseFloat(cleaned.replace(",", "."));
   if (!isNaN(simpleDecimal)) {
      const isValid = validateCoordinate(simpleDecimal, type);
      return {
         decimal: simpleDecimal,
         isValid,
         error: isValid ? undefined : "Coordenada fora do range válido",
      };
   }

   // Regex para DMS: 15° 52' 11" S ou 15°52'11"S ou 15 52 11 S
   const dmsRegex =
      /^(-?\d+)[°º\s]+(\d+)['\s]+(\d+(?:\.\d+)?)["\s]*([NSEW])?$/i;
   const dmsMatch = cleaned.match(dmsRegex);

   if (dmsMatch) {
      const degrees = parseInt(dmsMatch[1]);
      const minutes = parseInt(dmsMatch[2]);
      const seconds = parseFloat(dmsMatch[3]);
      const direction =
         dmsMatch[4] || (degrees < 0 ? (type === "latitude" ? "S" : "W") : "");

      if (minutes >= 60 || seconds >= 60) {
         return {
            decimal: 0,
            isValid: false,
            error: "Minutos ou segundos inválidos (devem ser < 60)",
         };
      }

      const decimal = dmsToDecimal(degrees, minutes, seconds, direction);
      const isValid = validateCoordinate(decimal, type);

      return {
         decimal,
         isValid,
         error: isValid ? undefined : "Coordenada fora do range válido",
      };
   }

   // Regex para DMM: 15° 52.183' S ou 15°52.183'S
   const dmmRegex = /^(-?\d+)[°º\s]+(\d+(?:\.\d+)?)['\s]*([NSEW])?$/i;
   const dmmMatch = cleaned.match(dmmRegex);

   if (dmmMatch) {
      const degrees = parseInt(dmmMatch[1]);
      const minutes = parseFloat(dmmMatch[2]);
      const direction =
         dmmMatch[3] || (degrees < 0 ? (type === "latitude" ? "S" : "W") : "");

      if (minutes >= 60) {
         return {
            decimal: 0,
            isValid: false,
            error: "Minutos inválidos (devem ser < 60)",
         };
      }

      const decimal = dmmToDecimal(degrees, minutes, direction);
      const isValid = validateCoordinate(decimal, type);

      return {
         decimal,
         isValid,
         error: isValid ? undefined : "Coordenada fora do range válido",
      };
   }

   // Formato com direção no final: -15.869722 S ou 47.920556 W
   const decimalWithDirectionRegex = /^(-?\d+(?:\.\d+)?)\s*([NSEW])$/i;
   const decimalMatch = cleaned.match(decimalWithDirectionRegex);

   if (decimalMatch) {
      let decimal = parseFloat(decimalMatch[1]);
      const direction = decimalMatch[2];

      if (direction === "S" || direction === "W") {
         decimal = -Math.abs(decimal);
      } else {
         decimal = Math.abs(decimal);
      }

      const isValid = validateCoordinate(decimal, type);
      return {
         decimal,
         isValid,
         error: isValid ? undefined : "Coordenada fora do range válido",
      };
   }

   return {
      decimal: 0,
      isValid: false,
      error: "Formato não reconhecido",
   };
}

/**
 * Valida se coordenada está no range válido
 */
function validateCoordinate(
   value: number,
   type: "latitude" | "longitude"
): boolean {
   if (type === "latitude") {
      return value >= -90 && value <= 90;
   } else {
      return value >= -180 && value <= 180;
   }
}

/**
 * Formata coordenada decimal para display
 */
export function formatCoordinate(
   decimal: number,
   type: "latitude" | "longitude",
   decimals: number = 6
): string {
   return decimal.toFixed(decimals);
}

/**
 * Converte decimal para DMS
 */
export function decimalToDMS(
   decimal: number,
   type: "latitude" | "longitude"
): string {
   const absolute = Math.abs(decimal);
   const degrees = Math.floor(absolute);
   const minutesDecimal = (absolute - degrees) * 60;
   const minutes = Math.floor(minutesDecimal);
   const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);

   const direction =
      type === "latitude"
         ? decimal >= 0
            ? "N"
            : "S"
         : decimal >= 0
           ? "E"
           : "W";

   return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Exemplos de formatos aceitos
 */
export const COORDINATE_EXAMPLES = {
   latitude: [
      "-15.869722 (Decimal)",
      "15° 52' 11\" S (DMS)",
      "15° 52.183' S (DMM)",
      "-15.869722 S",
   ],
   longitude: [
      "-47.920556 (Decimal)",
      "47° 55' 14\" W (DMS)",
      "47° 55.233' W (DMM)",
      "-47.920556 W",
   ],
};

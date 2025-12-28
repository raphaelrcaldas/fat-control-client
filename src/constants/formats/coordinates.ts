/**
 * Exemplos de formatos de coordenadas aceitos
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
} as const;

export type CoordinateType = "latitude" | "longitude";

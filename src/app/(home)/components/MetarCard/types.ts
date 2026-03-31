export interface ParsedMetar {
   station: string;
   day: string;
   time: string;
   wind: {
      direction: number | "VRB";
      speed: number;
      gust?: number;
      unit: string;
   } | null;
   vis: { meters: number; text: string } | null;
   cavok: boolean;
   weather: string[];
   clouds: {
      cover: string;
      coverText: string;
      height: number;
      type?: string;
   }[];
   skyCondition: string | null;
   temp: number | null;
   dew: number | null;
   qnh: number | null;
   trend: string | null;
   flightCategory: "VFR" | "MVFR" | "IFR" | "LIFR";
}

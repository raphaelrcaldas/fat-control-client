export interface FunctionColor {
   bg: string;
   border: string;
   text: string;
   label: string;
}

export interface FunctionColors {
   mc: FunctionColor;
   lm: FunctionColor;
   os: FunctionColor;
   oe: FunctionColor;
   tf: FunctionColor;
   pil: FunctionColor;
}

export interface Aeronave {
   id: number;
   matricula: string;
}

export interface MissionGroup {
   id: number;
   short: string;
   long: string;
}

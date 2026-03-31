export const CLOUD_COVER: Record<string, string> = {
   FEW: "Poucas",
   SCT: "Esparsas",
   BKN: "Nublado",
   OVC: "Encoberto",
};

export const WX_DESCRIPTOR: Record<string, string> = {
   MI: "Raso",
   PR: "Parcial",
   BC: "Banco de",
   DR: "Deriva de",
   BL: "Levantado",
   SH: "Pancadas de",
   TS: "Trovoada",
   FZ: "Congelante",
};

export const WX_PRECIP: Record<string, string> = {
   DZ: "Garoa",
   RA: "Chuva",
   SN: "Neve",
   SG: "Grãos de neve",
   IC: "Cristais de gelo",
   PL: "Granizo",
   GR: "Granizo forte",
   GS: "Granizo suave",
};

export const WX_OBSCUR: Record<string, string> = {
   BR: "Névoa úmida",
   FG: "Nevoeiro",
   FU: "Fumaça",
   VA: "Cinzas vulcânicas",
   DU: "Poeira",
   SA: "Areia",
   HZ: "Névoa seca",
};

export const WX_OTHER: Record<string, string> = {
   PO: "Redemoinhos",
   SQ: "Rajadas",
   FC: "Tromba d'água",
   SS: "Tempestade de areia",
   DS: "Tempestade de poeira",
};

export const CATEGORY_STYLE: Record<
   string,
   { bg: string; text: string; dot: string; label: string }
> = {
   VFR: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
      label: "VFR",
   },
   MVFR: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      dot: "bg-blue-500",
      label: "MVFR",
   },
   IFR: {
      bg: "bg-red-100",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "IFR",
   },
   LIFR: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      dot: "bg-purple-500",
      label: "LIFR",
   },
};


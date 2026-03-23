import { format as maskFormat } from "@react-input/mask";

const saramMaskOptions = {
   mask: "______-_",
   replacement: { _: /\d/ },
};

export function formatSaram(value: string | number): string {
   const clean = String(value).replace(/\D/g, "").slice(0, 7);
   if (!clean) return "";
   return maskFormat(clean, saramMaskOptions);
}

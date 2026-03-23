import { format as maskFormat } from "@react-input/mask";

const cpfMaskOptions = {
   mask: "___.___.___-__",
   replacement: { _: /\d/ },
};

export function formatCpf(value: string): string {
   const clean = value.replace(/\D/g, "").slice(0, 11);
   if (!clean) return "";
   return maskFormat(clean, cpfMaskOptions);
}

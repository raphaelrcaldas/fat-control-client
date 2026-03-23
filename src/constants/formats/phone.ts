import { format as maskFormat } from "@react-input/mask";

const phoneOptions10 = {
   mask: "(__) ____-____",
   replacement: { _: /\d/ },
};

const phoneOptions11 = {
   mask: "(__) _____-____",
   replacement: { _: /\d/ },
};

export const phoneMaskConfig = {
   mask: "(__) _____-____" as const,
   replacement: { _: /\d/ },
   modify: (data: { value: string; inputType: string }) => {
      const digits = data.value.replace(/\D/g, "");
      if (digits.length >= 10 && data.inputType === "insert") {
         return { mask: "(__) _____-____" };
      }
      if (digits.length > 10) {
         return { mask: "(__) _____-____" };
      }
      return { mask: "(__) ____-____" };
   },
};

export function formatPhone(digits: string): string {
   const clean = digits.replace(/\D/g, "");
   if (!clean) return "";
   if (clean.length <= 10) return maskFormat(clean, phoneOptions10);
   return maskFormat(clean, phoneOptions11);
}

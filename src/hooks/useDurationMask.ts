export function formatDuration(value: string): string {
   const cleaned = value.replace(/\D/g, "");

   if (cleaned.length === 0) return "";
   if (cleaned.length <= 2) return cleaned;

   const hours = cleaned.slice(0, 2);
   const minutes = cleaned.slice(2, 4);

   const h = Math.min(parseInt(hours) || 0, 23);
   const m = Math.min(parseInt(minutes) || 0, 59);

   return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function handleDurationInput(
   value: string,
   onChange: (value: string) => void
) {
   const formatted = formatDuration(value);
   onChange(formatted);
}

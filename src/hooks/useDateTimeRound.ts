export function roundToNearestFiveMinutes(dateTimeString: string): string {
   if (!dateTimeString) return "";

   const date = new Date(dateTimeString);
   const minutes = date.getMinutes();
   const roundedMinutes = Math.round(minutes / 5) * 5;

   date.setMinutes(roundedMinutes);
   date.setSeconds(0);
   date.setMilliseconds(0);

   return date.toISOString();
}

export function useDateTimeRound() {
   const handleDateTimeChange = (
      value: string,
      onChange: (value: string) => void
   ) => {
      if (!value) {
         onChange("");
         return;
      }

      const rounded = roundToNearestFiveMinutes(value);
      onChange(rounded);
   };

   return { handleDateTimeChange };
}

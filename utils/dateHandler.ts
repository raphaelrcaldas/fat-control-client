export function isoStrToDate(isoStr: string): Date {
   const [yearStr, monthStr, dayStr] = isoStr.split("-");
   const year = parseInt(yearStr, 10);
   const month = parseInt(monthStr, 10) - 1; // meses em JS são 0-based
   const day = parseInt(dayStr, 10);

   return new Date(year, month, day);
}

export function isoDateToString(isoDate: string): string {
   if (!isoDate) return "";

   const date = new Date(isoDate);
   if (isNaN(date.getTime())) return "";

   const day = String(date.getUTCDate()).padStart(2, "0");
   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
   const year = String(date.getUTCFullYear()).slice(-2);

   return `${day}/${month}/${year}`;
}

export function isoStrLocalToDate(localStr: string) {
   let dateRes;
   if (localStr) {
      const [day, month, year] = localStr.split("/");
      dateRes = new Date(parseInt(year) + 2000, parseInt(month) - 1, parseInt(day));

      if (isNaN(dateRes)) return 0;

      return dateRes;
   }

   return 0;
}

export function dateIsIn(dateToCheck, dateStart, dateEnd) {
   const checkStart =
      dateToCheck.valueOf() >= isoStrToDate(dateStart).valueOf();
   const checkEnd = dateToCheck.valueOf() <= isoStrToDate(dateEnd).valueOf();

   return checkStart && checkEnd;
}
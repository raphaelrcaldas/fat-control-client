export function isoDateToString(isoDate) {
   const date = new Date(isoDate);
   const day = String(date.getUTCDate()).padStart(2, "0");
   const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
   const year = String(date.getUTCFullYear()).slice(2);

   return `${day}/${month}/${year}`;
}

export function isoStrToDate(isoStr) {
   const [year, month, day] = isoStr.split("-");
   const date = new Date(year, month - 1, day);

   return date;
}

export function isoStrLocalToDate(localStr) {
   let dateRes = 0;
   if (localStr) {
      const [day, month, year] = localStr.split("/");
      dateRes = new Date(parseInt(year) + 2000, month - 1, day);

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

function normalizarData(date) {
   return date.toISOString().split("T")[0]; // → 'YYYY-MM-DD'
}

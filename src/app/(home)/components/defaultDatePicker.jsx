import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ptBR } from "@mui/x-date-pickers/locales";
import "dayjs/locale/pt-br";
import dayjs from "dayjs";

const brazilLocal =
   ptBR.components.MuiLocalizationProvider.defaultProps.localeText;

export default function DefaultDatePicker({ callFunc, value, disabled }) {
   function setDate(dateObject) {
      if (dateObject && dateObject.isValid()) {
         const value = dateObject.format("YYYY-MM-DD");
         callFunc(value);
      } else {
         callFunc(null);
      }
   }

   return (
      <LocalizationProvider
         dateAdapter={AdapterDayjs}
         adapterLocale="pt-br"
         localeText={brazilLocal}
      >
         <DatePicker
            disabled={disabled}
            value={value ? dayjs(value) : null}
            format="DD/MM/YYYY"
            className="w-48 bg-white"
            disableFuture={disableFuture}
            disablePast={disablePast}
            onChange={(object) => setDate(object)}
         />
      </LocalizationProvider>
   );
}

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { ptBR } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/pt-br';
import dayjs from 'dayjs';

const brazilLocal = ptBR.components.MuiLocalizationProvider.defaultProps.localeText;

export default function DefaultDatePicker({ callFunc, value, defaultValue}) {
    function setDate(dateObject) {
        if (dateObject && dateObject.isValid()) {
            const value = dateObject.format("YYYY-MM-DD");
            callFunc(value);
        }
        else {
            callFunc(null);
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br" localeText={brazilLocal}>

            <DatePicker
                format="DD/MM/YYYY"
                defaultValue={defaultValue ? dayjs(defaultValue) : null}
                onChange={(object) => setDate(object)}
            />

        </LocalizationProvider>
    )
}

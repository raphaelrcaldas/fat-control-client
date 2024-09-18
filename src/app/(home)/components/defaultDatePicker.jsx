import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { ptBR } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/pt-br';

const brazilLocal = ptBR.components.MuiLocalizationProvider.defaultProps.localeText;
const format = "YYYY-MM-DD";


export default function DefaultDatePicker({ setParent }) {
    function setDate(dateObject){
        if (dateObject && dateObject.isValid()){
            const value = dateObject.format(format);
            setParent(value);
        }
        else{
            setParent(null);
        }
    }
    
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br" localeText={brazilLocal}>

            <DatePicker format="DD/MM/YYYY" onChange={(object) => setDate(object)}/>

        </LocalizationProvider>
    )
}

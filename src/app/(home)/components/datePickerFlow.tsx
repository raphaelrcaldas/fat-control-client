
import { CalendarIcon } from "@mui/x-date-pickers";
import { useState } from "react"
import Datepicker from "tailwind-datepicker-react"

const options = {
	title: "Demo Title",
	autoHide: true,
	todayBtn: false,
	clearBtn: true,
	clearBtnText: "Clear",
	maxDate: new Date("2030-01-01"),
	minDate: new Date("1950-01-01"),
	theme: {
		background: "bg-gray-700 dark:bg-gray-800",
		todayBtn: "",
		clearBtn: "",
		icons: "",
		text: "",
		disabledText: "bg-red-500",
		input: "",
		inputIcon: "",
		selected: "",
	},
	icons: {
		// () => ReactElement | JSX.Element
		prev: () => <span>Previous</span>,
		next: () => <span>Next</span>,
	},
	datepickerClassNames: "top-12",
	defaultDate: new Date("2022-01-01"),
	language: "en",
	disabledDates: [],
	weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
	inputNameProp: "date",
	inputIdProp: "date",
	inputPlaceholderProp: "Select Date",
	inputDateFormatProp: {
		day: "numeric",
		month: "long",
		year: "numeric"
	}
}

export const FlowDatepicker = () => {
	const [show, setShow] = useState (false);
	const [selectedDate, setSelectedDate] = (useState < Date) | (null > null)
	const handleChange = (selectedDate: Date) => {
		setSelectedDate(selectedDate)
		console.log(selectedDate)
	}
	const handleClose = (state: boolean) => {
		setShow(state)
	}

	return (
		<div>
			<Datepicker options={options} onChange={handleChange} show={show} setShow={handleClose}>
				<div className="...">
					<div className="...">
						<CalendarIcon />
					</div>
					<input type="text" className="..." placeholder="Select Date" value={selectedDate} onFocus={() => setShow(true)} readOnly />
				</div>
			</Datepicker>
		</div>
	)
}

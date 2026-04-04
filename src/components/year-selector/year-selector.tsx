import { Select } from '../ui/select/select';
import './year-selector.css';

type Props = {
	years: Array<string>;
	selectedYear: string | undefined;
	setSelectedYear: (year: string | undefined) => void;
};

export const YearSelector = ({ years, selectedYear, setSelectedYear }: Props) => {
	return (
		<div className="year-selector__container">
			<h1>
				PIT-38 <span className="print-only">{selectedYear}</span>
			</h1>
			<Select
				options={years}
				value={selectedYear}
				onChange={setSelectedYear}
				className="no-print"
			/>
		</div>
	);
};

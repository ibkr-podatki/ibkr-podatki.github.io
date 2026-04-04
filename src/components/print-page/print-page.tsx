import { Icon } from '../ui/icon';
import './print-page.css';

export const PrintPage = () => {
	return (
		<button
			className="print-page__button no-print"
			onClick={window.print}
			data-tooltip="Wydrukuj lub pobierz PDF"
			data-tooltip-position="bottom"
		>
			<Icon icon="print" />
		</button>
	);
};

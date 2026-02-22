import { useCallback, useState } from 'react';
import './App.css';
import { UploadFiles } from './components/upload-files/upload-files';
import type { CurrencyYearData } from './types';
import { CalculateButton } from './components/calculate/calculate-button';
import { Dividends } from './components/dividends';
import { Select } from './components/ui/select/select';
import { Trades } from './components/trades';
import type { ParsedStatement } from './parsers/types';

function App() {
	const [parsedStatement, setParsedStatement] = useState<ParsedStatement | undefined>();
	const [currenciesData, setCurrenciesData] = useState<CurrencyYearData | undefined>();
	const [selectedYear, setSelectedYear] = useState<string | undefined>();

	const handleStatementParse = useCallback((data: ParsedStatement) => {
		setParsedStatement(data);
		setSelectedYear(data.years.at(0));
	}, []);

	return (
		<div className="app">
			<h1>Rozlicz podatki Interactive Brokers</h1>

			<UploadFiles onParsedData={handleStatementParse} />

			{!!parsedStatement?.years?.length && (
				<CalculateButton
					years={parsedStatement.years}
					onCurrenciesDataLoaded={setCurrenciesData}
				/>
			)}

			{!!parsedStatement?.years?.length && !!currenciesData && (
				<Select
					id="year-selector"
					options={parsedStatement.years.map(year => String(year))}
					value={selectedYear ? String(selectedYear) : undefined}
					onChange={setSelectedYear}
				/>
			)}

			{!!parsedStatement && !!currenciesData && selectedYear && (
				<>
					<Trades
						parsedTrades={parsedStatement.trades}
						parsedCorporateActions={parsedStatement.corporateActions}
						currenciesData={currenciesData}
						selectedYear={selectedYear}
					/>
					<Dividends
						parsedDividends={parsedStatement.dividends}
						parsedWitholdingTax={parsedStatement.withholdingTax}
						currencyData={currenciesData[selectedYear]}
						selectedYear={selectedYear}
					/>
				</>
			)}
		</div>
	);
}

export default App;

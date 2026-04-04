import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { UploadFiles } from './components/upload-files/upload-files';
import type { CurrencyYearData } from './types';
import { CalculateButton } from './components/calculate-button/calculate-button';
import { Dividends } from './components/dividends/dividends';
import { Trades } from './components/trades/trades';
import type { ParsedStatement } from './parsers/types';
import { YearSelector } from './components/year-selector/year-selector';
import { StatementHint } from './components/statement-hint/statement-hint';
import { PrintPage } from './components/print-page/print-page';

function App() {
	const [parsedStatement, setParsedStatement] = useState<ParsedStatement | undefined>();
	const [currenciesData, setCurrenciesData] = useState<CurrencyYearData | undefined>();
	const [selectedYear, setSelectedYear] = useState<string | undefined>();

	const handleStatementParse = useCallback((data: ParsedStatement) => {
		setParsedStatement(data);
		setSelectedYear(data.years.at(0));
	}, []);

	useEffect(() => {
		if (selectedYear) {
			document.title = `IBKR Raport podatkowy ${selectedYear}`;
		}
	}, [selectedYear]);

	const isShowYearSelector = !!parsedStatement?.years?.length && !!currenciesData;

	return (
		<div className="app">
			{!isShowYearSelector && (
				<>
					<h1>Rozlicz podatki Interactive Brokers</h1>

					<UploadFiles onParsedData={handleStatementParse} />

					{!!parsedStatement?.years?.length && (
						<CalculateButton
							years={parsedStatement.years}
							onCurrenciesDataLoaded={setCurrenciesData}
						/>
					)}

					<StatementHint />
				</>
			)}

			{isShowYearSelector && (
				<div className="position-relative">
					<YearSelector
						years={parsedStatement.years}
						selectedYear={selectedYear}
						setSelectedYear={setSelectedYear}
					/>

					<p className="text-center">
						Formularz PIT-38 można złożyć na{' '}
						<a href="https://epit.podatki.gov.pl" target="_blank">
							https://epit.podatki.gov.pl
						</a>
					</p>

					<PrintPage />
				</div>
			)}

			{isShowYearSelector && selectedYear && (
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

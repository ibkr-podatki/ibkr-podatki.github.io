import { useCallback, useState } from 'react';
import './App.css'
import { UploadFiles } from './components/upload-files'
import type { CombinedDividendData, CurrencyData, ParsedStatementData } from './types';
import { getDividendsTotal } from './utils/get-dividends-total';
import { CalculateButton } from './components/calculate-button';
import { Dividends } from './components/dividends';
import { Select } from './components/ui/select/select';



function App() {
    const [dividendsData, setDividendsData] = useState<CombinedDividendData[]>([]);
    const [currenciesData, setCurrenciesData] = useState<Record<string, CurrencyData> | undefined>();
    const [availableYears, setAvailableYears] = useState<Array<string>>([]);
    const [selectedYear, setSelectedYear] = useState<string | undefined>();

    const handleStatementParse = useCallback((data: ParsedStatementData) => {
        // console.log(Object.groupBy(data.trades, (item) => item.symbol));
        const combinedDividendsData = getDividendsTotal(data.dividends, data.withholdingTax);

        setDividendsData(combinedDividendsData);
        setAvailableYears(data.years);
        setSelectedYear(data.years.at(0))
    }, []);

    const handleCurrencyDataLoaded = useCallback((data: Record<number, CurrencyData>) => {
        setCurrenciesData(data);
    }, []);

    const handleYearChange = useCallback((newYear: string) => {
        setSelectedYear(newYear);
    }, []);

    return (
        <div className='app'>
            <h1>Rozlicz podatki Interactive Brokers</h1>
            <UploadFiles onParsedData={handleStatementParse} />

            <CalculateButton
                years={availableYears}
                onCurrenciesDataLoaded={handleCurrencyDataLoaded}
            />

            {
                !!availableYears.length && (
                    <Select
                        id="year-selector"
                        options={availableYears.map(year => String(year))}
                        value={selectedYear ? String(selectedYear) : undefined}
                        onChange={handleYearChange}
                    />)
            }

            {
                currenciesData && selectedYear && currenciesData[selectedYear] && <>
                    <Dividends
                        dividendsData={dividendsData}
                        currencyData={currenciesData[selectedYear]}
                        selectedYear={selectedYear}
                    />
                </>
            }
        </div>
    )
}

export default App

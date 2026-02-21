import { useCallback, useState } from 'react';
import './App.css'
import { UploadFiles } from './components/upload-files'
import type { CombinedDividendData, CurrencyData, ParsedStatementData, Trade } from './types';
import { getDividendsTotal } from './utils/get-dividends-total';
import { CalculateButton } from './components/calculate-button';
import { Dividends } from './components/dividends';
import { Select } from './components/ui/select/select';
import { Trades } from './components/trades';



function App() {
    const [tradesData, setTradesData] = useState<Array<Trade>>([]);
    const [dividendsData, setDividendsData] = useState<Array<CombinedDividendData>>([]);
    const [currenciesData, setCurrenciesData] = useState<Record<string, CurrencyData> | undefined>();
    const [availableYears, setAvailableYears] = useState<Array<string>>([]);
    const [selectedYear, setSelectedYear] = useState<string | undefined>();

    const handleStatementParse = useCallback((data: ParsedStatementData) => {
        // console.log(Object.groupBy(data.trades, (item) => item.symbol));
        const combinedDividendsData = getDividendsTotal(data.dividends, data.withholdingTax);

        setDividendsData(combinedDividendsData);
        setTradesData(data.trades.filter(trade => trade.assetType !== 'Forex'));
        setAvailableYears(data.years);
        setSelectedYear(data.years.at(0));
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
                !!tradesData.length && !!currenciesData && selectedYear && (
                    <Trades trades={tradesData} currenciesData={currenciesData} selectedYear={selectedYear} />
                )
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

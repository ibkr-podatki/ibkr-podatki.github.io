import { useCallback, useState } from 'react';
import './App.css'
import { UploadFiles } from './components/upload-files'
import type { CombinedDividendData, CurrencyData, ParsedStatementData, Trade } from './types';
import { getDividendsTotal } from './utils/get-dividends-total';
import { CalculateButton } from './components/calculate-button';
import { Dividends } from './components/dividends';
import { Select } from './components/ui/select/select';
import { Trades } from './components/trades';
import { getSplitRatio, parseTicker } from './utils/utils';



function App() {
    const [tradesData, setTradesData] = useState<Array<Trade>>([]);
    const [dividendsData, setDividendsData] = useState<Array<CombinedDividendData>>([]);
    const [currenciesData, setCurrenciesData] = useState<Record<string, CurrencyData> | undefined>();
    const [availableYears, setAvailableYears] = useState<Array<string>>([]);
    const [selectedYear, setSelectedYear] = useState<string | undefined>();

    const handleStatementParse = useCallback((data: ParsedStatementData) => {
        // console.log(Object.groupBy(data.trades, (item) => item.symbol));
        const combinedDividendsData = getDividendsTotal(data.dividends, data.withholdingTax);

        const pasedStockSplits: Array<Trade> = data.corporateActions
            .filter(action => action.description.includes('Split'))
            .map(action => ({
                splitRatio: getSplitRatio(action.description),
                symbol: parseTicker(action.description) ?? '',
                date: action.dateTime,
                quantity: 0,
                tradePrice: 0,
                closingPrice: 0,
                proceeds: 0,
                commissionFee: 0,
                basis: 0,
                realizedPL: 0,
                mtmPL: 0,
                code: '',
                assetType: 'Stock split',
            }));

        const tradesDataWithoutForex = data.trades.filter(trade => trade.assetType !== 'Forex');
        const trades = [...tradesDataWithoutForex, ...pasedStockSplits].sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1);

        setDividendsData(combinedDividendsData);
        setTradesData(trades);
        setAvailableYears(data.years);
        setSelectedYear(data.years.at(0));

        console.log(trades);
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
                    <Trades 
                        trades={tradesData} 
                        currenciesData={currenciesData}
                        selectedYear={selectedYear}
                    />
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

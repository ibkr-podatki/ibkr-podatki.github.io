import { useMemo } from "react";
import type { CurrencyData, Trade, TradeWithLocalCurrency } from "../types"
import { getCurrencyForDate, getYearFromString, roundNumber } from "../utils/utils";
import { getTradesHistory } from "../utils/get-trades-history";
import { Table } from "./ui/table/table";
import { Spoiler } from './ui/spoiler/spoiler';

type Props = {
    trades: Array<Trade>;
    currenciesData: Record<string, CurrencyData>;
    selectedYear: string;
}

export const Trades = ({trades, currenciesData, selectedYear}: Props) => {
    // TODO: we can do trades history together with currencies, to avoid extra loops
    const tradesWithCurrency: Array<TradeWithLocalCurrency> = useMemo(() => {
        return trades.map(trade => {
            const year = getYearFromString(trade.date);
            const currencyYearData = year ? currenciesData[year] : undefined;
            const formattedTradeDate = new Date(trade.date).toISOString().slice(0, 10);

            return {
                ...trade,
                currencyRate: currencyYearData ? getCurrencyForDate(formattedTradeDate, currencyYearData) : 1
            }
        });
    }, [trades, currenciesData]);

    const tradesHistory = useMemo(() => getTradesHistory(tradesWithCurrency), [tradesWithCurrency]);

    const yearTradesHistory = tradesHistory.filter(trade => trade.date.includes(selectedYear));

    const profitLossTable = useMemo(() => {
        return yearTradesHistory.filter(trade => trade.tradeType === 'SELL').map((trade) => ({
            'Symbol': trade.symbol,
            'Date': new Date(trade.date).toLocaleDateString('pl-PL'),
            'Profil/Loss': `${roundNumber(trade.profit, 2)} (${roundNumber(trade.profitInLocalCurrency, 2)}zł)`
        }));
    }, []);

    return <>
        <Spoiler title="Profit/Loss table">
            <Table data={profitLossTable} />
        </Spoiler>
    </>;
}
import { useMemo } from 'react';
import type { CurrencyData, Trade, TradeWithLocalCurrency } from '../types';
import { getCurrencyForDate, getYearFromString, roundNumber } from '../utils/utils';
import { getTradesHistory } from '../utils/get-trades-history';
import { Table } from './ui/table/table';
import { Spoiler } from './ui/spoiler/spoiler';

type Props = {
	trades: Array<Trade>;
	currenciesData: Record<string, CurrencyData>;
	selectedYear: string;
};

export const Trades = ({ trades, currenciesData, selectedYear }: Props) => {
	const taxPaidAbroad = 0;
	const taxPercentage = 0.19;

	// TODO: we can do trades history together with currencies, to avoid extra loops
	const tradesWithCurrency: Array<TradeWithLocalCurrency> = useMemo(() => {
		return trades.map(trade => {
			const year = getYearFromString(trade.date);
			const currencyYearData = year ? currenciesData[year] : undefined;
			const formattedTradeDate = new Date(trade.date).toISOString().slice(0, 10);

			return {
				...trade,
				currencyRate: currencyYearData
					? getCurrencyForDate(formattedTradeDate, currencyYearData)
					: 1
			};
		});
	}, [trades, currenciesData]);

	const tradesHistory = useMemo(() => getTradesHistory(tradesWithCurrency), [tradesWithCurrency]);

	const yearTradesHistory = useMemo(
		() => tradesHistory.filter(trade => trade.date.includes(selectedYear)),
		[tradesHistory, selectedYear]
	);

	const buyVolume = useMemo(
		() =>
			yearTradesHistory.reduce(
				(acc, trade) => acc + (trade.taxData?.buyingCostInLocalCurrency ?? 0),
				0
			),
		[yearTradesHistory]
	);

	const sellVolume = useMemo(
		() =>
			yearTradesHistory.reduce(
				(acc, trade) => acc + (trade.taxData?.sellingCostInLocalCurrency ?? 0),
				0
			),
		[yearTradesHistory]
	);

	const profitInLocalCurrency = sellVolume - buyVolume;

	const taxToPay = useMemo(
		() => (profitInLocalCurrency > 0 ? profitInLocalCurrency * taxPercentage : 0),
		[profitInLocalCurrency]
	);

	const profitLossTable = useMemo(() => {
		return yearTradesHistory
			.filter(trade => trade.tradeType === 'SELL')
			.map(trade => ({
				Symbol: trade.symbol,
				Date: new Date(trade.date).toLocaleDateString('pl-PL'),
				'Profil/Loss': `${roundNumber(trade.taxData?.profit ?? 0, 2)} (${roundNumber(trade.taxData?.profitInLocalCurrency ?? 0, 2)}zł)`
			}));
	}, [yearTradesHistory]);

	const pitTable = useMemo(() => {
		return [
			{
				Komórka: 'C.20',
				'Suma (zł)': 'Należy wykazać sumę kwotę z poz. 35 z wszystkich PIT-8C',
				Opis: 'Przychody wykazane w części D informacji PIT-8C'
			},
			{
				Komórka: 'C.21',
				'Suma (zł)': 'Należy wykazać sumę kwotę z poz. 36 z wszystkich PIT-8C',
				Opis: 'Przychody wykazane w części D informacji PIT-8C'
			},
			{
				Komórka: 'C.22',
				'Suma (zł)': sellVolume.toFixed(2),
				Opis: 'Inne przychody / Przychód'
			},
			{
				Komórka: 'C.23',
				'Suma (zł)': buyVolume.toFixed(2),
				Opis: 'Inne przychody / Koszty uzyskania przychodów'
			},
			{
				Komórka: 'C.26',
				'Suma (zł)': sellVolume.toFixed(2),
				Opis: 'Razem (suma kwot z wierszy 1 do 2) / Przychód'
			},
			{
				Komórka: 'C.27',
				'Suma (zł)': buyVolume.toFixed(2),
				Opis: 'Razem (suma kwot z wierszy 1 do 2) / Koszty uzyskania przychodów'
			},
			{
				Komórka: 'C.28',
				'Suma (zł)': profitInLocalCurrency > 0 ? profitInLocalCurrency.toFixed(2) : '-',
				Opis: 'Dochód (b-c)'
			},
			{
				Komórka: 'C.29',
				'Suma (zł)': profitInLocalCurrency < 0 ? profitInLocalCurrency.toFixed(2) : '-',
				Opis: 'Strata (c-b)'
			},
			{
				Komórka: 'D.31',
				'Suma (zł)': profitInLocalCurrency.toFixed(),
				Opis: 'Podstawa obliczenia podatku (po zaokrągleniu do pełnych złotch)'
			},
			{
				Komórka: 'D.32',
				'Suma (zł)': `${taxPercentage * 100}%`,
				Opis: 'Stawka podatku (należy podać w procentach)'
			},
			{
				Komórka: 'D.33',
				'Suma (zł)': taxToPay.toFixed(2),
				Opis: 'Podatek od dochodów, o których mowa w art. 30b ust. 1 ustawy'
			},
			{
				Komórka: 'D.34',
				'Suma (zł)': taxPaidAbroad.toFixed(2),
				Opis: 'Podatek zapłacony za granicą, o którym mowa w art. 30b ust. 5a i 5b ustawy'
			},
			{
				Komórka: 'D.34',
				'Suma (zł)': taxToPay.toFixed(),
				Opis: 'Podatek należny (po zaokrągleniu do pełnych złotych)	'
			}
		];
	}, [profitInLocalCurrency, taxToPay, buyVolume, sellVolume]);

	return (
		<>
			<h3>PIT-38 - Akcje</h3>

			<Table data={pitTable} />

			<Spoiler title="Profit/Loss table">
				<Table data={profitLossTable} />
			</Spoiler>
		</>
	);
};

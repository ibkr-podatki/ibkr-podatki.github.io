import { useMemo } from 'react';
import type { CurrencyYearData } from '../../types';
import { roundNumber, STOCKS_TAX_PERCENT } from '../../utils/utils';
import { getTradesHistory } from '../../utils/get-trades-history';
import { Table } from '../ui/table/table';
import { Spoiler } from '../ui/spoiler/spoiler';
import type { ParsedCorporateAction, ParsedTrade } from '../../parsers/types';
import { getTradesWithStockSplit } from '../../utils/get-trades-with-stock-split';
import { NumberCell } from '../ui/table/cells/number-cell/number-cell';

type Props = {
	parsedTrades: Array<ParsedTrade>;
	parsedCorporateActions: Array<ParsedCorporateAction>;
	currenciesData: CurrencyYearData;
	selectedYear: string;
};

export const Trades = ({
	parsedTrades,
	parsedCorporateActions,
	currenciesData,
	selectedYear
}: Props) => {
	const tradesHistory = useMemo(() => {
		const tradesWithStockSplit = getTradesWithStockSplit(parsedTrades, parsedCorporateActions);
		return getTradesHistory(tradesWithStockSplit, currenciesData);
	}, [parsedTrades, parsedCorporateActions, currenciesData]);

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

	const taxPaidAbroad = 0;
	const profitInLocalCurrency = sellVolume - buyVolume;

	const taxToPay = useMemo(
		() => (profitInLocalCurrency > 0 ? profitInLocalCurrency * STOCKS_TAX_PERCENT : 0),
		[profitInLocalCurrency]
	);

	const profit = useMemo(
		() => (profitInLocalCurrency > 0 ? profitInLocalCurrency : 0),
		[profitInLocalCurrency]
	);
	const loss = useMemo(
		() => (profitInLocalCurrency > 0 ? 0 : profitInLocalCurrency),
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
				Komórka: <b>C.22</b>,
				'Suma (zł)': (
					<b>
						<NumberCell number={sellVolume} />
					</b>
				),
				Opis: <b>Inne przychody - Przychód</b>
			},
			{
				Komórka: <b>C.23</b>,
				'Suma (zł)': (
					<b>
						<NumberCell number={buyVolume} />
					</b>
				),
				Opis: <b>Inne przychody - Koszty uzyskania przychodów</b>
			},
			{
				Komórka: 'C.28',
				'Suma (zł)': profit ? <NumberCell number={profit} /> : '-',
				Opis: 'Dochód (b-c)'
			},
			{
				Komórka: 'C.29',
				'Suma (zł)': loss ? <NumberCell number={loss} /> : '-',
				Opis: 'Strata (c-b)'
			},
			{
				Komórka: 'D.31',
				'Suma (zł)': <NumberCell number={profit} />,
				Opis: 'Podstawa obliczenia podatku (po zaokrągleniu do pełnych złotch)'
			},
			{
				Komórka: 'D.32',
				'Suma (zł)': `${STOCKS_TAX_PERCENT * 100}%`,
				Opis: 'Stawka podatku (należy podać w procentach)'
			},
			{
				Komórka: 'D.33',
				'Suma (zł)': <NumberCell number={taxToPay} />,
				Opis: 'Podatek od dochodów, o których mowa w art. 30b ust. 1 ustawy'
			},
			{
				Komórka: 'D.34',
				'Suma (zł)': <NumberCell number={taxPaidAbroad} />,
				Opis: 'Podatek zapłacony za granicą, o którym mowa w art. 30b ust. 5a i 5b ustawy'
			},
			{
				Komórka: 'D.35',
				'Suma (zł)': <NumberCell number={Math.round(taxToPay)} />,
				Opis: 'Podatek należny (po zaokrągleniu do pełnych złotych)	'
			}
		];
	}, [taxToPay, buyVolume, sellVolume, profit, loss]);

	return (
		<>
			<h3>Akcje</h3>

			<p className="text-center">
				W deklaracje e-PIT uzupełnić tylko <b>G.22 i G.23</b>
			</p>

			<Table data={pitTable} />

			{!!yearTradesHistory.length && (
				<Spoiler title="Profit/Loss table" className="no-print mt-4 mb-4">
					<Table data={profitLossTable} includeCountColumn />
				</Spoiler>
			)}
		</>
	);
};

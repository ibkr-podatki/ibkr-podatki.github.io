import { useMemo } from 'react';
import type { CurrencyData, Dividend } from '../../types';
import { Table } from '../ui/table/table';
import { Spoiler } from '../ui/spoiler/spoiler';
import type { ParsedDividend, ParsedWithholdingTax } from '../../parsers/types';
import { getDividendsData } from '../../utils/get-dividends-data';
import { calculateDeductableTax, calculateDividendTax, DIVIDEND_TAX_PERCENT } from './utils';
import { NumberCell } from '../ui/table/cells/number-cell/number-cell';
import { getNumberWithCurrency } from '../../utils/utils';

type Props = {
	selectedYear: string;
	parsedDividends: Array<ParsedDividend>;
	parsedWitholdingTax: Array<ParsedWithholdingTax>;
	currencyDataByCode: Record<string, CurrencyData>;
};

export const Dividends = ({
	parsedDividends,
	parsedWitholdingTax,
	currencyDataByCode,
	selectedYear
}: Props) => {
	const dividends: Array<Dividend> = useMemo(() => {
		const filteredParsedDividends = parsedDividends.filter(dividend =>
			dividend.date.includes(selectedYear)
		);

		const filteredWitholdingTax = parsedWitholdingTax.filter(tax =>
			tax.date.includes(selectedYear)
		);

		return getDividendsData(filteredParsedDividends, filteredWitholdingTax, currencyDataByCode);
	}, [parsedDividends, parsedWitholdingTax, selectedYear, currencyDataByCode]);

	const dividendsTotal = useMemo(() => {
		return dividends.reduce(
			(acc, dividend) => acc + dividend.amount * dividend.currencyRate,
			0
		);
	}, [dividends]);

	const taxTotal = useMemo(() => dividendsTotal * DIVIDEND_TAX_PERCENT, [dividendsTotal]);

	const deductableTax = useMemo(() => {
		return dividends.reduce((acc, dividend) => acc + calculateDeductableTax(dividend), 0);
	}, [dividends]);

	const taxesPaidAbroad = useMemo(() => {
		return dividends.reduce(
			(acc, dividend) => acc + dividend.withheldTax * dividend.currencyRate,
			0
		);
	}, [dividends]);

	const dividendsTable = useMemo(() => {
		return dividends.map(dividend => ({
			Ticker: dividend.symbol,
			Data: new Date(dividend.date).toLocaleDateString('pl-PL'),
			'Dochód do opodadtowania': `${getNumberWithCurrency(dividend.amount, dividend.currency, 2)} (${getNumberWithCurrency(dividend.amount * dividend.currencyRate, 'PLN', 2)})`,
			'Zapłacony podatek': `${getNumberWithCurrency(dividend.withheldTax, dividend.currency, 2)} (${getNumberWithCurrency(dividend.withheldTax * dividend.currencyRate, 'PLN', 2)}) - ${dividend.taxPercentage}%`,
			'Dochód po opodadtowaniu': `${getNumberWithCurrency(dividend.amountAfterTax, dividend.currency, 2)} (${getNumberWithCurrency(dividend.amountAfterTax * dividend.currencyRate, 'PLN', 2)})`,
			'Kurs waluty': `${dividend.currencyRate.toFixed(2)}`,
			'Do zapłaty': `${calculateDividendTax(dividend).toFixed(2)}zł`
		}));
	}, [dividends]);

	const pitTable = useMemo(() => {
		return [
			{
				Komórka: '-',
				'Suma (zł)': <NumberCell number={dividendsTotal} />,
				Opis: 'Suma wypłat dywidend zagranicznych - podstawa opodatkowania (wiersz pomocniczy)'
			},
			{
				Komórka: <b>G.47</b>,
				'Suma (zł)': (
					<b>
						<NumberCell number={taxTotal} />
					</b>
				),
				Opis: (
					<b>
						Zryczałtowany podatek obliczony od przychodów (dochodów), o których mowa w
						art. 30a ust. 1 pkt 1-5 ustawy, uzyskanych poza granicami Rzeczypospolitej
						Polskiej
					</b>
				)
			},
			{
				Komórka: <b>G.48</b>,
				'Suma (zł)': (
					<b>
						<NumberCell number={deductableTax} />
					</b>
				),
				Opis: (
					<b>
						Podatek zapłacony za granicą, o którym mowa w art. 30a ust. 9 ustawy
						(Podatek do odliczenia, zapłacony za granicą na podstawie stawek podatkowych
						z umów o unikaniu podwójnego opodatkowania)
					</b>
				)
			},
			{
				Komórka: '-',
				'Suma (zł)': <NumberCell number={taxesPaidAbroad} />,
				Opis: 'Podatek zapłacony za granicą'
			},
			{
				Komórka: 'G.49',
				'Suma (zł)': <NumberCell number={taxTotal - deductableTax} />,
				Opis: 'Różnica między zryczałtowanym podatkiem a podatkiem zapłaconym za granicą'
			}
		];
	}, [dividendsTotal, taxTotal, taxesPaidAbroad, deductableTax]);

	return (
		<>
			<h3>Dywidendy</h3>

			<p className="text-center">
				W formularze uzupełnić tylko <b>G.47 i G.48</b>
			</p>

			<Table data={pitTable} />

			{!!dividends.length && (
				<Spoiler title="Tabela dywidendów" className="no-print mt-4 mb-4">
					<Table data={dividendsTable} includeCountColumn />
				</Spoiler>
			)}
		</>
	);
};

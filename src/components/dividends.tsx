import { useMemo } from 'react';
import type { CurrencyData, Dividend } from '../types';
import { Table } from './ui/table/table';
import { Spoiler } from './ui/spoiler/spoiler';
import type { ParsedDividend, ParsedWithholdingTax } from '../parsers/types';
import { getDividendsData } from '../utils/get-dividends-data';

export const TOTAL_TAX = 0.19; // total polish tax
export const TAX_AMOUNT = 0.04; // how much you need to pay after withheld tax

type Props = {
	selectedYear: string;
	parsedDividends: Array<ParsedDividend>;
	parsedWitholdingTax: Array<ParsedWithholdingTax>;
	currencyData: CurrencyData;
};

export const Dividends = ({
	parsedDividends,
	parsedWitholdingTax,
	currencyData,
	selectedYear
}: Props) => {
	const dividends: Array<Dividend> = useMemo(() => {
		const filteredParsedDividends = parsedDividends.filter(dividend =>
			dividend.date.includes(selectedYear)
		);

		const filteredWitholdingTax = parsedWitholdingTax.filter(tax =>
			tax.date.includes(selectedYear)
		);

		return getDividendsData(filteredParsedDividends, filteredWitholdingTax, currencyData);
	}, [parsedDividends, parsedWitholdingTax, selectedYear, currencyData]);

	const dividendsTotal = useMemo(() => {
		return dividends.reduce(
			(acc, dividend) => acc + dividend.amount * dividend.currencyRate,
			0
		);
	}, [dividends]);

	const taxTotal = useMemo(() => dividendsTotal * TOTAL_TAX, [dividendsTotal]);

	const taxesPaid = useMemo(() => {
		return dividends.reduce(
			(acc, dividend) => acc + dividend.withheldTax * dividend.currencyRate,
			0
		);
	}, [dividends]);

	// we can't just subtract those two, because paid tax can be more that 15% treaty for double taxation avoid
	const taxesToPay = useMemo(() => {
		return dividends.reduce(
			(acc, dividend) => acc + dividend.amount * TAX_AMOUNT * dividend.currencyRate,
			0
		);
	}, [dividends]);

	const dividendsTable = useMemo(() => {
		return dividends.map(dividend => ({
			Symbol: dividend.symbol,
			Date: new Date(dividend.date).toLocaleDateString('pl-PL'),
			'Amount before tax': `${(dividend.amount * dividend.currencyRate).toFixed(2)}zł (${dividend.amount.toFixed(2)} ${dividend.currency})`,
			'Paid tax': `${(dividend.withheldTax * dividend.currencyRate).toFixed(2)}zł (${dividend.withheldTax.toFixed(2)} ${dividend.currency})`,
			'Paid Tax %': `${dividend.taxPercentage}%`,
			'Amount after tax': `${(dividend.withheldTax * dividend.amountAfterTax).toFixed(2)}zł (${dividend.amountAfterTax.toFixed(2)} ${dividend.currency})`,
			'Currency Rate': `${dividend.currencyRate.toFixed(2)}`,
			'To pay (4%)': `${(dividend.amount * TAX_AMOUNT * dividend.currencyRate).toFixed(2)}zł`
		}));
	}, [dividends]);

	const pitTable = useMemo(() => {
		return [
			{
				Komórka: '-',
				'Suma (zł)': dividendsTotal.toFixed(2),
				Opis: 'Suma wypłat dywidend zagranicznych - podstawa opodatkowania (wiersz pomocniczy)'
			},
			{
				Komórka: 'G.45',
				'Suma (zł)': taxTotal.toFixed(2),
				Opis: 'Zryczałtowany podatek obliczony od przychodów (dochodów), o których mowa w art. 30a ust. 1 pkt 1–5 ustawy, uzyskanych poza granicami Rzeczypospolitej Polskiej'
			},
			{
				Komórka: 'G.46',
				'Suma (zł)': taxesPaid.toFixed(2),
				Opis: 'Podatek zapłacony za granicą, o którym mowa w art. 30a ust. 9 ustawy'
			},
			{
				Komórka: '-',
				'Suma (zł)': taxesToPay.toFixed(2),
				Opis: 'Dokładna wartość podatku do dopłacenia (wiersz pomocniczy)'
			},
			{
				Komórka: 'G.47',
				'Suma (zł)': taxesToPay.toFixed(),
				Opis: 'Różnica między zryczałtowanym podatkiem a podatkiem zapłaconym za granicą'
			}
		];
	}, [dividendsTotal, taxTotal, taxesPaid, taxesToPay]);

	if (!dividends.length) {
		return null;
	}

	return (
		<>
			<h3>PIT-38 - Dywidendy</h3>

			<p>
				<i>
					You must pay 19% from Dividend taxes. However, most of stock exchanges withhold
					their own taxes. To{' '}
					<a href="https://www.biznes.gov.pl/pl/portal/00229#7" target="_blank">
						avoid double taxation
					</a>{' '}
					you should pay 19% - 15% = 4% tax
				</i>
			</p>

			<Table data={pitTable} />

			<Spoiler title={<b>Tabela dywidendów</b>}>
				<Table data={dividendsTable} />
			</Spoiler>
		</>
	);
};

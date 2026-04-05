import type { ParsedDividend, ParsedWithholdingTax } from '../parsers/types';
import type { CurrencyData, Dividend } from '../types';
import { getCurrencyForDate, roundNumber } from './utils';

const groupData = (dividends: Array<ParsedDividend> | Array<ParsedWithholdingTax>) =>
	Object.values(
		dividends.reduce(
			(acc, item) => {
				const key = `${item.date}_${item.symbol}_${item.currency}`;

				if (!acc[key]) {
					acc[key] = { ...item };
				} else {
					acc[key].amount += item.amount;
				}

				return acc;
			},
			{} as Record<string, ParsedDividend | ParsedWithholdingTax>
		)
	);

export const getDividendsData = (
	dividendsData: Array<ParsedDividend>,
	withholdingTaxData: Array<ParsedWithholdingTax>,
	currencyDataByCode: Record<string, CurrencyData>
): Array<Dividend> => {
	// though dividends could be paid in one day, they may have separate records
	const groupedDividends = groupData(dividendsData);
	const groupedWithholdingTaxData = groupData(withholdingTaxData);

	return groupedDividends.map(dividend => {
		const withheldTax = Math.abs(
			groupedWithholdingTaxData.find(tax => {
				return (
					tax.date === dividend.date &&
					tax.symbol === dividend.symbol &&
					tax.currency === dividend.currency &&
					tax.amount + dividend.amount > 0
				);
			})?.amount ?? 0
		);

		const code = dividend.currency ?? 'USD';
		const currencyData = currencyDataByCode[code];
		const currencyRate = currencyData ? getCurrencyForDate(dividend.date, currencyData) : 1;

		return {
			symbol: dividend.symbol,
			date: dividend.date,
			amount: dividend.amount,
			withheldTax: roundNumber(withheldTax, 2),
			amountAfterTax: roundNumber(dividend.amount - withheldTax, 2),
			taxPercentage: Math.abs(roundNumber((withheldTax / dividend.amount) * 100)),
			currency: code,
			currencyRate
		};
	});
};

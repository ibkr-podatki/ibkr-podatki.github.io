import { getYearFromString } from '../utils/utils';
import type { ParsedDividend, ParsedStatementCurrencyGroup, ParsedTrade } from './types';

const addYearForCurrency = (
	byCurrency: Map<string, Set<string>>,
	currency: string,
	year: string | undefined
) => {
	if (!year) {
		return;
	}
	const code = currency.trim() || 'USD';
	if (!byCurrency.has(code)) {
		byCurrency.set(code, new Set());
	}
	byCurrency.get(code)!.add(year);
};

export const collectStatementCurrencies = (
	trades: Array<ParsedTrade>,
	dividends: Array<ParsedDividend>,
	fallbackYears: Array<string>
): Array<ParsedStatementCurrencyGroup> => {
	const byCurrency = new Map<string, Set<string>>();

	for (const trade of trades) {
		addYearForCurrency(byCurrency, trade.currency ?? 'USD', getYearFromString(trade.date));
	}

	for (const dividend of dividends) {
		addYearForCurrency(byCurrency, dividend.currency ?? 'USD', getYearFromString(dividend.date));
	}

	if (byCurrency.size === 0 && fallbackYears.length) {
		byCurrency.set('USD', new Set(fallbackYears));
	}

	return [...byCurrency.entries()]
		.map(([currency, years]) => ({
			currency,
			years: [...years].sort((a, b) => (a > b ? -1 : 1))
		}))
		.sort((a, b) => a.currency.localeCompare(b.currency));
};

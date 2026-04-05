import type { ParsedStatementCurrencyGroup } from '../../parsers/types';
import type { CurrencyData, CurrencyYearData } from '../../types';

// Exclude PLN, because we convert everything to PLN
const EXCLUDED_CURRENCIES = ['PLN'];

export const getCurrenciesByYears = (currencies: Array<ParsedStatementCurrencyGroup>) => {
	const seen = new Set<string>();
	const pairs: Array<{ year: string; currency: string }> = [];
	for (const { currency, years } of currencies) {
		if (EXCLUDED_CURRENCIES.includes(currency)) {
			continue;
		}
		for (const year of years) {
			const key = `${year}\0${currency}`;
			if (seen.has(key)) {
				continue;
			}
			seen.add(key);
			pairs.push({ year, currency });
		}
	}
	return pairs;
};

const fetchCurrencyData = async (year: string, currency: string): Promise<CurrencyData> => {
	const url = `https://api.nbp.pl/api/exchangerates/rates/A/${currency}/${year}-01-01/${year}-12-31?format=json`;
	const currencyDataResponse = await fetch(url);
	return await currencyDataResponse.json();
};

export const fetchCurrenciesData = async (
	currenciesByYears: Array<{ year: string; currency: string }>
): Promise<CurrencyYearData> => {
	const loaded = await Promise.all(
		currenciesByYears.map(async ({ year, currency }) => ({
			year,
			currency,
			data: await fetchCurrencyData(year, currency)
		}))
	);

	const yearToCurrency: CurrencyYearData = {};
	for (const { year, currency, data } of loaded) {
		if (!yearToCurrency[year]) {
			yearToCurrency[year] = {};
		}
		yearToCurrency[year][currency] = data;
	}

	return yearToCurrency;
};

import type { CurrencyData } from '../types';

export const roundNumber = (number: number, numbersAfterComma: number = 0) => {
	const factor = Math.pow(10, numbersAfterComma);
	return Math.round(number * factor) / factor;
};

export const stringToDocument = (htmlContent: string): Document => {
	const parser = new DOMParser();
	return parser.parseFromString(htmlContent, 'text/html');
};

export const getYearFromString = (dateString: string): string | undefined => {
	const match = dateString.match(/\b\d{4}\b/);
	const year = match?.at(0);

	return year ?? undefined;
};

// "TLT(US00000000) Cash Dividend USD 0.351032 per Share - US Tax"
export const parseTicker = (text: string): string | undefined => {
	const match = text.match(/^([^(]+)/);
	const result = match?.at(1);
	return result ?? undefined;
};

// "SCHD(US00000000) Split 3 for 1 (SCHD, SCHWAB US DVD EQUITY ETF;"
export const getSplitRatio = (str: string): number | undefined => {
	const match = str.match(/Split\s+(\d+)\s+for\s+\d+/);
	console.log(match);
	const result = Number(match?.at(1));

	return !isNaN(result) ? result : undefined;
};

export const getCurrencyData = async (
	year: string,
	currency: string = 'USD'
): Promise<CurrencyData> => {
	const url = `https://api.nbp.pl/api/exchangerates/rates/A/${currency}/${year}-01-01/${year}-12-31?format=json`;
	const currencyDataResponse = await fetch(url);
	return await currencyDataResponse.json();
};

// if no currency rate available for this day, take the previous one
export const getCurrencyForDate = (
	dateStr: string,
	currencyData: CurrencyData,
	retryNumber: number = 0
): number => {
	const MAX_DAYS_SHIFT = 10;

	if (retryNumber === MAX_DAYS_SHIFT) {
		return currencyData.rates[0]?.mid ?? 1;
	}

	const date = new Date(dateStr);
	date.setDate(date.getDate() - retryNumber);

	const currencyRate = currencyData.rates.find(currency => {
		const rateDate = new Date(currency.effectiveDate);
		return rateDate.getTime() === date.getTime();
	})?.mid;

	if (!currencyRate) {
		return getCurrencyForDate(dateStr, currencyData, retryNumber + 1);
	}

	return currencyRate;
};

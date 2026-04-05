import type { CurrencyData } from '../types';

export const STOCKS_TAX_PERCENT = 0.19;

const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: '$',
	PLN: 'zł',
	GBP: '£',
	EUR: '€'
};

const CURRENCIES_BEFORE_NUMBER = ['USD', 'GBP', 'EUR'];

export const roundNumber = (number: number, numbersAfterComma: number = 0) => {
	const factor = Math.pow(10, numbersAfterComma);
	return Math.round(number * factor) / factor;
};

export const getYearFromString = (dateString: string): string | undefined => {
	const match = dateString.match(/\b\d{4}\b/);
	const year = match?.at(0);

	return year ?? undefined;
};

// string example: "TLT(US00000000) Cash Dividend USD 0.351032 per Share - US Tax"
export const parseTicker = (text: string): string | undefined => {
	const match = text.match(/^([^(]+)/);
	const result = match?.at(1);
	return result ?? undefined;
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

export const getNumberWithCurrency = (
	number: number,
	currency: string,
	fractionDigits?: number
): string => {
	const negativeSymbol = number < 0 ? '-' : '';
	const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;
	const numberString = Math.abs(number).toFixed(fractionDigits);

	if (CURRENCIES_BEFORE_NUMBER.includes(currency)) {
		return `${negativeSymbol}${currencySymbol}${numberString}`;
	}

	return `${negativeSymbol}${numberString}${currencySymbol}`;
};

import type { CurrencyData } from "../types";

export const TOTAL_TAX = 0.19; // total polish tax
export const TAX_AMOUNT = 0.04; // how much you need to pay after withheld tax


export const roundNumber = (number: number, numbersAfterComma: number = 0) => {
    const factor = Math.pow(10, numbersAfterComma)
    return Math.round(number * factor) / factor;
}; 

export const stringToDocument = (htmlContent: string): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(htmlContent, 'text/html');
}

// for the format "TLT(US00000000) Cash Dividend USD 0.351032 per Share - US Tax"
export const parseTicker = (text: string): string | undefined => {
    const match = text.match(/^([^(]+)/);
    const result = match?.at(1);
    return result ?? undefined;
}


export const getCurrencyData = async (year: string, currency: string = 'USD'): Promise<CurrencyData> => {
    const url = `https://api.nbp.pl/api/exchangerates/rates/A/${currency}/${year}-01-01/${year}-12-31?format=json`;
    const currencyDataResponse = await fetch(url);
    return await currencyDataResponse.json();
}

// if no currency rate available for this day, take the previous one
export const getDividendCurrency = (dividendDateStr: string, currencyData: CurrencyData, retryNumber: number = 0): number => {
    const MAX_DAYS_SHIFT = 10;

    if (retryNumber === MAX_DAYS_SHIFT) {
        return currencyData.rates[0]?.mid ?? 1;
    }

    const dividendDate = new Date(dividendDateStr);
    dividendDate.setDate(dividendDate.getDate() - retryNumber);

    const currencyRate = currencyData.rates.find(currency => {
        const rateDate = new Date(currency.effectiveDate);
        return rateDate.getTime() === dividendDate.getTime();
    })?.mid;

    if (!currencyRate) {
        return getDividendCurrency(dividendDateStr, currencyData, retryNumber + 1);
    }

    return currencyRate
}
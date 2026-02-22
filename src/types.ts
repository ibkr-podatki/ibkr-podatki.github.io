export type Dividend = {
	symbol: string;
	date: string;
	amount: number;
	withheldTax: number;
	amountAfterTax: number;
	taxPercentage: number;
	currency?: string;
	currencyRate: number;
};

export type Trade = {
	symbol: string;
	date: string;
	quantity: number;
	tradePrice: number;
	commissionFee: number;
	currency: string;
	assetType: 'Stocks';
};

export type StockSplit = {
	symbol: string;
	date: string;
	splitRatio: number;
	assetType: 'Stock split';
};

export function isStockSplit(value: object): value is StockSplit {
	return (value as { assetType: unknown }).assetType === 'Stock split';
}

export type TradeHistory = {
	symbol: string;
	date: string;
	currencyRate: number;
	tradeType: 'BUY' | 'SELL';
	quantity: number;
	price: number;
	comissionFee: number;
	position: {
		quantity: number;
		costBasis: number;
		costBasisInLocalCurrency: number;
	};
	taxData?: TradeHistoryTaxData;
};

export type TradeHistoryTaxData = {
	buyingCost: number;
	buyingCostInLocalCurrency: number;
	sellingCost: number;
	sellingCostInLocalCurrency: number;
	profit: number;
	profitInLocalCurrency: number;
};

// Data form Polski bank narodowy
export type CurrencyRate = {
	effectiveDate: string;
	mid: number;
	no: string;
};

export type CurrencyData = {
	code: string;
	currency: string;
	rates: Array<CurrencyRate>;
	table: string;
};

export type CurrencyYearData = { [year: string]: CurrencyData };

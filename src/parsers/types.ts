export type AssetType = 'Stocks' | 'Forex';

export type ParsedTrade = {
	symbol: string;
	date: string;
	quantity: number;
	tradePrice: number;
	closingPrice?: number;
	proceeds: number;
	commissionFee: number;
	basis?: number;
	realizedPL?: number;
	mtmPL?: number;
	code: string;
	assetType?: AssetType;
	currency?: string;
	splitRatio?: number;
};

export type ParsedDividend = {
	date: string;
	symbol: string;
	amount: number;
	currency?: string;
};

export type ParsedWithholdingTax = {
	date: string;
	symbol: string;
	amount: number;
	code: string;
	currency?: string;
};

export type ParsedCorporateAction = {
	reportDate: string;
	date: string;
	description: string;
	quantity: number;
	proceeds: number;
	value: number;
	realizedPL: number | null;
	code: string;
	assetType?: string;
	currency?: string;
};

export type ParsedStatement = {
	dividends: Array<ParsedDividend>;
	trades: Array<ParsedTrade>;
	withholdingTax: Array<ParsedWithholdingTax>;
	corporateActions: Array<ParsedCorporateAction>;
	years: Array<string>;
};

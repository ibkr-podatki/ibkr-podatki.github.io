export interface Trade {
    symbol: string;
    date: string;
    quantity: number;
    tradePrice: number;
    closingPrice: number | null;
    proceeds: number;
    commissionFee: number;
    basis: number | null;
    realizedPL: number | null;
    mtmPL: number | null;
    code: string;
    assetType?: string;
    currency?: string;
}

export interface Dividend {
    date: string;
    symbol: string;
    amount: number;
    currency?: string;
}

export interface WithholdingTax {
    date: string;
    symbol: string;
    amount: number;
    code: string;
    currency?: string;
} 


export type CombinedDividendData = {
    symbol: string;
    date: string;
    amount: number;
    withheldTax: number;
    amountAfterTax: number;
    taxPercentage: number;
    currency?: string
  }

export type ParsedStatementData = {
    dividends: Array<Dividend>;
    trades: Array<Trade>;
    withholdingTax: Array<WithholdingTax>;
    years: Array<string>
}

export type TradeInLocalCurrency = {
    symbol: string;
    date: string;
    quantity: number;
    totalInOriginalCurrency: number;
    originalCurrency: number;
    totalInLocalCurrency: number;
    localCurrency: string;
}

export type DividendWithLocalCurrency = CombinedDividendData & {
   currencyRate: number;
}

export type CurrencyRate = {
    effectiveDate: string;
    mid: number;
    no: string;
}

export type CurrencyData = {
    code: string;
    currency: string;
    rates: Array<CurrencyRate>;
    table: string;
}
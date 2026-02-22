import type { ParsedCorporateAction, ParsedTrade } from '../parsers/types';
import { type StockSplit, type Trade } from '../types';
import { getSplitRatio, parseTicker } from './utils';

export const getTradesWithStockSplit = (
	trades: Array<ParsedTrade>,
	corporateActions: Array<ParsedCorporateAction>
): Array<Trade | StockSplit> => {
	const pasedStockSplits: Array<StockSplit> = corporateActions
		.filter(action => action.description.includes('Split'))
		.map(action => ({
			symbol: parseTicker(action.description) ?? '',
			splitRatio: getSplitRatio(action.description) ?? 1,
			date: action.date,
			assetType: 'Stock split'
		}));

	const tradesDataWithoutForex: Array<Trade> = trades
		.filter(trade => trade.assetType === 'Stocks')
		.map(trade => ({
			symbol: trade.symbol,
			date: trade.date,
			quantity: trade.quantity,
			tradePrice: trade.tradePrice,
			commissionFee: trade.commissionFee,
			currency: trade.currency ?? 'USD',
			assetType: 'Stocks'
		}));

	return [...tradesDataWithoutForex, ...pasedStockSplits].sort((a, b) =>
		new Date(a.date) > new Date(b.date) ? -1 : 1
	);
};

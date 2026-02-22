import {
	type TradeHistoryTaxData,
	type CurrencyData,
	type StockSplit,
	type Trade,
	isStockSplit,
	type TradeHistory
} from '../types';
import { getCurrencyForDate, getYearFromString } from './utils';

type SymbolHistory = {
	quantity: number;
	costBasis: number;
	costBasisInLocalCurrency: number;
};

// trades should be sorted by date
export const getTradesHistory = (
	trades: Array<Trade | StockSplit>,
	currenciesData: Record<string, CurrencyData>
): Array<TradeHistory> => {
	const symbolsHistoryMap: { [symbol: string]: SymbolHistory } = {};
	const tradesHistory: Array<TradeHistory> = [];

	for (let i = trades.length - 1; i > -1; i--) {
		const trade = trades[i];

		if (!symbolsHistoryMap[trade.symbol]) {
			symbolsHistoryMap[trade.symbol] = {
				quantity: 0,
				costBasis: 0,
				costBasisInLocalCurrency: 0
			};
		}

		const { quantity, costBasis, costBasisInLocalCurrency } = symbolsHistoryMap[trade.symbol];

		if (isStockSplit(trade)) {
			const splitRatio = trade.splitRatio ?? 1;
			symbolsHistoryMap[trade.symbol] = {
				quantity: quantity / splitRatio,
				costBasis: costBasis / splitRatio,
				costBasisInLocalCurrency: costBasisInLocalCurrency / splitRatio
			};

			continue;
		}

		const tradeType = trade.quantity < 0 ? 'SELL' : 'BUY';
		const year = getYearFromString(trade.date);
		const currencyYearData = year ? currenciesData[year] : undefined;
		const formattedTradeDate = new Date(trade.date).toISOString().slice(0, 10);
		const currencyRate = currencyYearData
			? getCurrencyForDate(formattedTradeDate, currencyYearData)
			: 1;

		const tradeVolume = trade.quantity * trade.tradePrice - trade.commissionFee;
		const tradePriceInLocalCurrency = trade.tradePrice * currencyRate;
		const comissionFeeInLocalCurrency = trade.commissionFee * currencyRate;
		const tradeVolumeInLocalCurrency =
			trade.quantity * tradePriceInLocalCurrency - comissionFeeInLocalCurrency;

		let tradeHistoryTaxData: TradeHistoryTaxData | undefined = undefined;

		if (tradeType === 'SELL') {
			const buyingCost = -(trade.quantity * costBasis);
			const buyingCostInLocalCurrency = -(trade.quantity * costBasisInLocalCurrency);
			const sellingCost = -tradeVolume;
			const sellingCostInLocalCurrency = -tradeVolumeInLocalCurrency;
			const profit = sellingCost - buyingCost;
			const profitInLocalCurrency = sellingCostInLocalCurrency - buyingCostInLocalCurrency;

			tradeHistoryTaxData = {
				buyingCost,
				buyingCostInLocalCurrency,
				sellingCost,
				sellingCostInLocalCurrency,
				profit,
				profitInLocalCurrency
			};
		}

		const newQuantity = quantity + trade.quantity;
		const newCostBasis =
			newQuantity === 0
				? 0
				: (quantity * costBasis + tradeVolume) / (quantity + trade.quantity);
		const newCostBasisInLocalCurrency =
			newQuantity === 0
				? 0
				: (quantity * costBasisInLocalCurrency + tradeVolumeInLocalCurrency) /
					(quantity + trade.quantity);

		symbolsHistoryMap[trade.symbol] = {
			quantity: newQuantity,
			costBasis: newCostBasis,
			costBasisInLocalCurrency: newCostBasisInLocalCurrency
		};

		tradesHistory.push({
			symbol: trade.symbol,
			date: trade.date,
			currencyRate: currencyRate,
			tradeType,
			quantity: trade.quantity,
			price: trade.tradePrice,
			comissionFee: trade.commissionFee,
			position: {
				quantity: newQuantity,
				costBasis: newCostBasis,
				costBasisInLocalCurrency: newCostBasisInLocalCurrency
			},
			taxData: tradeHistoryTaxData
		});
	}

	return tradesHistory;
};

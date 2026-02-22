import type { TradeWithLocalCurrency, TradeHistoryTaxData } from '../types';

type SymbolHistory = {
	quantity: number;
	costBasis: number;
	costBasisInLocalCurrency: number;
};

// trades should be sorted by date
export const getTradesHistory = (trades: Array<TradeWithLocalCurrency>) => {
	const symbolsHistoryMap: { [symbol: string]: SymbolHistory } = {};

	const tradesHistory = [];

	for (let i = trades.length - 1; i > -1; i--) {
		const trade = trades[i];
		const tradeType = trade.quantity < 0 ? 'SELL' : 'BUY';

		if (!symbolsHistoryMap[trade.symbol]) {
			symbolsHistoryMap[trade.symbol] = {
				quantity: 0,
				costBasis: 0,
				costBasisInLocalCurrency: 0
			};
		}

		const { quantity, costBasis, costBasisInLocalCurrency } = symbolsHistoryMap[trade.symbol];

		if (trade.assetType === 'Stock split') {
			const splitRatio = trade.splitRatio ?? 1;
			symbolsHistoryMap[trade.symbol] = {
				quantity: quantity / splitRatio,
				costBasis: costBasis / splitRatio,
				costBasisInLocalCurrency: costBasisInLocalCurrency / splitRatio
			};

			continue;
		}

		const tradeVolume = trade.quantity * trade.tradePrice - trade.commissionFee;
		const tradePriceInLocalCurrency = trade.tradePrice * trade.currencyRate;
		const comissionFeeInLocalCurrency = trade.commissionFee * trade.currencyRate;
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
			currencyRate: trade.currencyRate,
			tradeType,
			quantity: trade.quantity,
			price: trade.tradePrice,
			priceInLocalCurrency: tradePriceInLocalCurrency,
			comissionFee: trade.commissionFee,
			comissionFeeInLocalCurrency,
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

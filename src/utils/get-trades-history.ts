import type { TradeWithLocalCurrency } from "../types";

type SymbolHistory = {
    quantity: number;
    costBasis: number;
    costBasisInLocalCurrency: number;
}

// trades should be sorted by date
export const getTradesHistory = (trades: Array<TradeWithLocalCurrency>) => {
    const symbolsHistoryMap: {[symbol: string]: SymbolHistory} = {};

    const tradesHistory = [];

    for (let i = trades.length -1; i > -1; i--) {
        const trade = trades[i];
        const tradeType = trade.quantity < 0 ? 'SELL' : 'BUY';

        if (!symbolsHistoryMap[trade.symbol]) {
            symbolsHistoryMap[trade.symbol] = {
                quantity: 0,
                costBasis: 0,
                costBasisInLocalCurrency: 0
            }
        }

        const {quantity, costBasis, costBasisInLocalCurrency} = symbolsHistoryMap[trade.symbol];

        const tradeVolume = trade.quantity * trade.tradePrice - trade.commissionFee;
        const tradePriceInLocalCurrency = trade.tradePrice * trade.currencyRate;
        const comissionFeeInLocalCurrency = trade.commissionFee * trade.currencyRate;
        const tradeVolumeInLocalCurrency = trade.quantity * tradePriceInLocalCurrency - comissionFeeInLocalCurrency;

        let profit = 0;
        let profitInLocalCurrency = 0;

        if (tradeType === 'SELL') {
            profit = -(tradeVolume - trade.quantity * costBasis);
            profitInLocalCurrency = -(tradeVolumeInLocalCurrency - trade.quantity * costBasisInLocalCurrency);
        }

        const newQuantity = quantity + trade.quantity;
        const newCostBasis = newQuantity === 0 ? 0 : (quantity * costBasis + tradeVolume) / (quantity + trade.quantity);
        const newCostBasisInLocalCurrency = newQuantity === 0 ? 0 : (quantity * costBasisInLocalCurrency + tradeVolumeInLocalCurrency) / (quantity + trade.quantity);

        symbolsHistoryMap[trade.symbol] = {
            quantity: newQuantity,
            costBasis: newCostBasis,
            costBasisInLocalCurrency: newCostBasisInLocalCurrency,
        }

        tradesHistory.push({
            symbol: trade.symbol,
            date: trade.date,
            currencyRate: trade.currencyRate,
            tradeType,
            tradeQuantity: trade.quantity,
            tradePrice: trade.tradePrice,
            tradePriceInLocalCurrency,
            tradeComissionFee: trade.commissionFee,
            totalQuantity: newQuantity,
            costBasis: newCostBasis,
            costBasisInLocalCurrency: newCostBasisInLocalCurrency,
            profit,
            profitInLocalCurrency,
        });
    }

    return tradesHistory;
}
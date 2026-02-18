import type { CombinedDividendData, Dividend, WithholdingTax } from "../types";
import { roundNumber } from "./utils";

const groupData = (dividends: Dividend[] | WithholdingTax[]) => Object.values(
    dividends.reduce((acc, item) => {
      const key = `${item.date}_${item.symbol}_${item.currency}`;
  
      if (!acc[key]) {
        acc[key] = { ...item };
      } else {
        acc[key].amount += item.amount;
      }
  
      return acc;
    }, {} as Record<string, Dividend | WithholdingTax>)
  );

export const getDividendsTotal = (dividendsData: Dividend[], withholdingTaxData: WithholdingTax[]): CombinedDividendData[] => {
    // though dividends could be paid in one day, they may have separate records
    const groupedDividends = groupData(dividendsData);
    const groupedWithholdingTaxData = groupData(withholdingTaxData);
    
    return groupedDividends.map((dividend) => {
        const withheldTax = Math.abs(groupedWithholdingTaxData.find((tax) => {
            return (tax.date === dividend.date
                && tax.symbol === dividend.symbol
                && tax.currency === dividend.currency
                && tax.amount + dividend.amount > 0);
        })?.amount ?? 0);
  
        return {
          symbol: dividend.symbol,
          date: dividend.date,
          amount: dividend.amount,
          withheldTax: roundNumber(withheldTax, 2),
          amountAfterTax: roundNumber(dividend.amount - withheldTax, 2),
          taxPercentage: Math.abs(roundNumber(withheldTax / dividend.amount * 100)),
          currency: dividend.currency
        }
      });
}
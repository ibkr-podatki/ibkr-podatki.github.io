import type { Dividend } from '../../types';
import { DOUBLE_TAXATION_TREATY_PERCENT } from '../../utils/utils';

export const DIVIDEND_TAX_PERCENT = 0.19;

// we can't just subtract paid tax from total tax,
// because paid tax can be more that 15% treaty to avoid double taxation
export const calculateDeductableTax = (dividend: Dividend) => {
	const deductableTax = dividend.amount * DOUBLE_TAXATION_TREATY_PERCENT * dividend.currencyRate;
	const paidTax = dividend.withheldTax * dividend.currencyRate;

	if (paidTax > deductableTax) {
		return deductableTax;
	}

	return paidTax;
};

export const calculateDividendTax = (dividend: Dividend) => {
	const totalDividendTax = dividend.amount * DIVIDEND_TAX_PERCENT * dividend.currencyRate;
	const deductableTax = calculateDeductableTax(dividend);

	return totalDividendTax - deductableTax;
};

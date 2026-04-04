import './number-cell.css';

export const splitNumberIntoThousands = (
	number: number
): { isNegative: boolean; groups: Array<string>; fraction: string } => {
	if (!Number.isFinite(number)) {
		return { isNegative: false, groups: [], fraction: '' };
	}

	const isNegative = number < 0;
	const [integer, fraction] = Math.abs(number).toFixed(2).split('.');

	const groups: Array<string> = [];
	for (let i = integer.length; i > 0; i -= 3) {
		groups.unshift(integer.slice(Math.max(0, i - 3), i));
	}

	return { isNegative, groups, fraction };
};

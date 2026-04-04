import { useMemo } from 'react';
import { splitNumberIntoThousands } from './utils';

type Props = {
	number: number;
};

export const NumberCell = ({ number }: Props) => {
	const { groups, isNegative, fraction } = useMemo(
		() => splitNumberIntoThousands(number),
		[number]
	);

	if (!Number.isFinite(number)) {
		return number;
	}

	return (
		<span className="number-cell">
			{isNegative && '-'}
			{groups.map((g, i) => (
				<span key={i} className="number-cell__group">
					{g}
				</span>
			))}
			{!!Number(fraction) && <span>,{fraction}</span>}
		</span>
	);
};

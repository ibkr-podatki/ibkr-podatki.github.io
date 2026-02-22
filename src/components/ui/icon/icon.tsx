import React from 'react';
import { Icons, type IconType } from './icons';
import { Skeleton } from '../skeleton/skeleton';

type Props = {
	icon: IconType;
	className?: string;
	size?: string;
	color?: string;
};

export const Icon = ({ icon, size = '24px', color = 'inherit', className }: Props) => {
	const SvgIcon = Icons[icon];

	if (!SvgIcon) {
		return null;
	}

	return (
		<React.Suspense fallback={<Skeleton width={size} height={size} />}>
			<SvgIcon
				className={`flex-shrink-0 ${className}`}
				style={{
					width: size,
					height: size,
					fill: color
				}}
			/>
		</React.Suspense>
	);
};

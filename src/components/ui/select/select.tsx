import { useCallback, type ChangeEvent } from 'react';
import './select.css';

type Props<T> = {
	options: Array<T>;
	value: T | undefined;
	onChange: (value: T) => void;
	id?: string;
	className?: string;
};

export const Select = <T extends string>({ id, options, value, onChange, className }: Props<T>) => {
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			onChange(e.target.value as T);
		},
		[onChange]
	);

	return (
		<select id={id} onChange={handleChange} value={value} className={`select ${className}`}>
			{options.map(option => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
};

import { useCallback, useMemo, useState } from 'react';
import type { CurrencyYearData } from '../../types';
import type { ParsedStatementCurrencyGroup } from '../../parsers/types';
import { Button } from '../ui/button/button';
import './calculate-button.css';
import { fetchCurrenciesData, getCurrenciesByYears } from './utils';

type Props = {
	currencies: Array<ParsedStatementCurrencyGroup>;
	onCurrenciesDataLoaded: (currenciesData: CurrencyYearData) => void;
};

export const CalculateButton = ({ currencies, onCurrenciesDataLoaded }: Props) => {
	const [error, setError] = useState<string | null>(null);

	const currenciesByYears = useMemo(() => getCurrenciesByYears(currencies), [currencies]);

	const handleClick = useCallback(async () => {
		try {
			const yearToCurrency = await fetchCurrenciesData(currenciesByYears);
			onCurrenciesDataLoaded(yearToCurrency);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to get currency data';
			setError(errorMessage);
			console.error('Error fetching currency data:', err);
		}
	}, [currenciesByYears, onCurrenciesDataLoaded]);

	return (
		<div className="calculate-button-wrapper">
			<Button onClick={handleClick} disabled={!currenciesByYears.length}>
				Rozlicz podatki
			</Button>

			{error && (
				<div style={{ color: 'red', marginTop: '10px' }}>
					Error fetching currency data: {error}
				</div>
			)}
		</div>
	);
};

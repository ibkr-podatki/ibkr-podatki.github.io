import { useCallback, useState } from "react";
import type { CurrencyData } from "../types"
import { getCurrencyData } from "../utils/utils";


type Props = {
    years: Array<string>;
    onCurrenciesDataLoaded: (currenciesData: Record<string, CurrencyData>) => void;
}

export const CalculateButton = ({ years, onCurrenciesDataLoaded }: Props) => {
    const [error, setError] = useState<string | null>(null);

    const handleClick = useCallback(async () => {
        try {
            const currenciesData = await Promise.all(years.map((year) => getCurrencyData(year, 'USD')));

            const yearToCurrency: Record<string, CurrencyData> = {};
            years.forEach((year, index) => {
                yearToCurrency[year] = currenciesData[index];
            });

            onCurrenciesDataLoaded(yearToCurrency);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get currency data';
            setError(errorMessage);
            console.error('Error fetching currency data:', err);
        }

    }, [years, onCurrenciesDataLoaded]);

    return <>
        <button onClick={handleClick} disabled={!years.length}>
            Rozlicz podatki
        </button>

        {error && (
            <div style={{ color: 'red', marginTop: '10px' }}>
                Error fetching currency data: {error}
            </div>
        )}
    </>
}
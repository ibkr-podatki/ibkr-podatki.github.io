import { useState } from 'react';
import type { Dividend, ParsedStatementData, Trade, WithholdingTax } from '../types';
import { parseDividendsTable } from '../parsers/parse-dividends';
import { parseTradesTable } from '../parsers/parse-trades';
import { parseWithholdingTaxTable } from '../parsers/parse-withholding-tax';
import { stringToDocument } from '../utils/utils';
import { parseYear } from '../parsers/parse-year';


type Props = {
    onParsedData: (data: ParsedStatementData) => void;
}

export const UploadFiles = ({ onParsedData }: Props) => {
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) {
            return;
        }

        setError(null);

        try {
            let parsedDividends: Array<Dividend> = [];
            let parsedTrades: Array<Trade> = [];
            let parsedWithholdingTax: Array<WithholdingTax> = [];
            const parsedYears: Array<string> = [];

            for (const file of files) {
                const htmlContent = await file.text();
                const doc = stringToDocument(htmlContent);

                parsedDividends = [...parsedDividends, ...parseDividendsTable(doc)];
                parsedTrades = [...parsedTrades, ...parseTradesTable(doc)];
                parsedWithholdingTax = [...parsedWithholdingTax, ...parseWithholdingTaxTable(doc)];
                const parsedYear = parseYear(doc);

                if (parsedYear) {
                    parsedYears.push(parsedYear);
                }
            }

            onParsedData({
                dividends: parsedDividends.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1),
                trades: parsedTrades,
                withholdingTax: parsedWithholdingTax.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1),
                years: parsedYears.sort((a, b) => a > b ? -1 : 1)
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
            setError(errorMessage);
            console.error('Error parsing file:', err);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".htm,.html"
                multiple
                onChange={handleFileChange}
            />
            {error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    Error parsing data: {error}
                </div>
            )}
        </div>
    );
}
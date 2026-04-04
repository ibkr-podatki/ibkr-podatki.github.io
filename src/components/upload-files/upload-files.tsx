import { useState } from 'react';
import type {
	ParsedCorporateAction,
	ParsedDividend,
	ParsedStatement,
	ParsedTrade,
	ParsedWithholdingTax
} from '../../parsers/types';
import { parseDividendsTable } from '../../parsers/parse-dividends';
import { parseTradesTable } from '../../parsers/parse-trades';
import { parseWithholdingTaxTable } from '../../parsers/parse-withholding-tax';
import { parseYear } from '../../parsers/parse-year';
import { parseCorporateActionsTable } from '../../parsers/parse-corporate-actions';
import './upload-files.css';
import { Icon } from '../ui/icon';
import { UploadedFile } from './uploaded-file';
import { stringToDocument } from './utils';

type ParsedFileInfo = { year: string; fileName: string; hasError?: boolean };

type Props = {
	onParsedData: (data: ParsedStatement) => void;
};

export const UploadFiles = ({ onParsedData }: Props) => {
	const [parsedFiles, setParsedFiles] = useState<Array<ParsedFileInfo>>([]);
	const [error, setError] = useState<string | undefined>();

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;

		if (!files) {
			return;
		}

		setError(undefined);

		let currentYear: string = '';
		let currentFileName: string = '';
		const parsesFilesInfo: Array<ParsedFileInfo> = [];

		try {
			const parsedDividends: Array<ParsedDividend> = [];
			const parsedTrades: Array<ParsedTrade> = [];
			const parsedWithholdingTax: Array<ParsedWithholdingTax> = [];
			const parsedCorporateActions: Array<ParsedCorporateAction> = [];
			const parsedYears: Array<string> = [];

			for (const file of files) {
				const htmlContent = await file.text();
				const doc = stringToDocument(htmlContent);

				currentFileName = file.name;
				currentYear = parseYear(doc);
				parsedDividends.push(...parseDividendsTable(doc));
				parsedTrades.push(...parseTradesTable(doc));
				parsedWithholdingTax.push(...parseWithholdingTaxTable(doc));
				parsedYears.push(currentYear);
				parsedCorporateActions.push(...parseCorporateActionsTable(doc));

				parsesFilesInfo.push({ year: currentYear, fileName: currentFileName });
			}

			onParsedData({
				dividends: parsedDividends.sort((a, b) =>
					new Date(a.date) > new Date(b.date) ? -1 : 1
				),
				trades: parsedTrades.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1)),
				withholdingTax: parsedWithholdingTax.sort((a, b) =>
					new Date(a.date) > new Date(b.date) ? -1 : 1
				),
				years: parsedYears.sort((a, b) => (a > b ? -1 : 1)),
				corporateActions: parsedCorporateActions
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
			setError(errorMessage);
			console.error('Error parsing file:', err);

			parsesFilesInfo.push({ year: currentYear, fileName: currentFileName, hasError: true });
		}

		setParsedFiles(parsesFilesInfo);
	};

	return (
		<div className="upload-files no-print">
			<label className="upload-files__upload-box" htmlFor="file-upload">
				<Icon icon="cloud-upload" size="36px" color="#ccc" />
				<p className="text-center">
					Upload activity statements for all years
					<br />
					<i>*htm, html format</i>
				</p>
				<input
					id="file-upload"
					type="file"
					accept=".htm,.html"
					multiple
					onChange={handleFileChange}
				/>
			</label>

			{parsedFiles.map((fileInfo, i) => (
				<UploadedFile
					key={`${fileInfo.year}-${fileInfo.fileName}-${i}`}
					fileName={fileInfo.fileName}
					year={fileInfo.year}
					hasError={fileInfo.hasError}
				/>
			))}

			{error && (
				<div style={{ color: 'red', marginTop: '10px' }}>Error parsing data: {error}</div>
			)}
		</div>
	);
};

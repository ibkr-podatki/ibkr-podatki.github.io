import { useMemo, type ReactNode } from 'react';
import './table.css';

type Props = {
	data: Array<Record<string, ReactNode>>;
	includeCountColumn?: boolean;
};

export const Table = ({ data, includeCountColumn }: Props) => {
	const columns = useMemo(() => {
		const columns = data[0] ? Object.keys(data[0]) : [];

		if (includeCountColumn) {
			columns.unshift('');
		}

		return columns;
	}, [data, includeCountColumn]);

	return (
		<table className="table">
			<thead>
				<tr>
					{columns.map(column => (
						<td key={column}>{column}</td>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row, rowInded) => (
					<tr key={`$row-${rowInded}}`}>
						{includeCountColumn && <td>{rowInded + 1}</td>}
						{Object.values(row).map((columnData, columnIndex) => (
							<td key={`column-${rowInded}-${columnIndex}`}>{columnData}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};

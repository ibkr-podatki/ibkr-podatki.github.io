import { useMemo, type ReactNode } from "react";
import './table.css';

type Props = {
    data: Array<Record<string, ReactNode>>
}

export const Table = ({ data }: Props) => {
    const columns = useMemo(() => {
        if (!data[0]) {
            return [];
        }

        return Object.keys(data[0]);
    }, []);


    return <table className="table">
        <thead>
            <tr>
                {
                    columns.map(column => <td key={column}>{column}</td>)
                }
            </tr>
        </thead>
        <tbody>
            {
                data.map((row, rowInded) => <tr key={`$row-${rowInded}}`}>
                    {
                        Object.values(row).map((columnData, columnIndex) => <td key={`column-${rowInded}-${columnIndex}`}>{columnData}</td>)
                    }
                </tr>)
            }
        </tbody>
    </table>
}
import { useCallback, type ChangeEvent } from "react";

type Props = {
    id: string;
    options: Array<string>;
    value?: string;
    onChange: (value: string) => void;
}

export const Select = ({ id, options, value, onChange }: Props) => {
    const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    }, [onChange]);


    return (<>
        <select id={id} onChange={handleChange} value={value}>
            {
                options.map(option => (<option
                    key={option}
                    value={option}
                >
                    {option}
                </option>))
            }
        </select>
    </>)
}
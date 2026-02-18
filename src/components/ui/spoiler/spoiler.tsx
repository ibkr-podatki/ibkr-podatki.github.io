import { useCallback, useState, type PropsWithChildren, type ReactNode } from "react";
import './spoiler.css';
import { Icon } from "../icon/icon";

type Props = PropsWithChildren<{
    title: ReactNode;
}>;

export const Spoiler = ({ title, children }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    return <div className={`spoiler ${isOpen ? 'open' : ''}`}>
        <button className="spoiler-button" onClick={handleClick}>
            <div>{title}</div>
            <Icon icon="chevron-down" className="spoiler-icon" />
        </button>

        <div className="spoiler-content">{children}</div>
    </div>
}
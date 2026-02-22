import type { ButtonHTMLAttributes } from 'react';
import './button.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ className, ...props }: Props) => {
	return <button className={`button ${className}`} {...props} />;
};

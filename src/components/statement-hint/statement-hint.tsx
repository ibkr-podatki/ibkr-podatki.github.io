import { useState } from 'react';
import HintImage from './hint.png';
import './statement-hint.css';

export const StatementHint = () => {
	const [isShowHint, setIsShowHint] = useState(false);

	return (
		<>
			<div className="text-center">
				<button
					className={`statement-hint__button mt-4 ${isShowHint ? 'active' : ''}`}
					onClick={() => setIsShowHint(value => !value)}
				>
					Jak poprawnie wygenerować "Activity statements"?
				</button>
			</div>

			{isShowHint && (
				<div>
					<ol className="mb-4">
						<li>Zaloguj się do Interactive Brokers</li>
						<li>
							Wybierz Performance & Reports &rarr; Statements &rarr; Activity
							Statement
						</li>
						<li>Period: Annual</li>
						<li>
							Pobierz HTML Statement dla <b>wszystkich lat</b>, które są dostępne
						</li>
					</ol>

					<img className="statement-hint__img" src={HintImage} alt="" />
				</div>
			)}
		</>
	);
};

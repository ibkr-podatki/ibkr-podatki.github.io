import { getYearFromString } from '../utils/utils';

export const parseYear = (doc: Document): string => {
	const titleText = doc.querySelector('title')?.innerText;

	if (titleText) {
		const year = getYearFromString(titleText);
		if (year) {
			return year;
		}
	}

	throw new Error('Cannot parse statement year');
};

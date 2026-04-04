export const stringToDocument = (htmlContent: string): Document => {
	const parser = new DOMParser();
	return parser.parseFromString(htmlContent, 'text/html');
};

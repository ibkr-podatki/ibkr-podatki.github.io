import { getYearFromString } from "../utils/utils";

export const parseYear = (doc: Document): string | undefined => {
    const titleText = doc.querySelector('title')?.innerText;

    if (!titleText) {
        return;
    }
    
    return getYearFromString(titleText);
};
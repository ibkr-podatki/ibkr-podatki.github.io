export const parseYear = (doc: Document): string | undefined => {
    const titleText = doc.querySelector('title')?.innerText;

    if (!titleText) {
        return;
    }

    // 4 numbers should be a year
    const match = titleText.match(/\b\d{4}\b/);
    const year = match?.at(0);
    
    return year ?? undefined;
};
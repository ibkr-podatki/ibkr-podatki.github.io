import type { CorporateAction } from "../types";

export const parseCorporateActionsTable = (doc: Document): CorporateAction[] => {
    // Find the element with id starting with tblCorporateActions_
    const container = Array.from(doc.querySelectorAll('[id^="tblCorporateActions_"]')).find(
        (el) => el.id.startsWith('tblCorporateActions_')
    );

    if (!container) {
        return [];
    }

    // Find the table inside the container
    const table = container.querySelector('table');
    if (!table) {
        return [];
    }

    const rows = Array.from(table.querySelectorAll('tr'));
    const actions: CorporateAction[] = [];
    let currentAssetType = '';
    let currentCurrency = 'USD';

    const parseNumber = (text: string): number | null => {
        if (!text || text.trim() === '' || text.trim() === '--' || text.trim() === '&nbsp;') {
            return null;
        }
        const cleaned = text.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    };

    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));

        // Skip header row
        if (row.querySelector('th')) {
            continue;
        }

        // Check if this is an asset type header row (Stocks, Forex, etc.)
        const assetCell = row.querySelector('td.header-asset');
        if (assetCell) {
            const assetText = assetCell.textContent?.trim() || '';
            if (assetText) {
                currentAssetType = assetText;
            }
            continue;
        }

        // Check if this is a currency header row
        const currencyCell = row.querySelector('td.header-currency');
        if (currencyCell) {
            const currencyText = currencyCell.textContent?.trim() || '';
            if (currencyText) {
                currentCurrency = currencyText;
            }
            continue;
        }

        // Check if this is a total/subtotal row
        const isTotalRow =
            row.classList.contains('subtotal') ||
            row.classList.contains('total') ||
            cells.some((cell) => {
                const text = cell.textContent?.trim().toLowerCase() || '';
                return text.includes('total') && !text.includes('symbol');
            });

        if (isTotalRow) {
            continue;
        }

        // Parse corporate action row (8 cells: Report Date, Date/Time, Description, Quantity, Proceeds, Value, Realized P/L, Code)
        if (cells.length >= 8) {
            const reportDate = cells[0].textContent?.trim() || '';
            const date = cells[1].textContent?.trim() || '';
            const description = cells[2].textContent?.trim() || '';
            const quantityText = cells[3].textContent?.trim() || '';
            const proceedsText = cells[4].textContent?.trim() || '';
            const valueText = cells[5].textContent?.trim() || '';
            const realizedPLText = cells[6].textContent?.trim() || '';
            const code = cells[7].textContent?.trim() || '';

            const quantity = parseNumber(quantityText);
            const proceeds = parseNumber(proceedsText);
            const value = parseNumber(valueText);
            const realizedPL = parseNumber(realizedPLText);

            // Only add if we have valid data (at least report date and description)
            if (reportDate && description) {
                actions.push({
                    reportDate,
                    date,
                    description,
                    quantity: quantity ?? 0,
                    proceeds: proceeds ?? 0,
                    value: value ?? 0,
                    realizedPL,
                    code,
                    assetType: currentAssetType,
                    currency: currentCurrency,
                });
            }
        }
    }

    return actions;
};

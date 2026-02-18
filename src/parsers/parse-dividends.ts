import type { Dividend } from "../types";
import { parseTicker } from "../utils/utils";


export const parseDividendsTable = (doc: Document): Dividend[] => {
    // Find the element with id starting with tblCombDiv
    const dividendsContainer = Array.from(doc.querySelectorAll('[id^="tblCombDiv"]')).find(
        (el) => el.id.startsWith('tblCombDiv')
    );

    if (!dividendsContainer) {
        throw new Error('Dividends table not found');
    }

    // Find the table inside the container
    const table = dividendsContainer.querySelector('table');
    if (!table) {
        throw new Error('Table not found in dividends container');
    }

    const rows = Array.from(table.querySelectorAll('tr'));
    const dividends: Dividend[] = [];
    let currentCurrency = 'USD'; // Default currency

    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));

        // Skip header row
        if (row.querySelector('th')) {
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
        const isTotalRow = row.classList.contains('subtotal') ||
            row.classList.contains('total') ||
            cells.some(cell => cell.textContent?.trim().toLowerCase().includes('total'));

        if (isTotalRow) {
            continue;
        }

        // Parse dividend row (should have 3 cells: Date, Description, Amount)
        if (cells.length >= 3) {
            const date = cells[0].textContent?.trim() || '';
            const description = cells[1].textContent?.trim() || '';
            const amountText = cells[2].textContent?.trim() || '';

            // Parse amount (remove any formatting, handle negative numbers)
            const amount = parseFloat(amountText.replace(/[^\d.-]/g, '')) || 0;
            const symbol = parseTicker(description);

            // Only add if we have valid data
            if (date && symbol && !isNaN(amount)) {
                dividends.push({
                    date,
                    symbol,
                    amount,
                    currency: currentCurrency
                });
            } else {
                console.error('Invalid dividend data:', { date, description, amount });
            }
        }
    }

    return dividends;
};
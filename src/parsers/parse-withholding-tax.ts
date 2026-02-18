import { parseTicker } from "../utils/utils";
import type { WithholdingTax } from "../types";



export const parseWithholdingTaxTable = (doc: Document): WithholdingTax[] => {
    // Find the element with id starting with tblWithholdingTax_
    const withholdingTaxContainer = Array.from(doc.querySelectorAll('[id^="tblWithholdingTax_"]')).find(
        (el) => el.id.startsWith('tblWithholdingTax_')
    );

    if (!withholdingTaxContainer) {
        throw new Error('Withholding tax table not found');
    }

    // Find the table inside the container
    const table = withholdingTaxContainer.querySelector('table');
    if (!table) {
        throw new Error('Table not found in withholding tax container');
    }

    const rows = Array.from(table.querySelectorAll('tr'));
    const withholdingTaxes: WithholdingTax[] = [];
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

        // Parse withholding tax row (should have 4 cells: Date, Description, Amount, Code)
        if (cells.length >= 4) {
            const date = cells[0].textContent?.trim() || '';
            const description = cells[1].textContent?.trim() || '';
            const amountText = cells[2].textContent?.trim() || '';
            const code = cells[3].textContent?.trim() || '';

            // Parse amount (remove any formatting, handle negative numbers)
            const amount = parseFloat(amountText.replace(/[^\d.-]/g, '')) || 0;
            const symbol = parseTicker(description);

            // Only add if we have valid data
            if (date && symbol && !isNaN(amount)) {
                withholdingTaxes.push({
                    date,
                    symbol,
                    amount,
                    code,
                    currency: currentCurrency
                });
            } else {
                console.error('Invalid withholding tax data:', { date, description, amount });
            }
        }
    }

    return withholdingTaxes;
};


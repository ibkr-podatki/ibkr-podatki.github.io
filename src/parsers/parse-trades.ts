import type { Trade } from "../types";

export const parseTradesTable = (doc: Document): Trade[] => {
    // Find the element with id starting with tblTransactions_
    const tradesContainer = Array.from(doc.querySelectorAll('[id^="tblTransactions_"]')).find(
        (el) => el.id.startsWith('tblTransactions_')
    );

    if (!tradesContainer) {
        throw new Error('Trades table not found');
    }

    // Find the table inside the container
    const table = tradesContainer.querySelector('table');
    if (!table) {
        throw new Error('Table not found in trades container');
    }

    const rows = Array.from(table.querySelectorAll('tr'));
    const trades: Trade[] = [];
    let currentAssetType = '';
    let currentCurrency = 'USD'; // Default currency

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
        const isTotalRow = row.classList.contains('subtotal') ||
            row.classList.contains('total') ||
            cells.some(cell => {
                const text = cell.textContent?.trim().toLowerCase() || '';
                return text.includes('total') && !text.includes('symbol');
            });

        if (isTotalRow) {
            continue;
        }

        // Parse trade row (should have 11 cells: Symbol, Date/Time, Quantity, T. Price, C. Price, Proceeds, Comm/Fee, Basis, Realized P/L, MTM P/L, Code)
        if (cells.length >= 11) {
            const symbol = cells[0].textContent?.trim() || '';
            const date = cells[1].textContent?.trim() || '';
            const quantityText = cells[2].textContent?.trim() || '';
            const tradePriceText = cells[3].textContent?.trim() || '';
            const closingPriceText = cells[4].textContent?.trim() || '';
            const proceedsText = cells[5].textContent?.trim() || '';
            const commissionFeeText = cells[6].textContent?.trim() || '';
            const basisText = cells[7].textContent?.trim() || '';
            const realizedPLText = cells[8].textContent?.trim() || '';
            const mtmPLText = cells[9].textContent?.trim() || '';
            const code = cells[10].textContent?.trim() || '';

            // Helper function to parse number, handling empty strings and non-numeric values
            const parseNumber = (text: string): number | null => {
                if (!text || text.trim() === '' || text.trim() === '--' || text.trim() === '&nbsp;') {
                    return null;
                }
                const cleaned = text.replace(/[^\d.-]/g, '');
                const parsed = parseFloat(cleaned);
                return isNaN(parsed) ? null : parsed;
            };

            const quantity = parseNumber(quantityText);
            const tradePrice = parseNumber(tradePriceText);
            const closingPrice = parseNumber(closingPriceText);
            const proceeds = parseNumber(proceedsText);
            const commissionFee = parseNumber(commissionFeeText);
            const basis = parseNumber(basisText);
            const realizedPL = parseNumber(realizedPLText);
            const mtmPL = parseNumber(mtmPLText);

            // Only add if we have valid data (at least symbol and date)
            if (symbol && date && quantity !== null && tradePrice !== null && proceeds !== null) {
                trades.push({
                    symbol,
                    date,
                    quantity: quantity || 0,
                    tradePrice: tradePrice || 0,
                    closingPrice,
                    proceeds: proceeds || 0,
                    commissionFee: commissionFee || 0,
                    basis,
                    realizedPL,
                    mtmPL,
                    code,
                    assetType: currentAssetType,
                    currency: currentCurrency
                });
            }
        }
    }

    return trades;
};


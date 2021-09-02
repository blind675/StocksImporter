import {fetchTickerDividendsForSymbol, fetchTickerPriceForSymbol} from "../services/API/Polygon";
import {isTestDataImported} from "./utils";
import TestTickerModel from "../models/TestTicker";
import {Intervals} from "../models/constants";

/**
 * @deprecated use only for tests / development
 */
export async function updateTestScore() {

    if (!await isTestDataImported()) {
        console.log(`Test     : No Test Data Set. Please call 'createTestDataset()' first.`);
        return;
    }

    const tickers = await TestTickerModel.find({})
    console.log(`Updater  : Start updating score for ${tickers.length} records.`);

    // for (let i = 0; i < tickers.length; i++) {
    for (let i = 0; i < 1; i++) {

        const ticker = tickers[i];
        // get the dividends for the last year
        console.log(' Ticker: ', ticker.symbol);

        const tickerDividendsResponse = await fetchTickerDividendsForSymbol(ticker.symbol);

        if (!tickerDividendsResponse) {
            // TODO: write in problems Data Set
            break;
        }

        // TODO: - extract in function ?
        //find how many dividends were payed in 2020
        const lastYearDivCount = tickerDividendsResponse.filter((dividends) =>
            dividends.exDate.includes('2020')
        ).length;

        if (lastYearDivCount === 0) {
            ticker.dividendsRegularity = Intervals.None;
            ticker.paysDividends = false;
        } else if (lastYearDivCount <= 4) {
            ticker.dividendsRegularity = lastYearDivCount;
            ticker.paysDividends = true;
        } else if (lastYearDivCount <= 12) {
            ticker.dividendsRegularity = Intervals.Monthly;
            ticker.paysDividends = true;
        } else if (lastYearDivCount > 12) {
            ticker.dividendsRegularity = Intervals.Weekly;
            ticker.paysDividends = true;
        }

        // store dividends history
        ticker.dividendsHistory = tickerDividendsResponse
            .map((dividends) => (
                {
                    exDate: new Date(dividends.exDate),
                    paymentDate: new Date(dividends.paymentDate),
                    amount: dividends.amount
                })
            )

        if (!ticker.priceHistory) {
            ticker.priceHistory = [];
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const tickerPriceResponseYesterday = await fetchTickerPriceForSymbol(ticker.symbol, yesterday);

        if (!tickerPriceResponseYesterday) {
            // TODO: write in problems Data Set
            break;
        } else {
            ticker.priceHistory.push({
                date: yesterday,
                price: Math.round(tickerPriceResponseYesterday?.open + tickerPriceResponseYesterday?.close / 2)
            })
        }


        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        oneYearAgo.setDate(oneYearAgo.getDate() - 1);

        // TODO: extract in function - code duplicate
        if (!isPriceDataInList(oneYearAgo, ticker.priceHistory)) {
            const tickerPriceResponseOneYearAgo = await fetchTickerPriceForSymbol(ticker.symbol, oneYearAgo);

            if (!tickerPriceResponseOneYearAgo) {
                // TODO: write in problems Data Set
                break;
            } else {
                ticker.priceHistory.push({
                    date: yesterday,
                    price: Math.round(tickerPriceResponseOneYearAgo?.open + tickerPriceResponseOneYearAgo?.close / 2)
                })
            }
        }

        // TODO: filter dividends list to get 1 year old
        // TODO: iterate over the dividends history 1 year ago


        // TODO: calculate the score for yesterday - external function


        // TODO: calculate position change ??

        // TODO: save the ticker data

    }

}

function isPriceDataInList(date: Date, list: { date: Date; price: number }[]) {
    return !!list.find((priceData) => priceData.date === date);
}

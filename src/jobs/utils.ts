import TickerModel, {Ticker} from "../models/Ticker";
import TestTicker from "../models/TestTicker";
import TestTickerModel from "../models/TestTicker";
import Problems from "../models/Problems";
import {fetchTickerPriceForSymbol} from "../services/API/Polygon";
import {formatDateForAPIRequest} from "../services/utils";
import {addClosedDate, isMarketClosedOnDate} from "../actions/loadClosedDates";

export async function isDataAlreadyImported() {
    const tickersCount = await TickerModel.estimatedDocumentCount();

    return tickersCount > 1000;
}

export async function reportAProblemForTicker(ticker: string, message: string) {

    const problem = new Problems({
        ticker,
        problem: message
    });

    await problem.save();
}

// TODO: refactor this in to something like
// getPriceForDate(... ascending, descending, ) - find the first valid date asc/desc - store the all dats - and invalid ones
export function getPriceForDate(date: Date, ticker: Ticker) {
    return ticker.priceHistory?.find((priceData) => priceData.date.getTime() === date.getTime())?.price
}

export async function importPriceForDate(date: Date, ticker: Ticker) {
    if (!ticker.priceHistory) {
        ticker.priceHistory = [];
    }

    if (!isPriceDataInList(date, ticker.priceHistory)) {
        const tickerPriceResponse = await fetchTickerPriceForSymbol(ticker.symbol, date);

        if (!tickerPriceResponse) {
            await reportAProblemForTicker(ticker.symbol, `No PRICE Data - date: ${formatDateForAPIRequest(date)}`);
            if (!isMarketClosedOnDate(date)) {
                await addClosedDate(date);
            }


            return false;
        } else {
            ticker.priceHistory.push({
                date: date,
                price: tickerPriceResponse.close
            })
        }
    }

    return true;
}

function isPriceDataInList(date: Date, list: { date: Date; price: number }[]) {
    return !!list.find((priceData) => priceData.date.getTime() === date.getTime());
}

/**
 * @deprecated use only for tests / development
 */
export async function isTestDataImported() {
    const testTickersCount = await TestTickerModel.estimatedDocumentCount();

    return testTickersCount > 3;
}

/**
 * @deprecated use only for tests / development
 */
export async function createTestDataset() {
    console.log(`Test     : Create Test Data Set`);

    if(await isTestDataImported()) {
        console.log(`Test     : Already imported`);

        return;
    }

    // move 10 tickers to a test dataset
    const tickers = await TickerModel.find({}).limit(11);

    for (let i = 0; i < 10; i++) {
        const testTicker = new TestTicker({
            symbol: tickers[i].symbol,
            name: tickers[i].name,
            tracking: tickers[i].tracking
        });

        await testTicker.save();
    }

    console.log(`Test     : Test Data set Imported`);
}

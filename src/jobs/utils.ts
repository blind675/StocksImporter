import TickerModel from "../models/Ticker";
import TestTicker from "../models/TestTicker";
import TestTickerModel from "../models/TestTicker";
import Problems from "../models/Problems";

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
    const tickers = await TickerModel.find({}).limit(20);

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

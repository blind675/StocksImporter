import TickerModel from "../models/Ticker";
import TestTicker from "../models/TestTicker";
import TestTickerModel from "../models/TestTicker";

export async function isDataAlreadyImported() {
    const tickersCount = await TickerModel.estimatedDocumentCount();

    return tickersCount > 1000;
}

/**
 * @deprecated use only for tests / development
 */
export async function isTestDataImported() {
    const testTickersCount = await TestTickerModel.estimatedDocumentCount();

    return testTickersCount > 10;
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

    // move 20 tickers to a test dataset
    const tickers = await TickerModel.find({}).limit(20);

    for (let i = 0; i < 20; i++) {
        const testTicker = new TestTicker({
            symbol: tickers[i].symbol,
            name: tickers[i].name,
            tracking: tickers[i].tracking
        });

        await testTicker.save();
    }

    console.log(`Test     : Done`);
}

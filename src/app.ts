import {createTestDataset, isDataAlreadyImported} from "./jobs/utils";
import {updateTickersDetails} from "./jobs/updateDetails";
import {importTickers} from "./jobs/importTickers";
import TickerModel from "./models/Ticker";
import TestTicker from "./models/TestTicker";
import {updateTestScore} from "./jobs/updateScore";

export default async function startServer() {

    const isDataImported = await isDataAlreadyImported();
    if (isDataImported) {
        console.log('Importer : Data already imported');
    } else {
        // import tickers
        await importTickers();

        // update tickers details
        await updateTickersDetails();
    }

    createTestDataset();
    updateTestScore();

}

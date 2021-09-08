import {loadClosedDates} from "./jobs/loadClosedDates";
import {createTestDataset, isDataAlreadyImported} from "./jobs/utils";
import {updateTickersDetails} from "./jobs/updateDetails";
import {importTickers} from "./jobs/importTickers";
import {updateTestScore} from "./jobs/updateScore";

export default async function startServer() {
    await loadClosedDates();

    const isDataImported = await isDataAlreadyImported();
    if (isDataImported) {
        console.log('Importer : Data already imported');
    } else {
        // import tickers
        await importTickers();

        // update tickers details
        await updateTickersDetails();
    }

    await createTestDataset();
    await updateTestScore();

}

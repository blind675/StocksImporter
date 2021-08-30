import {isDataAlreadyImported} from "./jobs/importCSV";
import {updateTickersDetails} from "./jobs/updateDetails";
import {importTickers} from "./jobs/importTickers";

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

}

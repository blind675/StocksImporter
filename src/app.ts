import {importCSVData, isCSVDataAlreadyImported} from "./jobs/importCSV";

export default async function startServer() {

    const isCSVImported = await isCSVDataAlreadyImported();
    if(isCSVImported) {
        console.log('Importer : CSV data already imported');
    } else {
        await importCSVData();
    }

    // TODO: start cron jobs
}

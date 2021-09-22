import * as cron from 'node-cron';
import {loadClosedDates} from "./actions/loadClosedDates";
import {isDataAlreadyImported} from "./jobs/utils";
import {updateTickersDetails} from "./jobs/updateDetails";
import {importTickers} from "./actions/importTickers";
import {backupDBJob} from "./jobs/backupDBJob";
import {updateHistoryJob} from "./jobs/updateHistoryJob";
import {updateScoreJob} from "./jobs/updateScoreJob";

export default async function start() {
    await loadClosedDates();

    const isDataImported = await isDataAlreadyImported();
    if (isDataImported) {
        console.log('Importer : DB Data already imported');
    } else {
        // import tickers
        await importTickers();

        // update tickers details
        await updateTickersDetails();
    }

    // update history cron job
    const updateHistory = cron.schedule('30 4 1-7 * sunday', updateHistoryJob);
    updateHistory.start();

    // backup database cron job
    const backupDB = cron.schedule('5 1 * * 2-6', backupDBJob);
    backupDB.start();

    // update score cron job
    const updateScore = cron.schedule('15 1 * * 2-6', updateScoreJob);
    updateScore.start();
}

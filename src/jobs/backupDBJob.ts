import TickerModel from "../models/Ticker";
import BackupTicker from "../models/BackupTicker";
import TickerBackupModel from "../models/BackupTicker";
import {millisToMinutesAndSeconds} from "../services/utils";

export async function backupDBJob() {
    const startTimestamp = Date.now();

    console.log(`Backup   : ${new Date().toUTCString()}`);
    console.log(`Backup   : DB Backup started`);

    await TickerBackupModel.collection.drop();

    // move 10 tickers to a test dataset
    const tickers = await TickerModel.find({});

    for (let i = 0; i < tickers.length; i++) {
        const backupTicker = new BackupTicker({
            symbol: tickers[i].symbol,
            name: tickers[i].name,
            tracking: tickers[i].tracking,
            details: tickers[i].details,
            paysDividends: tickers[i].paysDividends,
            dividendsRegularity: tickers[i].dividendsRegularity,
            priceHistory: tickers[i].priceHistory,
            dividendsHistory: tickers[i].dividendsHistory,
            yieldHistory: tickers[i].yieldHistory,
            yield: tickers[i].yield,
            position: tickers[i].position,
            movement: tickers[i].movement
        });

        await backupTicker.save();
    }

    const endTimestamp = Date.now();
    console.log(`Backup   : DB Backed Up`);
    console.log(`Backup   : Action took ${millisToMinutesAndSeconds(endTimestamp - startTimestamp)}`);
}

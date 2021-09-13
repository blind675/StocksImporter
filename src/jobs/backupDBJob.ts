import TickerModel from "../models/Ticker";
import BackupTicker from "../models/BackupTicker";
import TickerBackupModel from "../models/BackupTicker";

export async function backupDBJob() {
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

    console.log(`Backup   : DB Backed Up`);
}

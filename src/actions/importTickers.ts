import {fetchTickers} from "../services/API/Polygon";
import Ticker from "../models/Ticker";

const cliProgress = require('cli-progress');

export async function importTickers() {
    console.log('Importer : Start fetch tickers');

    // fetch ticker
    const tickers = await fetchTickers();

    if(tickers) {
        console.log(`Importer : Got ${tickers.length} tickers`);
        console.log('Importer : Save to DB ');

        // create a new progress bar instance and use shades_classic theme
        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

        // start the progress bar with a total value of 200 and start value of 0
        progressBar.start(tickers.length - 1, 0);

        // save in DB
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];

            const tick = new Ticker({
                symbol: ticker.ticker,
                name: ticker.name,
                type: ticker.type,
                details: {
                    exchange: ticker.primary_exchange,
                    county: ticker.locale,
                    currency: ticker.currency_name,
                    isin: ticker.cik
                }
            });
            await tick.save();

            progressBar.update(i);
        }

        // stop the progress bar
        progressBar.stop();
        console.log('Importer : Done ');
    } else {
        console.log('Importer : No tickers found');
    }
}

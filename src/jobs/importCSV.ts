import readCSV from "../services/csv";
import TickerModel from "../models/Ticker";
import Ticker from "../models/Ticker";

const cliProgress = require('cli-progress');

export async function importCSVData() {

    console.log('Importer : Start reading CSV file');
    const CSVData = await readCSV();
    console.log(`Importer : Read ${CSVData.length} rows`);

    console.log('Importer : Start importing CSV data');
    // create a new progress bar instance and use shades_classic theme
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    // start the progress bar with a total value of 200 and start value of 0
    progressBar.start(CSVData.length - 1, 0);

    for (let i = 0; i < CSVData.length; i++) {
        const CSVRow = CSVData[i];

        if (CSVRow.Type && CSVRow.Code && CSVRow.Type) {
            const ticker = new Ticker({
                symbol: CSVRow.Code,
                name: CSVRow.Name,
                type: CSVRow.Type
            });
            await ticker.save();
        }

        // update the current value in your application..
        progressBar.update(i);
    }

    // stop the progress bar
    progressBar.stop();
    console.log('Importer : Finished importing CSV data');
}

export async function isCSVDataAlreadyImported() {
    const tickersCount = await TickerModel.estimatedDocumentCount();

    return tickersCount > 10;
}

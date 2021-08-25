import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

// TODO: move to constants
const relativeCSVPath = '../../resources';
const CSVFile = 'TICKERS_US.csv';

export interface ITickersCsvRow {
    Code: string;
    Name: string;
    Country: string;
    Exchange: string;
    Currency: string;
    Type: string;
    Isin: string;
}

export default async function readCSV(): Promise<ITickersCsvRow[]> {

    const data: ITickersCsvRow[] = [];

    return new Promise<ITickersCsvRow[]>((resolve, reject) => {
        fs.createReadStream(path.resolve(__dirname, relativeCSVPath, CSVFile))
            .pipe(csv.parse<ITickersCsvRow, ITickersCsvRow>({headers: true}))
            .on('error', error => reject(error))
            .on('data', row => data.push(row))
            .on('end', (rowCount: number) => resolve(data))
    });
}

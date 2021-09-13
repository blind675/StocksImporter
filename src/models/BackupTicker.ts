import {model} from 'mongoose';
import {Ticker, TickerSchema} from "./Ticker";

export interface BackupTicker extends Ticker {
}

const TickerBackupModel = model<BackupTicker>('TickersBackup', TickerSchema);

export default TickerBackupModel;

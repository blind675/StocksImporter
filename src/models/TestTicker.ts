import {model} from 'mongoose';
import {Ticker, TickerSchema} from "./Ticker";

export interface TestTicker extends Ticker {
}

const TestTickerModel = model<TestTicker>('TestTickers', TickerSchema);

export default TestTickerModel;

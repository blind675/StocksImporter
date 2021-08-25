import { Schema, Document, model } from 'mongoose';

export interface Ticker extends Document{
    symbol: string;
    name: string;
    type: string;
    exchange?: string;
    description?: string;
    county?: string;
    currency?: string;
    isin?: string;
    // pays_dividends?: boolean;
    // dividends_regularity?: string; //week/month/quarter/year;
    priceHistory?: [ {
        date: Date;
        price: number // = open+close / 2;
    } ]
    // events_history?: [ {
    //     date: Date;
    //     type: string; //split/dividends;
    //     payout: number;
    //     split_ratio: number;
    //     price: number; //open+close / 2;
    // } ]
}

const TickerSchema = new Schema<Ticker>({
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    exchange: String,
    description: String,
    county: String,
    currency: String,
    isin: String,
    priceHistory: [{
        date: { type: Date, required: true },
        price: { type: Number, required: true },
    }]
});

const TickerModel = model<Ticker>('Tickers', TickerSchema);

module.exports = TickerModel;

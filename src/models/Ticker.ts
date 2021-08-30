import { Schema, Document, model } from 'mongoose';

export interface Ticker extends Document{
    symbol: string;
    name: string;
    type?: string;
    details?: {
        exchange?: string;
        county?: string;
        currency?: string;
        isin?: string;

        description?: string;
        url?: string;
        logo?: string;
        industry?: string;
        sector?: string;
        phone?: string;
        address?: string;
        state?: string;
    }
    tracking?: {
        updatedDetails?: boolean;
        updatePriceDate?: Date;
        updateHistoryDate?: Date;
    }
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
    type: String,
    details: {
        exchange: String,
        county: String,
        currency: String,
        isin: String,
        description: String,
        url: String,
        logo: String,
        industry: String,
        sector: String,
        phone: String,
        address: String,
        state: String
    },
    exchange: String,
    description: String,
    county: String,
    currency: String,
    isin: String,
    priceHistory: [{
        date: { type: Date, required: true },
        price: { type: Number, required: true },
    }],
    tracking: {
        updatedDetails: Boolean,
        updatePriceDate: Date,
        updateHistoryDate: Date,
    }
});

const TickerModel = model<Ticker>('Tickers', TickerSchema);

export default TickerModel;
// module.exports = TickerModel;

import {Schema, Document, model} from 'mongoose';

export interface TestTicker extends Document {
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
    paysDividends?: boolean;
    dividendsRegularity?: number; //week/month/quarter/year;
    priceHistory?: {
        date: Date;
        price: number // = open+close / 2;
    } [];
    dividendsHistory?: {
        exDate: Date;
        paymentDate: Date;
        amount: number;
    } [];
}

const TestTickerSchema = new Schema<TestTicker>({
    symbol: {type: String, required: true},
    name: {type: String, required: true},
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
    paysDividends: Boolean,
    dividendsRegularity: Number,
    priceHistory: [{
        date: {type: Date, required: true},
        price: {type: Number, required: true},
    }],
    dividendsHistory: [{
        exDate: {type: Date, required: true},
        paymentDate: {type: Date, required: true},
        amount: {type: Number, required: true},
    }],
    tracking: {
        updatedDetails: Boolean,
        updatePriceDate: Date,
        updateHistoryDate: Date,
    }
});

const TestTickerModel = model<TestTicker>('TestTickers', TestTickerSchema);

export default TestTickerModel;

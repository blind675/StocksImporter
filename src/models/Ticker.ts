import {Schema, Document, model} from 'mongoose';

export enum Movement {
    up = 'up',
    down = 'down',
    none = 'none',
}

export interface Yield {
    total: number;
    growth: number;
    dividends: number;
    autoInvest: number;
    date?: Date;
}

export interface Ticker extends Document {
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
    }[];
    dividendsHistory?: {
        exDate: Date;
        paymentDate: Date;
        amount: number;
    }[];
    yieldHistory?: Yield[],
    yield?: Yield;
    position?: number;
    movement?: {
        direction: Movement;
        lastPosition: number;
        lastMoveDate: Date;
    }[];
}

export const TickerSchema = new Schema<Ticker>({
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
    },
    yieldHistory: [{
        total: {type: Number, required: true},
        growth: {type: Number, required: true},
        dividends: {type: Number, required: true},
        autoInvest: {type: Number, required: true},
        date: Date
    }],
    yield: {
        total: {type: Number, required: false},
        growth: {type: Number, required: false},
        dividends: {type: Number, required: false},
        autoInvest: {type: Number, required: false},
        date: {type: Date, required: false},
    },
    position: Number,
    movement: [{
        lastPosition: {type: Number, required: true},
        direction: {type: String, required: true},
        lastMoveDate: {type: Date, required: true},
    }]
});

const TickerModel = model<Ticker>('Tickers', TickerSchema);

export default TickerModel;

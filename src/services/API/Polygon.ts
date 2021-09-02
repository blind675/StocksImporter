import axios from "axios";
import {formatDateForAPIRequest, sleep} from "../utils";
import {API_DELAY, EXCHANGES, PAGE_SIZE} from "../../constants";

export interface ITickerDetailsResponse {
    logo: string;
    listdate: string;
    industry: string;
    sector: string
    marketcap: number
    employees: number
    phone: string;
    ceo: string;
    url: string;
    description: string;
    exchange: string;
    name: string;
    symbol: string;
    exchangeSymbol: string;
    hq_address: string;
    hq_state: string
    hq_country: string
    type: string;
    updated: string;
    tags: string[];
    similar: string[];
    active: boolean;
}

export async function fetchTickerDetailsForSymbol(tickerSymbol: string): Promise<ITickerDetailsResponse | undefined> {
    try {
        await sleep(API_DELAY); // API limitation - remove if payed account

        const URL = process.env.POLYGON_BASE_URL + `v1/meta/symbols/${tickerSymbol}/company?&apiKey=` + process.env.POLYGON_KEY;
        const response = await axios.get(URL);

        const tickerDetails = response.data as ITickerDetailsResponse;

        // Old ticker - discard
        if (!tickerDetails.active) {
            return undefined;
        }

        return tickerDetails;
    } catch (error) {
        // fetch ticker error - discard
        return undefined;
    }
}

export interface ITickerResponse {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    currency_name: string;
    cik: string;
    last_updated_utc: Date;
}

export async function fetchTickers(): Promise<ITickerResponse[] | undefined> {
    type responseType = {
        data: {
            results: ITickerResponse[],
            status: string,
            request_id: string,
            count: number,
            next_url: string,
        }
    }

    let tickersList: ITickerResponse[] = [];

    try {
        //loop trough exchanges
        for (let i = 0; i < EXCHANGES.length; i++) {
            const exchange = EXCHANGES[i];

            await sleep(API_DELAY); // API limitation - remove if payed account

            const start_url = process.env.POLYGON_BASE_URL + `v3/reference/tickers?market=stocks&exchange=${exchange}&active=true&sort=ticker&order=asc&limit=${PAGE_SIZE}&apiKey=` + process.env.POLYGON_KEY;
            let response = await axios.get(start_url) as responseType;
            tickersList = tickersList.concat(response.data.results);

            while (response.data.next_url) {
                await sleep(API_DELAY);

                const next_url = response.data.next_url + '&apiKey=' + process.env.POLYGON_KEY;
                response = await axios.get(next_url) as responseType;
                tickersList = tickersList.concat(response.data.results);
            }
        }

        return tickersList;
    } catch (error) {
        // fetch ticker error
        return undefined;
    }
}

export interface ITickerDividendsResponse {
    amount: number;
    exDate: string;
    paymentDate: string;
    recordDate: string;
    ticker: string;
}

export async function fetchTickerDividendsForSymbol(tickerSymbol: string): Promise<ITickerDividendsResponse[] | undefined> {
    type responseType = {
        count: number,
        results: ITickerDividendsResponse[],
        status: string
    }

    try {
        await sleep(API_DELAY); // API limitation - remove if payed account

        const URL = process.env.POLYGON_BASE_URL + `v2/reference/dividends/${tickerSymbol}?&apiKey=` + process.env.POLYGON_KEY;
        const response = await axios.get(URL);

        const tickerDividendsResponse = response.data as responseType;

        if(tickerDividendsResponse.status === "OK" ) {
            return tickerDividendsResponse.results;
        }

        console.log('   -----   Error response .STATUS: ',  tickerDividendsResponse.status);
        console.log('   -----   Error response .COUNT: ',  tickerDividendsResponse.count);

    } catch (error) {
        // fetch ticker error - discard
        return undefined;
    }

    return undefined;
}

export interface ITickerPriceResponse {
    afterHours: number;
    close: number;
    from: string;
    high: number;
    low: number;
    open: number;
    preMarket: number;
    status: string;
    symbol: string;
    volume: number;
}

export async function fetchTickerPriceForSymbol(tickerSymbol: string, date: Date): Promise<ITickerPriceResponse | undefined> {
    try {
        await sleep(API_DELAY); // API limitation - remove if payed account

        const URL = process.env.POLYGON_BASE_URL + `v1/open-close/${tickerSymbol}/${formatDateForAPIRequest(date)}?adjusted=true&apiKey=` + process.env.POLYGON_KEY;
        const response = await axios.get(URL);

        const tickerPriceResponse = response.data as ITickerPriceResponse;

        if(tickerPriceResponse.status === "OK" ) {
            return tickerPriceResponse;
        }

    } catch (error) {
        // fetch ticker error - discard
        return undefined;
    }

    return undefined;
}

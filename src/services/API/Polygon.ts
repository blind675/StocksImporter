import axios from "axios";
import {sleep} from "../utils";
import {API_DELAY, EXCHANGES, PAGE_SIZE} from "../../constants";

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

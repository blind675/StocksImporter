import TickerModel, {Ticker} from "../models/Ticker";
import {fetchTickerDetailsForSymbol, ITickerDetailsResponse} from "../services/API/Polygon";
import {minutesToDaysHoursMinutes} from "../services/utils";

function composeTickerDetails(detailsResponse: ITickerDetailsResponse, ticker: Ticker) {

    return {
        exchange: ticker.details?.exchange,
        county: ticker.details?.county,
        currency: ticker.details?.currency,
        isin: ticker.details?.isin,
        description: detailsResponse.description,
        url: detailsResponse.url,
        logo: detailsResponse.logo,
        industry: detailsResponse.industry,
        sector: detailsResponse.sector,
        phone: detailsResponse.phone,
        address: detailsResponse.hq_address,
        state: detailsResponse.hq_state
    }
}

export async function updateTickersDetails() {

    const tickersCount = await TickerModel.countDocuments();
    console.log(`Updater  : Start updating details for ${tickersCount} records.`);

    let updatedRecordsCount = 0;
    let removedRecordsCount = 0;

    for (let i = 0; i < tickersCount; i++) {

        // get ticker with null info update param (or oldest)
        const ticker: Ticker | null = await TickerModel.findOne({
            $or: [
                {tracking: {$exists: false}},
                {"tracking.updatedDetails": {$exists: false}}
            ]
        });

        console.log(`Updater  : ${i} / ${tickersCount} ~ ${minutesToDaysHoursMinutes(Math.floor(((tickersCount - i) / 5)))}`);

        if (ticker) {

            console.log('Updater  : - Found ticker to update. Symbol: ', ticker.symbol);

            // make API call
            const tickerDetailsResponse = await fetchTickerDetailsForSymbol(ticker.symbol);

            if (!tickerDetailsResponse) {
                console.log('Updater  : - No details for ticker symbol: ', ticker.symbol);
                console.log('         :   Remove ticker');
                await ticker.remove();

                removedRecordsCount += 1;

            } else {
                console.log('Updater  : - Got details for ticker symbol: ', ticker.symbol);

                //put back in DB
                await TickerModel.updateOne({symbol: ticker.symbol}, {
                        details: composeTickerDetails(tickerDetailsResponse, ticker),
                        tracking: {updatedDetails: true}
                    }
                );

                updatedRecordsCount += 1;
            }
        }
    }

    console.log(`Updater  : Finished updating details`);
    console.log(`         : Updated ${updatedRecordsCount} records`);
    console.log(`         : Removed ${removedRecordsCount} records`);
}

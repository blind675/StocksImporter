import {importPriceForDate, reportAProblemForTicker} from "./utils";
import {fetchTickerDividendsForSymbol, ITickerDividendsResponse} from "../services/API/Polygon";
import {Intervals} from "../models/constants";
import {correctDate, isMarketClosedOnDate} from "../actions/loadClosedDates";
import {millisToMinutesAndSeconds} from "../services/utils";
import TickerModel from "../models/Ticker";

const cliProgress = require('cli-progress');

export async function updateHistoryJob() {
    const startTimestamp = Date.now();

    const tickers = await TickerModel.find({})
    console.log(`Updater  : ${new Date().toUTCString()}`);
    console.log(`Updater  : Start updating history for ${tickers.length} records.`);

    // create a new progress bar instance and use shades_classic theme
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    // start the progress bar with a total value of 200 and start value of 0
    progressBar.start(tickers.length, 0);

    for (let i = 0; i < tickers.length; i++) {

        const ticker = tickers[i];
        // get the dividends for the last year
        // console.log(' Ticker: ', ticker.symbol);

        const tickerDividendsResponse = await fetchTickerDividendsForSymbol(ticker.symbol);

        if (!tickerDividendsResponse) {
            await reportAProblemForTicker(ticker.symbol, "No dividends data from API from Ticker");
        } else {

            const intervalInfo = dividendsIntervalFromResponse(tickerDividendsResponse);
            ticker.dividendsRegularity = intervalInfo.interval;
            ticker.paysDividends = intervalInfo.paysDividends;

            // store dividends history
            ticker.dividendsHistory = tickerDividendsResponse
                .filter((dividends) =>
                    (dividends.exDate.includes('2020') && dividends.paymentDate.includes('2020') )
                    || dividends.exDate.includes('2021') && dividends.paymentDate.includes('2021')
                )
                .map((dividends) => {
                    const exDate = new Date(dividends.exDate);
                    exDate.setHours(12, 0, 0, 0);

                    const paymentDate = new Date(dividends.paymentDate);
                    paymentDate.setHours(12, 0, 0, 0);

                    return {
                        exDate,
                        paymentDate,
                        amount: dividends.amount
                    }
                })

            for (let j = 0; j < ticker.dividendsHistory.length; j++) {
                const date = ticker.dividendsHistory[j].paymentDate;

                const yesterdayDate = new Date();
                yesterdayDate.setHours(12, 0, 0, 0);
                yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                correctDate(yesterdayDate);

                if(date.getTime() < yesterdayDate.getTime() ) {
                    // if market is closed on that day ask for next day
                    // correct for weekends
                    // always move in future
                    if (isMarketClosedOnDate(date)) {
                        date.setDate(date.getDate() + 1);
                        if (date.getDay() === 6) { // saturday
                            date.setDate(date.getDate() + 2);
                        }
                    }

                    await importPriceForDate(date, ticker);
                }
            }

            await ticker.save();
        }

        progressBar.update(i);
    }

    progressBar.stop();
    const endTimestamp = Date.now();
    console.log(`Updater  : Finished updating history for ${tickers.length} records.`);
    console.log(`Updater  : Action took ${millisToMinutesAndSeconds(endTimestamp - startTimestamp)}`);
}

function dividendsIntervalFromResponse(dividendsResponseList: ITickerDividendsResponse[]) {

    //find how many dividends were payed in 2020
    const lastYearDivCount = dividendsResponseList.filter((dividends) =>
        dividends.exDate.includes('2020') && dividends.paymentDate.includes('2020')
    ).length;

    if (lastYearDivCount === 0) {
        return {interval: Intervals.None, paysDividends: false};
    } else if (lastYearDivCount <= 4) {
        return {interval: lastYearDivCount, paysDividends: true};
    } else if (lastYearDivCount <= 12) {
        return {interval: Intervals.Monthly, paysDividends: true};
    } else if (lastYearDivCount > 12) {
        return {interval: Intervals.Weekly, paysDividends: true};
    }

    return {interval: Intervals.None, paysDividends: false};
}

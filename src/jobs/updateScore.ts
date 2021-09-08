import {
    fetchTickerDividendsForSymbol,
    fetchTickerPriceForSymbol,
    ITickerDividendsResponse
} from "../services/API/Polygon";
import {isTestDataImported, reportAProblemForTicker} from "./utils";
import TestTickerModel from "../models/TestTicker";
import {Intervals} from "../models/constants";
import {Movement, Ticker, Yield} from "../models/Ticker";
import {formatDateForAPIRequest, millisToMinutesAndSeconds} from "../services/utils";
import {addClosedDate, isMarketClosedOnDate} from "./loadClosedDates";

/**
 * @deprecated use only for tests / development
 */
export async function updateTestScore() {
    if (!await isTestDataImported()) {
        console.log(`Test     : No Test Data Set. Please call 'createTestDataset()' first.`);
        return;
    }

    const startTimestamp = Date.now();

    const tickers = await TestTickerModel.find({})
    console.log(`Updater  : Start updating score for ${tickers.length} records.`);

    const yesterdayDate = new Date();
    yesterdayDate.setHours(12, 0, 0, 0);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    correctDate(yesterdayDate);

    const oneYearAgoDate = new Date();
    oneYearAgoDate.setHours(12, 0, 0, 0);
    oneYearAgoDate.setFullYear(oneYearAgoDate.getFullYear() - 1);
    oneYearAgoDate.setMonth(yesterdayDate.getMonth());
    oneYearAgoDate.setDate(yesterdayDate.getDate());
    correctDate(oneYearAgoDate);

    for (let i = 0; i < tickers.length; i++) {
        // for (let i = 4; i < 5; i++) {

        const ticker = tickers[i];
        // get the dividends for the last year
        console.log(' Ticker: ', ticker.symbol);

        const tickerDividendsResponse = await fetchTickerDividendsForSymbol(ticker.symbol);

        if (!tickerDividendsResponse) {
            await reportAProblemForTicker(ticker.symbol, "No dividends data from API from Ticker");
        } else {

            const intervalInfo = dividendsIntervalFromResponse(tickerDividendsResponse);
            ticker.dividendsRegularity = intervalInfo.interval;
            ticker.paysDividends = intervalInfo.paysDividends;

            // store dividends history
            ticker.dividendsHistory = tickerDividendsResponse
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
        }

        let success = await importPriceForDate(yesterdayDate, ticker);
        if (!success) continue;

        success = await importPriceForDate(oneYearAgoDate, ticker);
        if (!success) continue;

        let dividendsValue = 0; // sum up all th dividends received
        let stockCount = 1; // auto invest

        if (ticker.paysDividends) {
            // filter dividends list to get 1 year old
            // also not in the future
            // also sort by time
            const lastYearDividends = ticker.dividendsHistory!
                .filter((dividends) => dividends.paymentDate.getTime() >= oneYearAgoDate.getTime() && dividends.paymentDate.getTime() <= yesterdayDate.getTime())
                .sort((div1, div2) => div1.paymentDate.getTime() - div2.paymentDate.getTime());

            // console.log(' - dividendsRegularity: ', ticker.dividendsRegularity, ' vs last 360 days: ', lastYearDividends.length);

            //check if possible error
            if (lastYearDividends.length != ticker.dividendsRegularity) {
                await reportAProblemForTicker(ticker.symbol, 'Unusual dividends payment');
            }

            // iterate over the dividends history 1 year ago and fetch price for payment date
            for (let i = 0; i < lastYearDividends.length; i++) {
                const date = lastYearDividends[i].paymentDate;

                // if market is closed on that day ask for next day
                // correct for weekends
                // always move in future
                if (isMarketClosedOnDate(date)) {
                    date.setDate(date.getDate() + 1);
                    if (date.getDay() === 6) { // saturday
                        date.setDate(date.getDate() + 2);
                    }
                }

                // console.log(ticker.symbol, ' - ASK: ', date);

                success = await importPriceForDate(date, ticker);
                if (!success) continue;

                // not really optimal since I just added the data
                const stockPrice = getPriceForDate(date, ticker);
                if (stockPrice) {

                    // console.log(ticker.symbol, ' - GOT: ', date, stockPrice, stockCount, lastYearDividends[i].amount);

                    dividendsValue += lastYearDividends[i].amount;
                    stockCount += (stockCount * lastYearDividends[i].amount) / stockPrice;
                }

            }
        }

        // calculate the score
        const priceYearAgo = getPriceForDate(oneYearAgoDate, ticker);
        const priceToday = getPriceForDate(yesterdayDate, ticker);

        if (!priceYearAgo || !priceToday) {
            continue
        }

        const yieldData: Yield = {
            total: (priceToday + dividendsValue - priceYearAgo) / priceYearAgo * 100,      //growth + dividends
            growth: (priceToday - priceYearAgo) / priceYearAgo * 100,
            dividends: dividendsValue / priceToday * 100,
            autoInvest: ((stockCount * priceToday) - priceYearAgo) / priceYearAgo * 100, // auto invested stocks * stock price today
            date: yesterdayDate
        }

        ticker.yield = yieldData;

        if (!ticker.yieldHistory) {
            ticker.yieldHistory = [];
        }
        ticker.yieldHistory.push(yieldData)
    }

    // sort tickers based on total yield
    tickers
        .filter((ticker) => !!ticker.yield?.total)
        .sort((ticker1, ticker2) => ticker2.yield!.total - ticker1.yield!.total)
        .forEach((ticker, index) => {
            // console.log('ticker: ', ticker.symbol, 'yield: ', ticker.yield!.total);

            ticker.position = index;

            if (!ticker.movement || ticker.movement.length === 0) {
                ticker.movement = [{
                    direction: Movement.none,
                    lastPosition: index,
                    lastMoveDate: yesterdayDate
                }]
            } else {
                const lastMovement = ticker.movement[0];
                // // find the closest date
                // const lastMovement = ticker.movement
                //     .filter((tickerMovement) => tickerMovement.lastMoveDate.getTime() < yesterdayDate.getTime())
                //     .sort((tickerMovement1, tickerMovement2) => tickerMovement1.lastMoveDate.getTime() - tickerMovement2.lastMoveDate.getTime())[0]

                if (lastMovement && yesterdayDate !== lastMovement.lastMoveDate) {
                    //calculate position change
                    ticker.movement.push({
                        direction: lastMovement.lastPosition > index ? Movement.up : lastMovement.lastPosition === index ? Movement.none : Movement.down,
                        lastPosition: index,
                        lastMoveDate: yesterdayDate
                    });
                }

            }
        });

    // Save all updated tickers
    for (let i = 0; i < tickers.length; i++) {
        const ticker = tickers[i];
        await ticker.save();
    }

    const endTimestamp = Date.now();
    console.log(`Updater  : Finished updating score for ${tickers.length} records.`);
    console.log(`Updater  : Action took ${millisToMinutesAndSeconds(endTimestamp - startTimestamp)}`);
}

function correctWeekendDays(date: Date) {
    if (date.getDay() === 6) { // saturday
        date.setDate(date.getDate() - 1);
    }
    if (date.getDay() === 0) { // sunday
        date.setDate(date.getDate() - 2);
    }
}

function correctDate(date: Date) {
    correctWeekendDays(date);

    while (isMarketClosedOnDate(date)) {
        date.setDate(date.getDate() - 1);
    }

    correctWeekendDays(date);
}

function getPriceForDate(date: Date, ticker: Ticker) {
    return ticker.priceHistory?.find((priceData) => priceData.date.getTime() === date.getTime())?.price
}

async function importPriceForDate(date: Date, ticker: Ticker) {
    if (!ticker.priceHistory) {
        ticker.priceHistory = [];
    }

    if (!isPriceDataInList(date, ticker.priceHistory)) {
        const tickerPriceResponse = await fetchTickerPriceForSymbol(ticker.symbol, date);

        if (!tickerPriceResponse) {
            await reportAProblemForTicker(ticker.symbol, `No PRICE Data - date: ${formatDateForAPIRequest(date)}`);
            if (!isMarketClosedOnDate(date)) {
                await addClosedDate(date);
            }


            return false;
        } else {
            ticker.priceHistory.push({
                date: date,
                price: tickerPriceResponse.close
            })
        }
    }

    return true;
}

function dividendsIntervalFromResponse(dividendsResponseList: ITickerDividendsResponse[]) {

    //find how many dividends were payed in 2020
    const lastYearDivCount = dividendsResponseList.filter((dividends) =>
        dividends.exDate.includes('2020')
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

function isPriceDataInList(date: Date, list: { date: Date; price: number }[]) {
    return !!list.find((priceData) => priceData.date.getTime() === date.getTime());
}

import {getPriceForDate, importPriceForDate, reportAProblemForTicker} from "./utils";
import TickerModel, {Movement, Yield} from "../models/Ticker";
import {millisToMinutesAndSeconds} from "../services/utils";
import {correctDate, isMarketClosedOnDate} from "../actions/loadClosedDates";

const cliProgress = require('cli-progress');

export async function updateScoreJob() {
    const startTimestamp = Date.now();

    const tickers = await TickerModel.find({})
    console.log(`Updater  : ${new Date().toUTCString()}`);
    console.log(`Updater  : Start updating score for ${tickers.length} records.`);

    // create a new progress bar instance and use shades_classic theme
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    // start the progress bar with a total value of 200 and start value of 0
    progressBar.start(tickers.length, 0);

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

        const ticker = tickers[i];
        // get the dividends for the last year
        // console.log(' Ticker: ', ticker.symbol);

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

                // console.log(Date.now(), ': ',ticker.symbol, ' - ASK: ', date);

                success = await importPriceForDate(date, ticker);
                if (!success) continue;

                // not really optimal since I just added the data
                const stockPrice = getPriceForDate(date, ticker);
                if (stockPrice) {

                    // console.log(Date.now(), ': ',ticker.symbol, ' - GOT: ', date, stockPrice, stockCount, lastYearDividends[i].amount);
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

        progressBar.update(i);
    }

    progressBar.stop();

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

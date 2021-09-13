import ClosedDatesModel from "../models/ClosedDate";
import ClosedDate from "../models/ClosedDate";
import {ClosedDate as ClosedDateType} from "../models/ClosedDate";

// global module scope
let closedDatesList: ClosedDateType[] = [];

export async function loadClosedDates() {
    closedDatesList = await ClosedDatesModel.find({});
}

export async function addClosedDate(date: Date) {
    date.setHours(12, 0, 0, 0);
    const closeDate = new ClosedDate({
        date
    });

    await closeDate.save();

    closedDatesList.push(closeDate);
}

export function isMarketClosedOnDate(date: Date) {
    date.setHours(12, 0, 0, 0);

    return !!closedDatesList.find((closeDate) => {
        return closeDate.date.getTime() === date.getTime()
    });
}

export function correctDate(date: Date) {
    correctWeekendDays(date);

    while (isMarketClosedOnDate(date)) {
        date.setDate(date.getDate() - 1);
    }

    correctWeekendDays(date);
}

function correctWeekendDays(date: Date) {
    if (date.getDay() === 6) { // saturday
        date.setDate(date.getDate() - 1);
    }
    if (date.getDay() === 0) { // sunday
        date.setDate(date.getDate() - 2);
    }
}

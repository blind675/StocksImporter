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

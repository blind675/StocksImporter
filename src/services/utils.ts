export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function millisToMinutesAndSeconds(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${(parseInt(seconds) < 10 ? "0" : "")}${seconds}`;
}


export function minutesToDaysHoursMinutes(minutes: number) {
    const days = Math.floor(minutes / 1440); // 60*24
    const hours = Math.floor((minutes - (days * 1440)) / 60);
    const min = Math.round(minutes % 60);

    if (days > 0) {
        return `${days} days, ${hours} hours, ${min} minutes`;
    } else {
        return `${hours} hours, ${min} minutes`;
    }
}

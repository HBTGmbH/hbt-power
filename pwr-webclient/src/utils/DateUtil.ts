import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
const optionsShortDisplay: DateTimeFormatOptions = {
    year: "numeric",
    month: "short"
};

const optionsTimeOnly: DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric"
}

const format: Intl.DateTimeFormat = new Intl.DateTimeFormat("de-De", optionsShortDisplay);
const formatTimeOnly:Intl.DateTimeFormat = new Intl.DateTimeFormat("de-DE", optionsTimeOnly);

export function formatToShortDisplay(date: Date) {
    return format.format(date);
}


function isOnSameDay(a: Date, b: Date) {
    return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth() && a.getDate() == b.getDate();
}

export function formatToMailDisplay(date: Date) {
    if(isOnSameDay(new Date(), date)) {
        return formatTimeOnly.format(date);
    } else {
        return formatToShortDisplay(date);
    }
}
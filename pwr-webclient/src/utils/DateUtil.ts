import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import {isNullOrUndefined} from 'util';
import {PowerLocalize} from '../localization/PowerLocalizer';
const optionsShortDisplay: DateTimeFormatOptions = {
    year: "numeric",
    month: "short"
};

const optionsTimeOnly: DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric"
};

const optionsDayAndMonth : DateTimeFormatOptions = {
    month: "short",
    day: "2-digit"
};

const format: Intl.DateTimeFormat = new Intl.DateTimeFormat("de-De", optionsShortDisplay);
const formatTimeOnly:Intl.DateTimeFormat = new Intl.DateTimeFormat("de-DE", optionsTimeOnly);
const formatDayAndMonth: Intl.DateTimeFormat = new Intl.DateTimeFormat("de-DE", optionsDayAndMonth);

export function formatToShortDisplay(date: Date) {
    if(isNullOrUndefined(date)) return PowerLocalize.get("Today");
    return format.format(date);
}


function isOnSameDay(a: Date, b: Date) {
    return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth() && a.getDate() == b.getDate();
}

export function formatToMailDisplay(date: Date) {
    if(isOnSameDay(new Date(), date)) {
        return formatTimeOnly.format(date);
    } else {
        return formatDayAndMonth.format(date);
    }
}
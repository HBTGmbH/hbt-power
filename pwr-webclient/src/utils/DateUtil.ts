import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import {PowerLocalize} from '../localization/PowerLocalizer';
import moment from 'moment';

const optionsShortDisplay: DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short'
};

const optionsTimeOnly: DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric'
};

const optionsDayAndMonth: DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit'
};

const optionsOnlyYear: DateTimeFormatOptions = {
    year: 'numeric'
};

const optionsFullDate: DateTimeFormatOptions = {
    year: 'numeric',
    day: '2-digit',
    month: 'long'
};

const optionsFullDateTime: DateTimeFormatOptions = {
    year: 'numeric',
    day: '2-digit',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric'
};

let language = navigator.language || 'de';

const format: Intl.DateTimeFormat = new Intl.DateTimeFormat(language, optionsShortDisplay);
const formatTimeOnly: Intl.DateTimeFormat = new Intl.DateTimeFormat(language, optionsTimeOnly);
const formatDayAndMonth: Intl.DateTimeFormat = new Intl.DateTimeFormat(language, optionsDayAndMonth);
const formatOnlyYear: Intl.DateTimeFormat = new Intl.DateTimeFormat(language, optionsOnlyYear);
const formatFullDate: Intl.DateTimeFormat = new Intl.DateTimeFormat(language, optionsFullDate);
const formatFullDateTime: Intl.DateTimeFormat = new Intl.DateTimeFormat(language, optionsFullDateTime);
const formatNumericDateTime: Intl.DateTimeFormat = new Intl.DateTimeFormat(language, {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

function verifyDataType(date: Date | string): Date {
    if (!date) {
        return null;
    }
    if (typeof date === 'string') {
        return isLocalDate(date) ? fromLocalDate(date) : new Date(date);
    }
    return date;
}

/**
 * Formats a date to a 'short' display.
 *
 * Example: Jan 2017, Aug 2003
 * @param date to be formatted
 * @return formatted date or PowerLocalize.get("Today") if the date is null.
 */
export function formatToShortDisplay(date: Date | string): string {
    date = verifyDataType(date);
    if (!date) {
        return PowerLocalize.get('Today');
    }
    return format.format(date);
}

export function formatToFullLocalizedDateTime(date: Date): string {
    date = verifyDataType(date);
    if (!date) {
        return '???';
    }
    return formatFullDateTime.format(date);
}

const formatRelative = new Intl.RelativeTimeFormat(language, {numeric: 'auto'});

/**
 * Units for {@link formatToRelativeTime}: the largest unit whose threshold the distance reaches
 */
const RELATIVE_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit, seconds: number, from: number }> = [
    {unit: 'year', seconds: 365 * 24 * 3600, from: 330 * 24 * 3600},
    {unit: 'month', seconds: 30 * 24 * 3600, from: 26 * 24 * 3600},
    {unit: 'day', seconds: 24 * 3600, from: 22 * 3600},
    {unit: 'hour', seconds: 3600, from: 45 * 60},
    {unit: 'minute', seconds: 60, from: 45},
];

/**
 * Fuzzy time relative to now, e.g. "vor 3 Stunden", "gestern", "jetzt" (#121)
 */
export function formatToRelativeTime(date: Date | string, now: Date = new Date()): string {
    const verified = verifyDataType(date);
    if (!verified) {
        return '???';
    }
    const seconds = (verified.getTime() - now.getTime()) / 1000;
    const unit = RELATIVE_UNITS.find(candidate => Math.abs(seconds) >= candidate.from);
    if (!unit) {
        return formatRelative.format(0, 'second');
    }
    if (unit.unit === 'day') {
        // Calendar days: 01:00 seen at 23:30 is today, not "gestern"
        const days = calendarDays(verified, now);
        return days === 0 ? formatRelative.format(Math.round(seconds / 3600), 'hour') : formatRelative.format(days, 'day');
    }
    return formatRelative.format(Math.round(seconds / unit.seconds), unit.unit);
}

function calendarDays(date: Date, now: Date): number {
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return Math.round((startOfDay(date) - startOfDay(now)) / (24 * 3600 * 1000));
}

/**
 * Compact date and time, e.g. 21.10.2026, 21:28: for narrow places like a table cell on a phone
 */
export function formatToNumericDateTime(date: Date): string {
    date = verifyDataType(date);
    if (!date) {
        return '???';
    }
    return formatNumericDateTime.format(date);
}

/**
 * Formats a date to a full, human readable localized date.
 *
 * Examples: January 02, 2002, March 17, 2000
 * @param date to be formatted
 * @return formatted date or "???" if the date is null
 */
export function formatFullLocalizedDate(date: Date): string {
    date = verifyDataType(date);
    if (!date) {
        return '???';
    }
    return formatFullDate.format(date);
}

function isOnSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatToMailDisplay(date: Date) {
    if (isOnSameDay(new Date(), date)) {
        return formatTimeOnly.format(date);
    } else {
        return formatDayAndMonth.format(date);
    }
}

export function formatToYear(date: number | string | Date | undefined) {
    if (!date) {
        return PowerLocalize.get('Today');
    }
    const newDate = typeof date === 'number' ? new Date(date) : verifyDataType(date);
    if (!date) {
        return PowerLocalize.get('Today');
    }
    try {
        return formatOnlyYear.format(newDate);
    } catch (e) {
        return '?';
    }
}

/**
 * A date without time and time zone, like Java's LocalDate, in ISO format: 'YYYY-MM-DD'.
 * This is how the services send and expect LocalDate fields, so no time zone conversion happens.
 */
export type LocalDate = string;

const LOCAL_DATE_FORMAT = 'YYYY-MM-DD';

function isLocalDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function today(): LocalDate {
    return moment().format(LOCAL_DATE_FORMAT);
}

/**
 * Takes the calendar date of a picked date in local time. Returns null for an empty date.
 */
export function toLocalDate(date: Date | null | undefined): LocalDate | null {
    return !date ? null : moment(date).format(LOCAL_DATE_FORMAT);
}

/**
 * Converts a local date to a Date at local midnight, e.g. for a date picker. Returns null for an empty date.
 */
export function fromLocalDate(date: LocalDate | null | undefined): Date | null {
    return !date ? null : moment(date, LOCAL_DATE_FORMAT).toDate();
}

export function isInvalidDate(date: Date | null | undefined): boolean {
    return !!date && isNaN(date.getTime());
}

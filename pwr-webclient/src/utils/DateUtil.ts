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

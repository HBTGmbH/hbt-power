const optionsShortDisplay = {
    year: "numeric",
    month: "short"
};

const format: Intl.DateTimeFormat = new Intl.DateTimeFormat("de-De", optionsShortDisplay);

export function formatToShortDisplay(date: Date) {
    return format.format(date);
}
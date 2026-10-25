import {Project} from '../reducers/profile-new/profile/model/Project';
import {formatToShortDisplay, LocalDate, today} from './DateUtil';
import {PowerLocalize} from '../localization/PowerLocalizer';

/**
 * How long and how recently a skill was used in the projects of a profile (#312). Projects have month and year only,
 * so everything counts in months, the first and the last month included. An open end, or one in the future, counts up
 * to the current month.
 */
export interface SkillUsage {
    /** The projects with the skill, the newest first: running ones on top, then by end and start */
    projects: Array<Project>;
    /** Months in projects; overlapping projects count once */
    months: number;
    /** Whether a project with the skill runs this month */
    current: boolean;
    /** The end of the latest project that has started, if none runs */
    lastUsed?: LocalDate;
}

/** Months since year 0, so that months can be counted by subtracting */
const monthIndex = (date: LocalDate): number => {
    const [year, month] = date.split('-').map(Number);
    return year * 12 + month - 1;
};

const usesSkill = (project: Project, skillName: string): boolean => {
    const name = skillName.toLowerCase();
    return (project.skills || []).some(skill => skill.name && skill.name.toLowerCase() === name);
};

/** Open end on top, then the later end, then the later start */
const newestFirst = (a: Project, b: Project): number => {
    if (!a.endDate !== !b.endDate) {
        return a.endDate ? 1 : -1;
    }
    if (a.endDate !== b.endDate) {
        return a.endDate < b.endDate ? 1 : -1;
    }
    return a.startDate === b.startDate ? 0 : a.startDate < b.startDate ? 1 : -1;
};

/** First and last month a project counts for, up to the current month; undefined before it starts */
const countedMonths = (project: Project, currentMonth: number): [number, number] | undefined => {
    if (!project.startDate) {
        return undefined;
    }
    const first = monthIndex(project.startDate);
    const last = Math.min(project.endDate ? monthIndex(project.endDate) : currentMonth, currentMonth);
    return first <= last ? [first, last] : undefined;
};

/** Months of a single project, as counted for the skill */
export function projectMonths(project: Project): number {
    const range = countedMonths(project, monthIndex(today()));
    return range ? range[1] - range[0] + 1 : 0;
}

export function skillUsage(skillName: string, projects: Array<Project>): SkillUsage {
    const currentMonth = monthIndex(today());
    const used = (projects || []).filter(project => usesSkill(project, skillName)).sort(newestFirst);
    const ranges = used.map(project => countedMonths(project, currentMonth))
        .filter(range => range !== undefined)
        .sort((a, b) => a[0] - b[0]);
    // The union of the ranges: a range that starts within the previous one only extends it
    let months = 0;
    let open: [number, number] | undefined;
    for (const range of ranges) {
        if (open && range[0] <= open[1] + 1) {
            open[1] = Math.max(open[1], range[1]);
        } else {
            months += open ? open[1] - open[0] + 1 : 0;
            open = [range[0], range[1]];
        }
    }
    months += open ? open[1] - open[0] + 1 : 0;
    const started = used.filter(project => countedMonths(project, currentMonth) !== undefined);
    const current = started.some(project => !project.endDate || monthIndex(project.endDate) >= currentMonth);
    const lastUsed = current || started.length === 0 ? undefined
        : started.map(project => project.endDate).reduce((a, b) => a > b ? a : b);
    return {projects: used, months, current, lastUsed};
}

/** e.g. "6 J. 4 Mon.", "2 J.", "4 Mon." */
export function formatMonths(months: number): string {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    const parts: Array<string> = [];
    if (years > 0) {
        parts.push(PowerLocalize.getFormatted('Duration.Years', years));
    }
    if (rest > 0 || years === 0) {
        parts.push(PowerLocalize.getFormatted('Duration.Months', rest));
    }
    return parts.join(' ');
}

/** e.g. "6 J. 4 Mon. · aktuell", "1 J. 2 Mon. · zuletzt Mär 2025", "in keinem Projekt" */
export function formatSkillUsage(usage: SkillUsage): string {
    if (usage.projects.length === 0) {
        return PowerLocalize.get('Profile.Skills.Usage.None');
    }
    const when = usage.current ? PowerLocalize.get('Profile.Skills.Usage.Current')
        : usage.lastUsed ? PowerLocalize.getFormatted('Profile.Skills.Usage.LastUsed', formatToShortDisplay(usage.lastUsed))
            : PowerLocalize.get('Profile.Skills.Usage.Planned');
    return PowerLocalize.getFormatted('Profile.Skills.Usage.Summary', formatMonths(usage.months), when);
}

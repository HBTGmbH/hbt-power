import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {Paths} from '../../../Paths';
import {formatToRelativeTime} from '../../../utils/DateUtil';
import {ProfileCheckHint, ProfileCheckHintCode, ProfileCheckHintType, ProfileSection} from '../../../model/check/ProfileCheck';

/**
 * Anchor of a section on the profile page (profile_module), for the jump from a hint (#139)
 */
export function profileSectionAnchor(section: ProfileSection): string {
    return 'profile-section-' + section;
}

/**
 * Where the hint is fixed: the section on the profile page, the skills, the project or a new project
 */
export function hintLink(hint: ProfileCheckHint, initials: string): string {
    if (hint.code === ProfileCheckHintCode.NO_FOLLOW_UP_PROJECT) {
        return Paths.build(Paths.USER_PROFILE_NEW_PROJECT, {initials});
    }
    if (hint.projectId !== null && hint.projectId !== undefined) {
        return Paths.build(Paths.USER_PROFILE_PROJECT,
            {initials, projectId: String(hint.projectId), slug: Paths.projectSlug(hint.projectName)});
    }
    switch (hint.section) {
        case ProfileSection.SKILLS:
            return Paths.build(Paths.USER_PROFILE_SKILLS, {initials});
        case ProfileSection.PROJECTS:
            return Paths.build(Paths.USER_PROFILE_PROJECTS, {initials});
        default:
            return Paths.build(Paths.USER_PROFILE, {initials}) + '#' + profileSectionAnchor(hint.section);
    }
}

export function hintIcon(type: ProfileCheckHintType): string {
    switch (type) {
        case ProfileCheckHintType.MISSING:
            return 'playlist_add';
        case ProfileCheckHintType.INCOMPLETE:
            return 'edit_note';
        case ProfileCheckHintType.OUTDATED:
            return 'update';
        default:
            return 'category';
    }
}

/**
 * "vor 2 Jahren"; the exact time belongs into a tooltip
 */
function fuzzy(since: string | null): string {
    return since ? formatToRelativeTime(since) : PowerLocalize.get('ProfileCheck.Unknown');
}

function reasonText(reason: string, values: { [key: string]: any }): string {
    switch (reason) {
        case 'FEW_SKILLS':
            return PowerLocalize.getFormatted('ProfileCheck.Reason.FewSkills', values.skillCount, values.minSkills);
        case 'SHORT_DESCRIPTION':
            // No character counts in the texts: the thresholds are configuration, not a goal to count towards
            return PowerLocalize.get('ProfileCheck.Reason.ShortDescription');
        default:
            return PowerLocalize.get('ProfileCheck.Reason.NoRole');
    }
}

export function hintText(hint: ProfileCheckHint): string {
    const values = hint.values || {};
    switch (hint.code) {
        case ProfileCheckHintCode.SECTION_EMPTY:
            return PowerLocalize.get('ProfileCheck.Empty.' + hint.section);
        case ProfileCheckHintCode.DESCRIPTION_MISSING:
            return PowerLocalize.get('ProfileCheck.DescriptionMissing');
        case ProfileCheckHintCode.DESCRIPTION_SHORT:
            return PowerLocalize.get('ProfileCheck.DescriptionShort');
        case ProfileCheckHintCode.PROJECT_INCOMPLETE:
            return PowerLocalize.getFormatted('ProfileCheck.ProjectIncomplete', hint.projectName || '',
                (values.reasons || []).map((reason: string) => reasonText(reason, values)).join(', '));
        case ProfileCheckHintCode.EDUCATION_WITHOUT_DEGREE:
            return PowerLocalize.getFormatted('ProfileCheck.EducationWithoutDegree', values.education || '');
        case ProfileCheckHintCode.PROJECTS_OUTDATED:
            return PowerLocalize.getFormatted('ProfileCheck.ProjectsOutdated', fuzzy(hint.since));
        case ProfileCheckHintCode.NO_FOLLOW_UP_PROJECT:
            return PowerLocalize.getFormatted('ProfileCheck.NoFollowUpProject', fuzzy(hint.since));
        case ProfileCheckHintCode.RUNNING_PROJECT_OUTDATED:
            return PowerLocalize.getFormatted('ProfileCheck.RunningProjectOutdated', hint.projectName || '', fuzzy(hint.since));
        case ProfileCheckHintCode.SKILLS_OUTDATED:
            return PowerLocalize.getFormatted('ProfileCheck.SkillsOutdated', fuzzy(hint.since), values.months);
        case ProfileCheckHintCode.SKILLS_UNSORTED:
            return PowerLocalize.getFormatted('ProfileCheck.SkillsUnsorted', (values.skills || []).join(', '));
        default:
            return hint.code;
    }
}

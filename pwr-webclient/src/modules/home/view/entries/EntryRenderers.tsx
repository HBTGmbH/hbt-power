import * as React from 'react';
import {ViewCareer} from '../../../../model/view/ViewCareer';
import {ViewEducation} from '../../../../model/view/ViewEducation';
import {ViewLanguage} from '../../../../model/view/ViewLanguage';
import {ViewQualification} from '../../../../model/view/ViewQualification';
import {ViewTraining} from '../../../../model/view/ViewTraining';
import {IViewEntry} from '../../../../model/view/IViewEntry';
import {ComparableEntryButton} from './comprable-entry-button_module';
import {SortableEntryType} from '../../../../model/view/NameComparableType';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ViewEntryColumn} from './view-profile-entries_module';

/** A month like „Sept. 2019“ or „Heute“, with its sort arrow in the header */
export const DATE_WIDTH = '104px';
/** Degree, language level */
export const DETAIL_WIDTH = '160px';
/** A rating 1 to 5 with its header „Bewertung“ and the sort arrow */
export const RATING_WIDTH = '88px';
/** Three small version chips in a line */
export const VERSIONS_WIDTH = '128px';

type Dated = IViewEntry & { startDate: Date, endDate: Date };

/**
 * A name of the skill tree with its localization in the language of the view profile (#174) as a second line; none
 * when the localization says the same
 */
export const LocalizedName = (props: { name: string, localizedName?: string, className?: string }) => <>
    <span className={props.className}>{props.name}</span>
    {props.localizedName && props.localizedName !== props.name &&
    <span className="pwr-view-entry-localized">{props.localizedName}</span>}
</>;

/**
 * Columns of the tables of the view profile (#149). Fixed columns stand at the right end in the same order everywhere
 * (detail, then start and end date), so they line up between the tables.
 */
export class EntryRenderers {

    public static nameColumn<T extends IViewEntry>(entryType: SortableEntryType, viewProfileId: string): ViewEntryColumn<T> {
        return {
            header: <ComparableEntryButton
                sortableEntryType={entryType}
                sortableEntryField="name"
                label={PowerLocalize.get('ViewEntryField.Name')}
                viewProfileId={viewProfileId}
            />,
            render: entry => entry.name,
        };
    }

    public static startDate<T extends Dated>(entryType: SortableEntryType, viewProfileId: string): ViewEntryColumn<T> {
        return {
            header: <ComparableEntryButton
                sortableEntryType={entryType}
                sortableEntryField="start-date"
                label={PowerLocalize.get('ViewEntryField.StartDate')}
                viewProfileId={viewProfileId}
            />,
            width: DATE_WIDTH,
            render: entry => formatToShortDisplay(entry.startDate),
        };
    }

    public static endDate<T extends Dated>(entryType: SortableEntryType, viewProfileId: string): ViewEntryColumn<T> {
        return {
            header: <ComparableEntryButton
                sortableEntryType={entryType}
                sortableEntryField="end-date"
                label={PowerLocalize.get('ViewEntryField.EndDate')}
                viewProfileId={viewProfileId}
            />,
            width: DATE_WIDTH,
            render: entry => formatToShortDisplay(entry.endDate),
        };
    }

    public static career(viewProfileId: string): Array<ViewEntryColumn<ViewCareer>> {
        return [
            EntryRenderers.nameColumn(SortableEntryType.CAREER, viewProfileId),
            EntryRenderers.startDate(SortableEntryType.CAREER, viewProfileId),
            EntryRenderers.endDate(SortableEntryType.CAREER, viewProfileId),
        ];
    }

    public static education(viewProfileId: string): Array<ViewEntryColumn<ViewEducation>> {
        return [
            EntryRenderers.nameColumn(SortableEntryType.EDUCATION, viewProfileId),
            {
                header: PowerLocalize.get('ViewEntryField.Degree'),
                width: DETAIL_WIDTH,
                render: entry => entry.degree,
            },
            EntryRenderers.startDate(SortableEntryType.EDUCATION, viewProfileId),
            EntryRenderers.endDate(SortableEntryType.EDUCATION, viewProfileId),
        ];
    }

    public static training(viewProfileId: string): Array<ViewEntryColumn<ViewTraining>> {
        return [
            EntryRenderers.nameColumn(SortableEntryType.TRAINING, viewProfileId),
            EntryRenderers.startDate(SortableEntryType.TRAINING, viewProfileId),
            EntryRenderers.endDate(SortableEntryType.TRAINING, viewProfileId),
        ];
    }

    public static qualification(viewProfileId: string): Array<ViewEntryColumn<ViewQualification>> {
        return [
            EntryRenderers.nameColumn(SortableEntryType.QUALIFICATION, viewProfileId),
            {
                header: PowerLocalize.get('ViewEntryField.Date'),
                width: DATE_WIDTH,
                render: entry => formatToShortDisplay(entry.date),
            },
        ];
    }

    public static language(viewProfileId: string): Array<ViewEntryColumn<ViewLanguage>> {
        return [
            EntryRenderers.nameColumn(SortableEntryType.LANGUAGE, viewProfileId),
            {
                header: PowerLocalize.get('ViewEntryField.Level'),
                width: DETAIL_WIDTH,
                render: entry => PowerLocalize.langLevelToLocalizedString(entry.level),
            },
        ];
    }

    /** Sectors, special fields, project roles */
    public static nameOnly<T extends IViewEntry>(entryType: SortableEntryType, viewProfileId: string): Array<ViewEntryColumn<T>> {
        return [EntryRenderers.nameColumn(entryType, viewProfileId)];
    }
}

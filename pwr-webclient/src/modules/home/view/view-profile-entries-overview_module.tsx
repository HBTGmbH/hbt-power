import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {ViewEntryColumn, ViewProfileEntries} from './entries/view-profile-entries_module';
import {SortableEntryType} from '../../../model/view/NameComparableType';
import {EntryRenderers} from './entries/EntryRenderers';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ThunkDispatch} from 'redux-thunk';
import {IViewEntry} from '../../../model/view/IViewEntry';
import {PwrFormSubCaption} from '../../general/pwr-typography';
import {PwrSpacer} from '../../general/pwr-spacer_module';


interface ViewProfileEntriesOverviewProps {
    viewProfile: ViewProfile;
}

interface ViewProfileEntriesOverviewLocalProps {
    viewProfileId: string;
}

interface ViewProfileEntriesOverviewDispatch {
    moveEntry(id: string, type: string, sourceIndex: number, targetIndex: number): void;

    toggleEntry(id: string, type: string, index: number, isEnabled: boolean): void;
}

interface Group<T extends IViewEntry> {
    title: string;
    entryType: string;
    entries: Array<T>;
    columns: Array<ViewEntryColumn<T>>;
}

class ViewProfileEntriesOverviewModule extends React.Component<ViewProfileEntriesOverviewProps
    & ViewProfileEntriesOverviewLocalProps
    & ViewProfileEntriesOverviewDispatch> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileEntriesOverviewLocalProps): ViewProfileEntriesOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles.get(localProps.viewProfileId),
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ViewProfileEntriesOverviewDispatch {
        return {
            moveEntry: (id, type, sourceIndex, targetIndex) => dispatch(ViewProfileActionCreator.AsyncMoveEntry(id, type, sourceIndex, targetIndex)),
            toggleEntry: (id, type, index, isEnabled) => {
                dispatch(ViewProfileActionCreator.AsyncToggleEntry(id, type, index, isEnabled));
            },
        };
    }

    private handleMove = (type: string, sourceIndex: number, targetIndex: number) => {
        this.props.moveEntry(this.props.viewProfileId, type, sourceIndex, targetIndex);
    };

    private handleToggle = (type: string, index: number, isEnabled: boolean) => {
        this.props.toggleEntry(this.props.viewProfileId, type, index, isEnabled);
    };

    /**
     * In the order of the standard template (designfile_hbt_standard.rptdesign), two per row from md up
     */
    private groups(): Array<Group<any>> {
        const viewProfile = this.props.viewProfile;
        const id = this.props.viewProfileId;
        return [
            {title: PowerLocalize.get('Education.Plural'), entryType: 'EDUCATION', entries: viewProfile.educations, columns: EntryRenderers.education(id)},
            {title: PowerLocalize.get('Career.Plural'), entryType: 'CAREER', entries: viewProfile.careers, columns: EntryRenderers.career(id)},
            {title: PowerLocalize.get('SpecialField.Plural'), entryType: 'KEY_SKILL', entries: viewProfile.keySkills, columns: EntryRenderers.nameOnly(SortableEntryType.KEY_SKILL, id)},
            {title: PowerLocalize.get('Qualification.Plural'), entryType: 'QUALIFICATION', entries: viewProfile.qualifications, columns: EntryRenderers.qualification(id)},
            {title: PowerLocalize.get('Training.Plural'), entryType: 'TRAINING', entries: viewProfile.trainings, columns: EntryRenderers.training(id)},
            {title: PowerLocalize.get('Sector.Plural'), entryType: 'SECTOR', entries: viewProfile.sectors, columns: EntryRenderers.nameOnly(SortableEntryType.SECTOR, id)},
            {title: PowerLocalize.get('ProjectRole.Plural'), entryType: 'PROJECT_ROLE', entries: viewProfile.projectRoles, columns: EntryRenderers.nameOnly(SortableEntryType.PROJECT_ROLE, id)},
            {title: PowerLocalize.get('Language.Plural'), entryType: 'LANGUAGE', entries: viewProfile.languages, columns: EntryRenderers.language(id)},
        ];
    }

    render() {
        return <div className="pwr-view-groups">
            {this.groups().map(group =>
                <section key={group.entryType}>
                    <PwrFormSubCaption>{group.title}</PwrFormSubCaption>
                    <PwrSpacer size="tight"/>
                    <ViewProfileEntries
                        movableEntryType={group.entryType}
                        toggleableEntryType={group.entryType}
                        columns={group.columns}
                        entries={group.entries}
                        emptyText={PowerLocalize.get('ViewProfileOverview.Empty')}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </section>)}
        </div>;
    }
}

/**
 * @see ViewProfileEntriesOverviewModule
 * @author nt
 * @since 12.09.2017
 */
export const ViewProfileEntriesOverview: React.ComponentClass<ViewProfileEntriesOverviewLocalProps> = connect(ViewProfileEntriesOverviewModule.mapStateToProps, ViewProfileEntriesOverviewModule.mapDispatchToProps)(ViewProfileEntriesOverviewModule) as any;

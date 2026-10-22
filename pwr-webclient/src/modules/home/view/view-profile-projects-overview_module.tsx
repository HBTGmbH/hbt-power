import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {ViewEntryColumn, ViewProfileEntries} from './entries/view-profile-entries_module';
import {SortableEntryType} from '../../../model/view/NameComparableType';
import {ViewProject} from '../../../model/view/ViewProject';
import {ViewSkill} from '../../../model/view/ViewSkill';
import {ViewProjectRole} from '../../../model/view/ViewProjectRole';
import {ComparableNestedEntryButton} from './entries/comparable-nested-entry-button_module';
import {DATE_WIDTH, EntryRenderers} from './entries/EntryRenderers';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {PwrFormSubCaption} from '../../general/pwr-typography';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {ThunkDispatch} from 'redux-thunk';

interface ViewProfileProjectsOverviewProps {
    viewProfile: ViewProfile;
}

interface ViewProfileProjectsOverviewLocalProps {
    viewProfileId: string;
}

interface ViewProfileProjectsOverviewDispatch {
    moveEntry(id: string, type: string, sourceIndex: number, targetIndex: number): void;

    toggleEntry(id: string, type: string, index: number, isEnabled: boolean): void;

    toggleNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, index: number, isEnabled: boolean): void;

    moveNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, sourceIndex: number, targetIndex: number): void;
}

class ViewProfileProjectsOverviewModule extends React.Component<ViewProfileProjectsOverviewProps
    & ViewProfileProjectsOverviewLocalProps
    & ViewProfileProjectsOverviewDispatch> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileProjectsOverviewLocalProps): ViewProfileProjectsOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles.get(localProps.viewProfileId)
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ViewProfileProjectsOverviewDispatch {
        return {
            moveEntry: (id, type, sourceIndex, targetIndex) => dispatch(ViewProfileActionCreator.AsyncMoveEntry(id, type, sourceIndex, targetIndex)),
            toggleEntry: (id, type, index, isEnabled) => {
                dispatch(ViewProfileActionCreator.AsyncToggleEntry(id, type, index, isEnabled));
            },
            moveNestedEntry: (id, container, containerIndex, type, sourceIndex, targetIndex) => {
                dispatch(ViewProfileActionCreator.AsyncMoveNestedEntry(id, container, containerIndex, type, sourceIndex, targetIndex));
            },
            toggleNestedEntry: (id, container, containerIndex, type, index, isEnabled) => {
                dispatch(ViewProfileActionCreator.AsyncToggleNestedEntry(id, container, containerIndex, type, index, isEnabled));
            }
        };
    }


    private handleNestedMove = (container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, sourceIndex: number, targetIndex: number) => {
        this.props.moveNestedEntry(this.props.viewProfileId, container, containerIndex, type, sourceIndex, targetIndex);
    };

    private handleNestedToggle = (container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, index: number, isEnabled: boolean) => {
        this.props.toggleNestedEntry(this.props.viewProfileId, container, containerIndex, type, index, isEnabled);
    };

    private handleMove = (type: string, sourceIndex: number, targetIndex: number) => {
        this.props.moveEntry(this.props.viewProfileId, type, sourceIndex, targetIndex);
    };

    private handleToggle = (type: string, index: number, isEnabled: boolean) => {
        this.props.toggleEntry(this.props.viewProfileId, type, index, isEnabled);
    };

    private skillColumns(projectIndex: number): Array<ViewEntryColumn<ViewSkill>> {
        return [
            {
                header: <ComparableNestedEntryButton
                    container="PROJECT"
                    sortableEntryType={SortableEntryType.SKILL}
                    sortableEntryField="name"
                    viewProfileId={this.props.viewProfileId}
                    label={PowerLocalize.get('ViewEntryField.Name')}
                    containerIndex={projectIndex}/>,
                render: skill => skill.name,
            },
            {
                header: <ComparableNestedEntryButton
                    container="PROJECT"
                    sortableEntryType={SortableEntryType.SKILL}
                    sortableEntryField="rating"
                    viewProfileId={this.props.viewProfileId}
                    label={PowerLocalize.get('ViewEntryField.Rating')}
                    containerIndex={projectIndex}/>,
                width: DATE_WIDTH,
                render: skill => skill.rating,
            },
        ];
    }

    private readonly roleColumns: Array<ViewEntryColumn<ViewProjectRole>> = [{
        header: PowerLocalize.get('ViewEntryField.Name'),
        render: role => role.name,
    }];

    private renderDetails = (project: ViewProject, projectIndex: number) => <div className="pwr-view-groups">
        <section>
            <PwrFormSubCaption>{PowerLocalize.get('Skill.Plural')}</PwrFormSubCaption>
            <PwrSpacer size="tight"/>
            <ViewProfileEntries
                movableEntryType="SKILL"
                toggleableEntryType="SKILL"
                columns={this.skillColumns(projectIndex)}
                entries={project.skills}
                emptyText={PowerLocalize.get('ViewProfileOverview.Empty')}
                onMove={(type, sourceIndex, targetIndex) => this.handleNestedMove('PROJECT', projectIndex, type, sourceIndex, targetIndex)}
                onToggle={(type, index, isEnabled) => this.handleNestedToggle('PROJECT', projectIndex, type, index, isEnabled)}
            />
        </section>
        <section>
            <PwrFormSubCaption>{PowerLocalize.get('ProjectRole.Plural')}</PwrFormSubCaption>
            <PwrSpacer size="tight"/>
            <ViewProfileEntries
                movableEntryType="ROLE"
                toggleableEntryType="ROLE"
                moveDisabled={true}
                columns={this.roleColumns}
                entries={project.projectRoles}
                emptyText={PowerLocalize.get('ViewProfileOverview.Empty')}
                onMove={(type, sourceIndex, targetIndex) => this.handleNestedMove('PROJECT', projectIndex, type, sourceIndex, targetIndex)}
                onToggle={(type, index, isEnabled) => this.handleNestedToggle('PROJECT', projectIndex, type, index, isEnabled)}
            />
        </section>
    </div>;

    private projectColumns(): Array<ViewEntryColumn<ViewProject>> {
        return [
            {
                header: PowerLocalize.get('ViewEntryField.Name'),
                render: project => <span className="pwr-view-entry-title">{project.name}</span>,
            },
            EntryRenderers.startDate(SortableEntryType.PROJECT, this.props.viewProfileId),
            EntryRenderers.endDate(SortableEntryType.PROJECT, this.props.viewProfileId),
        ];
    }

    render() {
        return <ViewProfileEntries
            movableEntryType="PROJECT"
            toggleableEntryType="PROJECT"
            columns={this.projectColumns()}
            renderDetails={this.renderDetails}
            entries={this.props.viewProfile.projects}
            emptyText={PowerLocalize.get('ViewProfileOverview.Empty')}
            onMove={this.handleMove}
            onToggle={this.handleToggle}
        />;
    }
}

/**
 * @see ViewProfileProjectsOverviewModule
 * @author nt
 * @since 12.09.2017
 */
export const ViewProfileProjectsOverview: React.ComponentClass<ViewProfileProjectsOverviewLocalProps> = connect(ViewProfileProjectsOverviewModule.mapStateToProps, ViewProfileProjectsOverviewModule.mapDispatchToProps)(ViewProfileProjectsOverviewModule) as any;

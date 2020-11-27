import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Button, ListSubheader} from '@material-ui/core';
import {ViewProfileEntries} from './entries/view-profile-entries_module';
import {SortableEntryType} from '../../../model/view/NameComparableType';
import {ViewProject} from '../../../model/view/ViewProject';
import {ViewSkill} from '../../../model/view/ViewSkill';
import {ComparableNestedEntryButton} from './entries/comparable-nested-entry-button_module';
import {EntryRenderers} from './entries/EntryRenderers';
import {formatToShortDisplay} from '../../../utils/DateUtil';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography/Typography';
import {ThunkDispatch} from 'redux-thunk';


interface ViewProfileProjectsOverviewProps {
    viewProfile: ViewProfile;
}

interface ViewProfileProjectsOverviewLocalProps {
    viewProfileId: string;
}

interface ViewProfileProjectsOverviewLocalState {

}

interface ViewProfileProjectsOverviewDispatch {
    moveEntry(id: string, type: string, sourceIndex: number, targetIndex: number): void;

    toggleEntry(id: string, type: string, index: number, isEnabled: boolean): void;

    toggleNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, index: number, isEnabled: boolean): void;

    moveNestedEntry(id: string, container: 'PROJECT' | 'DISPLAY_CATEGORY', containerIndex: number, type: string, sourceIndex: number, targetIndex: number): void;
}

class ViewProfileProjectsOverviewModule extends React.Component<ViewProfileProjectsOverviewProps
    & ViewProfileProjectsOverviewLocalProps
    & ViewProfileProjectsOverviewDispatch, ViewProfileProjectsOverviewLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileProjectsOverviewLocalProps): ViewProfileProjectsOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.viewProfileId)
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


    private renderSkill = (entry: ViewSkill) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={'ViewSkill_' + entry.name}>{entry.name}</td>);
        res.push(<td key={'ViewSkill_' + entry.name + '_rating'}>{entry.rating}</td>);
        return res;
    };

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


    private renderProjects = (entry: ViewProject, entryIndex: number) => {
        let res: Array<JSX.Element> = [];
        res.push(
            <td key={'ViewProject_' + entry.name + entry.broker + entry.client}>
                <ExpansionPanel>
                    <ExpansionPanelSummary
                        title={entry.name}
                    >
                        <Typography style={{flexBasis: '33.33%'}} variant={'h5'}>{entry.name}</Typography>
                        <Typography
                            variant={'caption'}>{'From ' + formatToShortDisplay(entry.startDate) + ' to ' + formatToShortDisplay(entry.endDate)}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails
                    >
                        <ListSubheader>Skills</ListSubheader>
                        <ViewProfileEntries
                            movableEntryType="SKILL"
                            toggleableEntryType="SKILL"
                            renderEntry={this.renderSkill}
                            headers={[<ComparableNestedEntryButton
                                container="PROJECT"
                                sortableEntryType={SortableEntryType.SKILL}
                                sortableEntryField="name"
                                viewProfileId={this.props.viewProfileId}
                                label="Name"
                                containerIndex={entryIndex}/>,
                                <ComparableNestedEntryButton
                                    container="PROJECT"
                                    sortableEntryType={SortableEntryType.SKILL}
                                    sortableEntryField="rating"
                                    viewProfileId={this.props.viewProfileId}
                                    label="Rating"
                                    containerIndex={entryIndex}
                                />]}
                            entries={entry.skills}
                            onMove={(type, sourceIndex, targetIndex) => this.handleNestedMove('PROJECT', entryIndex, type, sourceIndex, targetIndex)}
                            onToggle={(type, index, isEnabled) => this.handleNestedToggle('PROJECT', entryIndex, type, index, isEnabled)}
                        />
                        <ListSubheader>Project Roles</ListSubheader>
                        <ViewProfileEntries
                            movableEntryType="ROLE"
                            toggleableEntryType="ROLE"
                            renderEntry={EntryRenderers.renderProjectRole}
                            moveDisabled={true}
                            headers={['Name']}
                            entries={entry.projectRoles}
                            onMove={(type, sourceIndex, targetIndex) => this.handleNestedMove('PROJECT', entryIndex, type, sourceIndex, targetIndex)}
                            onToggle={(type, index, isEnabled) => this.handleNestedToggle('PROJECT', entryIndex, type, index, isEnabled)}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </td>);
        return res;
    };


    render() {
        return (<div className="row">
            <div className="col-md-12 fullWidth">
                <ViewProfileEntries
                    movableEntryType="PROJECT"
                    toggleableEntryType="PROJECT"
                    renderEntry={this.renderProjects}
                    headers={[<span>
                        <Button variant={'text'} disabled={true}>Name</Button>
                        {EntryRenderers.renderStartDate(SortableEntryType.PROJECT, this.props.viewProfileId)}
                        {EntryRenderers.renderEndDate(SortableEntryType.PROJECT, this.props.viewProfileId)}
                            </span>]}
                    entries={this.props.viewProfile.projects}
                    onMove={this.handleMove}
                    onToggle={this.handleToggle}
                />
            </div>
        </div>);
    }
}

/**
 * @see ViewProfileProjectsOverviewModule
 * @author nt
 * @since 12.09.2017
 */
export const ViewProfileProjectsOverview: React.ComponentClass<ViewProfileProjectsOverviewLocalProps> = connect(ViewProfileProjectsOverviewModule.mapStateToProps, ViewProfileProjectsOverviewModule.mapDispatchToProps)(ViewProfileProjectsOverviewModule) as any;

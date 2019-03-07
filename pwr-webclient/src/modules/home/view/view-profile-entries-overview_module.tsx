import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Button} from '@material-ui/core';
import {ViewProfileEntries} from './entries/view-profile-entries_module';
import {SortableEntryType} from '../../../model/view/NameComparableType';
import {EntryRenderers} from './entries/EntryRenderers';
import {PowerLocalize} from '../../../localization/PowerLocalizer';


interface ViewProfileEntriesOverviewProps {
    viewProfile: ViewProfile;
}

interface ViewProfileEntriesOverviewLocalProps {
    viewProfileId: string;
}

interface ViewProfileEntriesOverviewLocalState {
    expansionValue: number;
}

interface ViewProfileEntriesOverviewDispatch {
    moveEntry(id: string, type: string, sourceIndex: number, targetIndex: number): void;

    toggleEntry(id: string, type: string, index: number, isEnabled: boolean): void;
}

class ViewProfileEntriesOverviewModule extends React.Component<ViewProfileEntriesOverviewProps
    & ViewProfileEntriesOverviewLocalProps
    & ViewProfileEntriesOverviewDispatch, ViewProfileEntriesOverviewLocalState> {

    constructor(props: ViewProfileEntriesOverviewProps
        & ViewProfileEntriesOverviewLocalProps
        & ViewProfileEntriesOverviewDispatch) {
        super(props);
        this.state = {
            expansionValue: -1,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileEntriesOverviewLocalProps): ViewProfileEntriesOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.viewProfileId),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewProfileEntriesOverviewDispatch {
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

    private handleExpansionChange = (value: number) => {

        if (this.state.expansionValue === value) {
            this.setState({
                expansionValue: -1,
            });
        } else {
            this.setState({
                expansionValue: value,
            });
        }
    };

    render() {
        return <div>
            <div className="row">
                <div className="col-md-6 fullWidth">
                    <ViewProfileEntries
                        title={PowerLocalize.get('Sector.Plural')}//
                        movableEntryType="SECTOR"
                        toggleableEntryType="SECTOR"
                        renderEntry={EntryRenderers.renderSector}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.SECTOR, this.props.viewProfileId)]}
                        entries={this.props.viewProfile.sectors}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
                <div className="col-md-6 fullWidth">

                    <ViewProfileEntries
                        title={PowerLocalize.get('Career.Plural')}
                        movableEntryType="CAREER"
                        toggleableEntryType="CAREER"
                        renderEntry={EntryRenderers.renderCareer}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.CAREER, this.props.viewProfileId),
                            EntryRenderers.renderStartDate(SortableEntryType.CAREER, this.props.viewProfileId),
                            EntryRenderers.renderEndDate(SortableEntryType.CAREER, this.props.viewProfileId)]}
                        entries={this.props.viewProfile.careers}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
                <div className="col-md-6 fullWidth">

                    <ViewProfileEntries
                        title={PowerLocalize.get('Education.Plural')}
                        movableEntryType="EDUCATION"
                        toggleableEntryType="EDUCATION"
                        renderEntry={EntryRenderers.renderEducation}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.EDUCATION, this.props.viewProfileId),
                            EntryRenderers.renderStartDate(SortableEntryType.EDUCATION, this.props.viewProfileId),
                            EntryRenderers.renderEndDate(SortableEntryType.EDUCATION, this.props.viewProfileId),
                            <Button variant={'text'}
                                    disabled={true}>{PowerLocalize.get('ViewEntryField.Degree')}</Button>]}
                        entries={this.props.viewProfile.educations}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
                <div className="col-md-6 fullWidth">

                    <ViewProfileEntries
                        title={PowerLocalize.get('KeySkill.Plural')}
                        movableEntryType="KEY_SKILL"
                        toggleableEntryType="KEY_SKILL"
                        renderEntry={EntryRenderers.renderKeySkill}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.KEY_SKILL, this.props.viewProfileId)]}
                        entries={this.props.viewProfile.keySkills}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
                <div className="col-md-6 fullWidth">

                    <ViewProfileEntries
                        title={PowerLocalize.get('Language.Plural')}
                        movableEntryType="LANGUAGE"
                        toggleableEntryType="LANGUAGE"
                        renderEntry={EntryRenderers.renderLanguage}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.LANGUAGE, this.props.viewProfileId),
                            <Button variant={'text'}
                                    disabled={true}>{PowerLocalize.get('ViewEntryField.Level')}</Button>]}
                        entries={this.props.viewProfile.languages}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
                <div className="col-md-6 fullWidth">

                    <ViewProfileEntries
                        title={PowerLocalize.get('Qualification.Plural')}
                        movableEntryType="QUALIFICATION"
                        toggleableEntryType="QUALIFICATION"
                        renderEntry={EntryRenderers.renderQualification}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.QUALIFICATION, this.props.viewProfileId),
                            <Button variant={'text'} disabled={true}>Date</Button>]}
                        entries={this.props.viewProfile.qualifications}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
                <div className="col-md-6 fullWidth">

                    <ViewProfileEntries
                        title={PowerLocalize.get('Training.Plural')}
                        movableEntryType="TRAINING"
                        toggleableEntryType="TRAINING"
                        renderEntry={EntryRenderers.renderTraining}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.TRAINING, this.props.viewProfileId),
                            EntryRenderers.renderStartDate(SortableEntryType.TRAINING, this.props.viewProfileId),
                            EntryRenderers.renderEndDate(SortableEntryType.TRAINING, this.props.viewProfileId)]}
                        entries={this.props.viewProfile.trainings}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
                <div className="col-md-6 fullWidth">
                    <ViewProfileEntries
                        title={PowerLocalize.get('ProjectRole.Plural')}
                        movableEntryType="PROJECT_ROLE"
                        toggleableEntryType="PROJECT_ROLE"
                        renderEntry={EntryRenderers.renderProjectRole}
                        headers={[EntryRenderers.renderNameButton(SortableEntryType.PROJECT_ROLE, this.props.viewProfileId)]}
                        entries={this.props.viewProfile.projectRoles}
                        onMove={this.handleMove}
                        onToggle={this.handleToggle}
                    />
                </div>
            </div>
        </div>;
    }
}

/**
 * @see ViewProfileEntriesOverviewModule
 * @author nt
 * @since 12.09.2017
 */
export const ViewProfileEntriesOverview: React.ComponentClass<ViewProfileEntriesOverviewLocalProps> = connect(ViewProfileEntriesOverviewModule.mapStateToProps, ViewProfileEntriesOverviewModule.mapDispatchToProps)(ViewProfileEntriesOverviewModule);
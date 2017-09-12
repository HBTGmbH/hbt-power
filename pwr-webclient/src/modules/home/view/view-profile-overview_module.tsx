import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {isNullOrUndefined} from 'util';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Dialog} from 'material-ui';
import {ViewProfileEntries} from './entries/view-profile-entries_module';
import {ViewSector} from '../../../model/view/ViewSector';
import {ViewCareer} from '../../../model/view/ViewCareer';
import {ViewEducation} from '../../../model/view/ViewEducation';
import {ViewKeySkill} from '../../../model/view/ViewKeySkill';
import {ViewLanguage} from '../../../model/view/ViewLanguage';
import {ViewQualification} from '../../../model/view/ViewQualification';
import {ViewTraining} from '../../../model/view/ViewTraining';
import {ViewProjectRole} from '../../../model/view/ViewProjectRole';
import {NameComparableButton} from './entries/name-comparable-button_module';
import {SortableEntryType} from '../../../model/view/NameComparableType';

interface ViewProfileOverviewProps {
    viewProfile: ViewProfile;
    isInProgress: boolean;
}


interface ViewProfileOverviewLocalProps {
    params?: any;
}

interface ViewProfileOverviewLocalState {

}

interface ViewProfileOverviewDispatch {
    moveEntry(id: string, type: string, sourceIndex: number, targetIndex: number): void;
    toggleEntry(id: string, type: string, index: number, isEnabled: boolean): void;
}

class ViewProfileOverviewModule extends React.Component<
    ViewProfileOverviewProps
    & ViewProfileOverviewLocalProps
    & ViewProfileOverviewDispatch, ViewProfileOverviewLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileOverviewLocalProps): ViewProfileOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.params.id),
            isInProgress: state.viewProfileSlice.sortInProgress()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewProfileOverviewDispatch {
        return {
            moveEntry: (id, type, sourceIndex, targetIndex) => dispatch(ViewProfileActionCreator.AsyncMoveEntry(id, type, sourceIndex, targetIndex)),
            toggleEntry: (id, type, index, isEnabled) => {dispatch(ViewProfileActionCreator.AsyncToggleEntry(id, type, index, isEnabled));}
        };
    }

    private handleMove = (type: string, sourceIndex: number, targetIndex: number) => {
        this.props.moveEntry(this.props.params.id, type, sourceIndex, targetIndex);
    };

    private handleToggle = (type: string, index: number, isEnabled: boolean) => {
        this.props.toggleEntry(this.props.params.id, type, index, isEnabled);
    };

    private renderCareer = (entry: ViewCareer) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"ViewCareer_" + entry.name}>{entry.name}</td>);
        res.push(<td key={"ViewCareer_" + entry.startDate + "_s_date"}>{entry.startDate}</td>);
        res.push(<td key={"ViewCareer_" + entry.endDate + "_s_date"}>{entry.endDate}</td>);
        return res;
    };

    private renderSector = (entry: ViewSector) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"ViewSector_" + entry.name}>{entry.name}</td>);
        return res;
    };

    private renderEducation = (entry: ViewEducation) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"ViewEducation_" + entry.name}>{entry.name}</td>);
        res.push(<td key={"ViewEducation_" + entry.startDate + "_s_date"}>{entry.startDate}</td>);
        res.push(<td key={"ViewEducation_" + entry.endDate + "_e_date"}>{entry.endDate}</td>);
        res.push(<td key={"ViewEducation_" + entry.degree + "_degree"}>{entry.degree}</td>);
        return res;
    };

    private renderKeySkill = (entry: ViewKeySkill) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"ViewKeySkill_" + entry.name}>{entry.name}</td>);
        return res;
    };

    private renderLanguage = (entry: ViewLanguage) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"ViewLanguage_" + entry.name}>{entry.name}</td>);
        res.push(<td key={"ViewLanguage_" + entry.name + "_lvl"}>{entry.level}</td>);
        return res;
    };

    private renderQualification = (entry: ViewQualification) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"Qualification_" + entry.name}>{entry.name}</td>);
        res.push(<td key={"Qualification_" + entry.name + "_date"}>{entry.date}</td>);
        return res;
    };

    private renderTraining = (entry: ViewTraining) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"Training_" + entry.name}>{entry.name}</td>);
        res.push(<td key={"Training_" + entry.name + "_s_date"}>{entry.startDate}</td>);
        res.push(<td key={"Training_" + entry.name + "_e_date"}>{entry.endDate}</td>);
        return res;
    };

    private renderProjectRole = (entry: ViewProjectRole) => {
        let res: Array<JSX.Element> = [];
        res.push(<td key={"ViewProjectRole_" + entry.name}>{entry.name}</td>);
        return res;
    };

    render() {
        if (isNullOrUndefined(this.props.viewProfile)) {
            return <div>Does not exist</div>;
        } else {
            let viewProfileId = this.props.params.id;
            return (<div>
                <Dialog
                    open={this.props.isInProgress}
                    contentStyle={{color: 'rgb(255, 255, 255, 0)', opacity: 0}}
                    overlayStyle={{backgroundColor: 'rgba(0, 0, 0, 0.4)'}}
                    modal={true}
                >
                    <span style={{color: 'white', opacity: 1}}>Loading...</span>
                </Dialog>
                This is View Profile id = {this.props.params.id}
                <div className="row">
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="SECTOR"
                            toggleableEntryType="SECTOR"
                            renderEntry={this.renderSector}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.SECTOR} label={"Name"} viewProfileId={viewProfileId}/>]}
                            entries={this.props.viewProfile.sectors}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="CAREER"
                            toggleableEntryType="CAREER"
                            renderEntry={this.renderCareer}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.CAREER} label={"Name"} viewProfileId={viewProfileId}/>,
                                "Start Date",
                               "End Date"]}
                            entries={this.props.viewProfile.careers}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="EDUCATION"
                            toggleableEntryType="EDUCATION"
                            renderEntry={this.renderEducation}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.EDUCATION} label={"Name"} viewProfileId={viewProfileId}/>,
                                "Start Date",
                                "End Date",
                                "Degree"]}
                            entries={this.props.viewProfile.educations}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="KEY_SKILL"
                            toggleableEntryType="KEY_SKILL"
                            renderEntry={this.renderKeySkill}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.KEY_SKILL} label={"Name"} viewProfileId={viewProfileId}/>]}
                            entries={this.props.viewProfile.keySkills}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="LANGUAGE"
                            toggleableEntryType="LANGUAGE"
                            renderEntry={this.renderLanguage}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.LANGUAGE} label={"Name"} viewProfileId={viewProfileId}/>, "Level"]}
                            entries={this.props.viewProfile.languages}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="QUALIFICATION"
                            toggleableEntryType="QUALIFICATION"
                            renderEntry={this.renderQualification}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.QUALIFICATION} label={"Name"} viewProfileId={viewProfileId}/> ,"Date"]}
                            entries={this.props.viewProfile.qualifications}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="TRAINING"
                            toggleableEntryType="TRAINING"
                            renderEntry={this.renderTraining}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.TRAINING} label={"Name"} viewProfileId={viewProfileId}/>, "Start Date", "End Date"]}
                            entries={this.props.viewProfile.trainings}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                    <div className="col-md-6 fullWidth">
                        <ViewProfileEntries
                            movableEntryType="PROJECT_ROLE"
                            toggleableEntryType="PROJECT_ROLE"
                            renderEntry={this.renderProjectRole}
                            headers={[<NameComparableButton nameComparableType={SortableEntryType.PROJECT_ROLE} label={"Name"} viewProfileId={viewProfileId}/>]}
                            entries={this.props.viewProfile.projectRoles}
                            onMove={this.handleMove}
                            onToggle={this.handleToggle}
                        />
                    </div>
                </div>
            </div>);
        }
    }
}

/**
 * @see ViewProfileOverviewModule
 * @author nt
 * @since 11.09.2017
 */
export const ViewProfileOverview: React.ComponentClass<ViewProfileOverviewLocalProps> = connect(ViewProfileOverviewModule.mapStateToProps, ViewProfileOverviewModule.mapDispatchToProps)(ViewProfileOverviewModule);
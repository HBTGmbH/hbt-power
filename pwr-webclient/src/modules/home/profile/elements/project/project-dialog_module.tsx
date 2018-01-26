import * as React from 'react';
import * as redux from 'redux';
import {AutoComplete, Chip, DatePicker, Dialog, IconButton, Subheader, TextField} from 'material-ui';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {Project} from '../../../../../model/Project';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
// Documentation: https://github.com/TeamWertarbyte/material-ui-chip-input
import ChipInput from './../../../../../external_libs/ChipInput';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {Profile} from '../../../../../model/Profile';
import {isNullOrUndefined} from 'util';
import {AddSkillDialog} from '../skills/add-skill-dialog_module';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';

interface ProjectDialogLocalProps {
    open: boolean;
    project: Project;
    projectRoles: Immutable.Map<string, NameEntity>;
    companies: Immutable.Map<string, NameEntity>;
    profile: Profile;
    onClose(): void;
    onSave(state: ProjectDialogState): void;

}

interface ProjectDialogDispatch {
    onOpenAddSkill(projectId: string): void;
    removeSkillFromProject(projectId: string, skillId: string): void;
}

export interface ProjectDialogState {
    project: Project;
    roles: Immutable.List<string>;
    clientACValue: string; // Autocomplete value of the client field
    brokerACValue: string; // Autocomplete value of the broker field
}

class ProjectDialogModule extends React.Component<ProjectDialogLocalProps & ProjectDialogDispatch, ProjectDialogState> {


    public constructor(props: ProjectDialogLocalProps & ProjectDialogDispatch) {
        super(props);
        this.forceReset(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: ProjectDialogLocalProps): {} {
        return {
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProjectDialogDispatch {
        return {
            onOpenAddSkill: projectId => dispatch(SkillActionCreator.SetAddToProjectId(projectId)),
            removeSkillFromProject: (projectId, skillId) => dispatch(ProfileActionCreator.RemoveSkillFromProject(skillId, projectId))
        };
    }

    private updateProject(project: Project) {
        this.setState({
            project: project
        });
    }

    private forceReset(props: ProjectDialogLocalProps) {
        let roles: Array<string> = [];
        props.project.roleIds().forEach(id => {
            roles.push(NameEntityUtil.getNullTolerantName(id, props.projectRoles));
        });
        this.state = {
            project: props.project,
            roles: Immutable.List<string>(roles),
            clientACValue: NameEntityUtil.getNullTolerantName(props.project.endCustomerId(), props.companies),
            brokerACValue: NameEntityUtil.getNullTolerantName(props.project.brokerId(), props.companies),
        };
        console.log(this.state);
    }

    public componentWillReceiveProps(props: ProjectDialogLocalProps) {
        if(this.props.open == false && props.open == true) {
            this.forceReset(props);
        }
    }

    private handleDeleteSkill = (skillId : string) => {
       this.props.removeSkillFromProject(this.props.project.id(), skillId);
    };

    private renderSkills = () => {
        return this.props.project.skillIDs().map(skillId => {
           return (
               <Chip
                   key={'SkillChip_' + skillId}
                   style={{margin: 4}}
                   onRequestDelete={() => {this.handleDeleteSkill(skillId)}}
               >
               {this.props.profile.getSkill(skillId).name()}
               </Chip>);
        });
    };

    private changeStartDate = (n: undefined, date: Date) => {
        this.updateProject(this.state.project.startDate(date));
    };

    private changeEndDate = (n: undefined, date: Date) => {
        this.updateProject(this.state.project.endDate(date));
    };

    private changeName = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.name(newValue));
    };

    private changeDescription = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.description(newValue));
    };

    private handleSaveButtonPress = () => {
        this.props.onSave(this.state);
    };

    private handleCloseButtonPress = () => {
        // Revert state to original.
        this.props.onClose();
    };

    private handleAddRole = (value: string) => {
        if(this.state.roles.size < 3){ // TODO remove hardcoding
            this.setState({
                roles: this.state.roles.push(value)
            });
        }
    };

    private handleRemoveRole = (value: string) => {
        this.setState({
            roles: Immutable.List<string>(this.state.roles.filter(val => val != value))
        });
    };

    private handleEndCustomerRequest = (chosenRequest: string, index: number) => {
        this.setState({
            clientACValue: chosenRequest
        });
    };

    private handleEndCustomerInput = (text: string) => {
        this.setState({
            clientACValue: text
        });
    };

    private handleBrokerRequest = (chosenRequest: string, index: number) => {
        this.setState({
            brokerACValue: chosenRequest
        });
    };

    private handleBrokerInput = (text: string) => {
        this.setState({
            brokerACValue: text
        });
    };

   /* private handleSkillRequest = (qualifier: string) => {
        this.setState({
            rawSkills: this.state.rawSkills.add(qualifier)
        });

    };*/

    private renderEndDateChoice = () => {
        if(isNullOrUndefined(this.state.project.endDate())) {
            return <TextField
                style={{width: "80%", float: "left"}}
                floatingLabelText={PowerLocalize.get('End')}
                disabled={true}
                value={PowerLocalize.get("Today")}
            />
        } else {
            return <DatePicker floatingLabelText={PowerLocalize.get('Project.EndDate')}
                               style={{width: "80%", float: "left"}}
                               value={this.state.project.endDate()}
                               onChange={this.changeEndDate}
                               fullWidth={true}
                               formatDate={formatToShortDisplay}
            />
        }
    };

    private getEndDateButtonIconName = () => {
        if(isNullOrUndefined(this.state.project.endDate())) {
            return "date_range";
        }
        return "today";
    };

    private handleEndDateButtonClick = () => {
        if(isNullOrUndefined(this.state.project.endDate())) {
            this.changeEndDate(null, new Date());
        } else {
            this.changeEndDate(null, null);
        }
    };


    public render () {
        return (
            <Dialog
                open={this.props.open}
                modal={true}
                onRequestClose={this.props.onClose}
                autoScrollBodyContent={true}
                title={PowerLocalize.get('ProjectDialog.Title')}
                actions={[
                    (<IconButton
                        iconClassName="material-icons icon-size-20"
                        onClick={this.handleSaveButtonPress}
                        tooltip={PowerLocalize.get('Action.Save')}
                    >
                        save
                    </IconButton>),
                    (<IconButton
                        iconClassName="material-icons icon-size-20"
                        onClick={this.handleCloseButtonPress}
                        tooltip={PowerLocalize.get('Action.Exit')}
                    >
                        close
                    </IconButton>)]}
                >
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ProjectName.Singular')}
                                    value={this.state.project.name()}
                                    id={'Project.Name.' + this.state.project.id}
                                    onChange={this.changeName}
                                    fullWidth={true}
                                />
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-5 col-md-offset-1">
                                <DatePicker floatingLabelText={PowerLocalize.get('Project.StartDate')}
                                            value={this.state.project.startDate()}
                                            onChange={this.changeStartDate}
                                            fullWidth={true}
                                            formatDate={formatToShortDisplay}
                                />
                            </div>
                            <div className="col-md-5 col-sm-5 ">
                                <IconButton
                                    style={{width: "20%", float:"left", marginTop: "20px"}}
                                    iconClassName="material-icons"
                                    onClick={this.handleEndDateButtonClick}
                                >
                                    {this.getEndDateButtonIconName()}
                                </IconButton>
                                {this.renderEndDateChoice()}
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <div className="col-md-5 col-sm-6">
                                    <AutoComplete
                                        id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                        floatingLabelText={PowerLocalize.get('Broker.Singular')}
                                        value={this.state.brokerACValue}
                                        searchText={this.state.brokerACValue}
                                        dataSource={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                        onUpdateInput={(txt) => {this.setState({brokerACValue: txt})}}
                                        onNewRequest={this.handleBrokerRequest}
                                        filter={AutoComplete.fuzzyFilter}
                                    />
                                </div>
                            </div>
                            <div className="col-md-5 col-sm-6">
                                <AutoComplete
                                    floatingLabelText={PowerLocalize.get('Customer.Singular')}
                                    id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                    value={this.state.clientACValue}
                                    searchText={this.state.clientACValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                    onUpdateInput={this.handleEndCustomerInput}
                                    onNewRequest={this.handleEndCustomerRequest}
                                    filter={AutoComplete.fuzzyFilter}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                <ChipInput
                                    floatingLabelText={PowerLocalize.get('Project.Dialog.Roles.Title')}
                                    value={this.state.roles.toArray()}
                                    dataSource={this.props.projectRoles.toArray().map(NameEntityUtil.mapToName)}
                                    style={{'width': '100%'}}
                                    onRequestAdd={this.handleAddRole}
                                    onRequestDelete={this.handleRemoveRole}
                                    filter={AutoComplete.fuzzyFilter}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ProjectDialog.Description.LabelText')}
                                    fullWidth = {true}
                                    multiLine={true}
                                    rows={4}
                                    value={this.state.project.description()}
                                    id={'Project.Description.' + this.state.project.id()}
                                    onChange={this.changeDescription}
                                />
                            </div>
                        </div>

                        <div className="row mui-margin">
                            <div className="col-md-10  col-md-offset-1">
                                <Subheader>Skills</Subheader>
                                <AddSkillDialog
                                    onOpen={() => this.props.onOpenAddSkill(this.props.project.id())}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                    {
                                        this.renderSkills()
                                    }
                                </div>
                            </div>
                        </div>
            </Dialog>
        );
    }
}

export const ProjectDialog: React.ComponentClass<ProjectDialogLocalProps> = connect(ProjectDialogModule.mapStateToProps, ProjectDialogModule.mapDispatchToProps)(ProjectDialogModule);
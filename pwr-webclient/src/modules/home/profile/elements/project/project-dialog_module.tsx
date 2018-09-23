import * as React from 'react';
import * as redux from 'redux';
import {Chip, Dialog, IconButton, ListSubheader, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {Project} from '../../../../../model/Project';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
// Documentation: https://github.com/TeamWertarbyte/material-ui-chip-input
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {Profile} from '../../../../../model/Profile';
import {isNullOrUndefined} from 'util';
import {AddSkillDialog} from '../skills/add-skill-dialog_module';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import {DatePicker} from 'material-ui-pickers';
import AutoSuggest from '../../../../general/auto-suggest_module';

// TODO AutoComplete

const ChipInput = require("material-ui-chip-input").default;

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
                   onDelete={() => {this.handleDeleteSkill(skillId)}}
               >
               {this.props.profile.getSkill(skillId).name()}
               </Chip>);
        });
    };

    private changeStartDate = (date: Date) => {
        this.updateProject(this.state.project.startDate(date));
    };

    private changeEndDate = (date: Date) => {
        this.updateProject(this.state.project.endDate(date));
    };

    private changeName = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.name(newValue));
    };

    private changeDescription = (newValue: string) => {
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

    private handleBrokerSelect = (data:string) => {
        if (data != null){
            //this.updateProject(this.state.project.brokerId());
            this.setState({
                brokerACValue: data
            });
        }
    };
    private handleBrokerChange = (data:string) => {
        this.setState({
            brokerACValue: data
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

    private getEndDateButtonIconName = () => {
        if(isNullOrUndefined(this.state.project.endDate())) {
            return "date_range";
        }
        return "today";
    };

    private handleEndDateButtonClick = () => {
        if(isNullOrUndefined(this.state.project.endDate())) {
            this.changeEndDate( new Date());
        } else {
            this.changeEndDate( null);
        }
    };


    public render () {
        {console.log("endRender_project(brokerAC): ",this.state.brokerACValue);}
        return (
            <Dialog
                open={this.props.open}
                onClose={this.props.onClose}
                scroll={'paper'}
                fullWidth
                >
                <DialogTitle><Typography >{PowerLocalize.get('ProjectDialog.Title')}</Typography></DialogTitle>
                <DialogContent>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <TextField
                                    label={PowerLocalize.get('ProjectName.Singular')}
                                    value={this.state.project.name()}
                                    id={'Project.Name.' + this.state.project.id}
                                    onChange={() => this.changeName}
                                    fullWidth={true}
                                />
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-5 col-md-offset-1">
                                <DatePicker
                                    label={PowerLocalize.get('Project.StartDate')}
                                    value={this.state.project.startDate()}
                                    onChange={this.changeStartDate}
                                />
                            </div>
                            <div className="col-md-5 col-sm-5 ">
                                <DatePicker
                                    label={PowerLocalize.get('Project.EndDate')}
                                    value={this.state.project.endDate()}
                                    onChange={this.changeEndDate}
                                    showTodayButton
                                    todayLabel={PowerLocalize.get("Today")}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <div className="col-md-5 col-sm-6">
                                    {/*
                                     <AutoComplete
                                        id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                        label={PowerLocalize.get('Broker.Singular')}
                                        value={this.state.brokerACValue}
                                        searchText={this.state.brokerACValue}
                                        dataSource={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                        onUpdateInput={(txt:any) => {this.setState({brokerACValue: txt})}}
                                        onNewRequest={this.handleBrokerRequest}
                                        filter={AutoComplete.fuzzyFilter}
                                    />
                                    <TextField
                                        id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                        label={PowerLocalize.get('Broker.Singular')}
                                        onChange={(e:any) => this.setState({brokerACValue: e.target.value})}
                                        value={""}
                                    />
                                    */}

                                    <AutoSuggest
                                        data={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                        searchTerm={this.state.brokerACValue}
                                        onSearchChange={this.handleBrokerChange}
                                        onSelect={this.handleBrokerSelect}
                                    />
                                </div>
                            </div>
                            <div className="col-md-5 col-sm-6">
                                {/*<AutoComplete
                                    label={PowerLocalize.get('Customer.Singular')}
                                    id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                    value={this.state.clientACValue}
                                    searchText={this.state.clientACValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                    onUpdateInput={this.handleEndCustomerInput}
                                    onNewRequest={this.handleEndCustomerRequest}
                                    filter={AutoComplete.fuzzyFilter}
                                />*/}

                                <TextField
                                    label={PowerLocalize.get('Customer.Singular')}
                                    id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                    onChange={() => this.handleEndCustomerInput}
                                    value={""}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                {/*<ChipInput
                                    label={PowerLocalize.get('Project.Dialog.Roles.Title')}

                                    value={this.state.roles.toArray()}
                                    dataSource={this.props.projectRoles.toArray().map(NameEntityUtil.mapToName)}
                                    style={{'width': '100%'}}
                                    onRequestAdd={this.handleAddRole}
                                    onRequestDelete={this.handleRemoveRole}
                                    filter={AutoComplete.fuzzyFilter}
                                />*/}
                                {this.state.roles.map(data => {

                                    //TODO ChipInput
                                    return( <Chip
                                       key={data}
                                       label={data}
                                       //onDelete={this.handleDeleteChip(data)}
                                    />)
                                })}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                <TextField
                                    label={PowerLocalize.get('ProjectDialog.Description.LabelText')}
                                    fullWidth = {true}
                                    multiline={true}
                                    rows={4}
                                    value={this.state.project.description()}
                                    id={'Project.Description.' + this.state.project.id()}
                                    onChange={() => this.changeDescription}
                                />
                            </div>
                        </div>

                        <div className="row mui-margin">
                            <div className="col-md-10  col-md-offset-1">
                                <ListSubheader>Skills</ListSubheader>
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
                </DialogContent>
                <DialogActions>
                    <Tooltip title={PowerLocalize.get('Action.Save')}>
                        <IconButton
                        className="material-icons icon-size-20"
                        onClick={this.handleSaveButtonPress}
                        >
                            save
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={PowerLocalize.get('Action.Exit')}>
                        <IconButton
                        className="material-icons icon-size-20"
                        onClick={this.handleCloseButtonPress}
                        >
                            close
                        </IconButton>
                    </Tooltip>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ProjectDialog: React.ComponentClass<ProjectDialogLocalProps> = connect(ProjectDialogModule.mapStateToProps, ProjectDialogModule.mapDispatchToProps)(ProjectDialogModule);
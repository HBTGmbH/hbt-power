import * as React from 'react';
import * as redux from 'redux';
import {Chip, Dialog, ListSubheader, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {Project} from '../../../../../model/Project';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
// Documentation: https://github.com/TeamWertarbyte/material-ui-chip-input
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {Profile} from '../../../../../model/Profile';
import {isNullOrUndefined} from 'util';
import {AddSkillDialog} from '../skills/add-skill-dialog_module';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import {DatePicker} from 'material-ui-pickers';
import AutoSuggest from '../../../../general/auto-suggest_module';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {ComparatorBuilder} from 'ts-comparator';

const ChipInput = require('material-ui-chip-input').default;

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
    roles: Array<string>;
    clientACValue: string; // Autocomplete value of the client field
    brokerACValue: string; // Autocomplete value of the broker field
}

class ProjectDialogModule extends React.Component<ProjectDialogLocalProps & ProjectDialogDispatch, ProjectDialogState> {


    public constructor(props: ProjectDialogLocalProps & ProjectDialogDispatch) {
        super(props);
        this.forceReset(props, true);
    }

    static mapStateToProps(state: ApplicationState, localProps: ProjectDialogLocalProps): {} {
        return {};
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

    private forceReset(props: ProjectDialogLocalProps, initial: boolean) {
        let roles: Array<string> = [];
        props.project.roleIds().forEach(id => {
            roles.push(NameEntityUtil.getNullTolerantName(id, props.projectRoles));
        });
        let state = {
            project: props.project,
            roles: roles,
            clientACValue: NameEntityUtil.getNullTolerantName(props.project.endCustomerId(), props.companies),
            brokerACValue: NameEntityUtil.getNullTolerantName(props.project.brokerId(), props.companies),
        };
        if (initial) {
            this.state = state;
        } else {
            this.setState(state);
        }
        console.log(this.state);
    }

    public componentWillReceiveProps(props: ProjectDialogLocalProps) {
        if (this.props.open == false && props.open == true) {
            this.forceReset(props, false);
        }
    }

    private handleDeleteSkill = (skillId: string) => {
        this.props.removeSkillFromProject(this.props.project.id(), skillId);
    };

    private renderSkills = () => {
        return this.props.project.skillIDs()
            .sort(ComparatorBuilder.comparing((s: string) => s).build())
            .map(skillId => <Chip
                    key={'SkillChip_' + skillId}
                    style={{margin: 4}}
                    onDelete={() => {
                        this.handleDeleteSkill(skillId);
                    }}
                    label={this.props.profile.getSkill(skillId).name()}
                />);
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
        this.props.onClose();
    };


    private handleAddRole = (value: string) => {
        if(this.state.roles.length < 3){
            this.setState({
                roles: [...this.state.roles, value]
            });
        }
    };

    private handleRemoveRole = (value: string) => {
        this.setState({
            roles: this.state.roles.filter(val => val != value)
        });
    };

    private handleEndCustomerInput = (text: string) => {
        this.setState({
            clientACValue: text
        });
    };

    private handleBrokerChange = (chosenRequest: string) => {
        this.setState({
            brokerACValue: chosenRequest
        });
    };

    private getEndDateButtonIconName = () => {
        if (isNullOrUndefined(this.state.project.endDate())) {
            return 'date_range';
        }
        return 'today';
    };

    private handleEndDateButtonClick = () => {
        if (isNullOrUndefined(this.state.project.endDate())) {
            this.changeEndDate(new Date());
        } else {
            this.changeEndDate(null);
        }
    };


    public render() {
        {
            console.log('endRender_project(brokerAC): ', this.state.brokerACValue);
        }
        return (
            <Dialog open={this.props.open}
                    onClose={this.props.onClose}
                    fullWidth
            >
                <DialogTitle>{PowerLocalize.get('ProjectDialog.Title')}</DialogTitle>
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
                                autoOk
                                label={PowerLocalize.get('Project.StartDate')}
                                id={'ProjectDialog.StartDate' + this.props.project.id()}
                                value={this.state.project.startDate()}
                                onChange={this.changeStartDate}
                                format="DD.MM.YYYY"
                            />
                        </div>
                        <div className="col-md-5 col-sm-5 ">
                            <DatePicker
                                label={PowerLocalize.get('Project.EndDate')}
                                value={this.state.project.endDate()}
                                id={'ProjectDialog.EndDate' + this.props.project.id()}
                                onChange={this.changeEndDate}
                                showTodayButton
                                todayLabel={PowerLocalize.get('Today')}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-5 col-sm-5 col-md-offset-1">
                            <AutoSuggest
                                fullWidth={true}
                                label={PowerLocalize.get('Broker.Singular')}
                                id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                data={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.brokerACValue}
                                onSelect={this.handleBrokerChange}
                                closeOnSelect={true}
                                onSearchChange={this.handleBrokerChange}
                            />
                        </div>
                        <div className="col-md-5 col-sm-5 ">
                            <AutoSuggest
                                fullWidth={true}
                                label={PowerLocalize.get('Customer.Singular')}
                                id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                data={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.clientACValue}
                                onSelect={this.handleEndCustomerInput}
                                closeOnSelect={true}
                                onSearchChange={this.handleEndCustomerInput}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-offset-1 col-md-10">
                            <ChipInput
                                label={PowerLocalize.get('Project.Dialog.Roles.Title')}
                                dataSource={this.props.projectRoles.toArray().map(NameEntityUtil.mapToName)}
                                value={this.state.roles}
                                onAdd={(chip) => this.handleAddRole(chip)}
                                onDelete={(chip, index) => this.handleRemoveRole(chip)}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-offset-1 col-md-10">
                            <TextField
                                label={PowerLocalize.get('ProjectDialog.Description.LabelText')}
                                fullWidth={true}
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
                    <PwrIconButton tooltip={PowerLocalize.get('Action.Save')} iconName="save" onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton tooltip={PowerLocalize.get('Action.Exit')} iconName="close" onClick={this.handleCloseButtonPress}/>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ProjectDialog: React.ComponentClass<ProjectDialogLocalProps> = connect(ProjectDialogModule.mapStateToProps, ProjectDialogModule.mapDispatchToProps)(ProjectDialogModule);
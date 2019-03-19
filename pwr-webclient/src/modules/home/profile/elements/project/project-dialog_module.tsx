import * as React from 'react';
import * as redux from 'redux';
import {AppBar, Chip, Dialog, TextField, Toolbar, Typography} from '@material-ui/core';
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
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {ComparatorBuilder} from 'ts-comparator';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {PwrYearPicker} from '../../../../general/pwr-year-picker';
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';
import {PwrTextLength} from '../../../../general/pwr-text-length_module';
import {DatePickerType} from '../../../../../model/DatePickerType';
import {PwrDatePicker} from '../../../../general/pwr-date-picker_module';
import Avatar from '@material-ui/core/Avatar/Avatar';

const ChipInput = require('material-ui-chip-input').default;

const TEXTLIMIT = 4000;

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
    roleACValue: string;
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
        let roles: Array<string> = props.project.roleIds()
            .map(id => NameEntityUtil.getNullTolerantName(id, props.projectRoles))
            .toArray();
        let state = {
            project: props.project,
            roles: roles,
            clientACValue: NameEntityUtil.getNullTolerantName(props.project.endCustomerId(), props.companies),
            brokerACValue: NameEntityUtil.getNullTolerantName(props.project.brokerId(), props.companies),
            roleACValue: ''
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
            .filter(value => this.props.profile.getSkill(value) != null)
            .map(skillId => <Chip
                avatar={<Avatar>{this.props.profile.getSkill(skillId).rating()}</Avatar>}
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

    private changeName = (event: any) => {
        this.updateProject(this.state.project.name(event.target.value));
    };

    private changeDescription = (event: any) => {
        if(event.target.value.length <= TEXTLIMIT){
            this.updateProject(this.state.project.description(event.target.value));
        }

    };

    private handleSaveButtonPress = () => {
        this.props.onSave(this.state);
    };

    private handleCloseButtonPress = () => {
        this.props.onClose();
    };


    private handleAddRole = (value: string) => {
        console.log("Project_Module add: "+value);
        if (this.state.roles.length < 3) {
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

    private handleRoleInput = (text: string) => {
        this.setState({
            roleACValue: text
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


    private handleTextLengthError =(amt:number) => {
        this.props.project.description(this.props.project.description().substring(0,TEXTLIMIT));
    };

    public render() {
        {
            console.debug('endRender_project(brokerAC): ', this.state.brokerACValue);
            //console.log("Rollen: "+this.props.projectRoles.toArray().map(NameEntityUtil.mapToName))
        }
        return (
            <Dialog open={this.props.open}
                    onClose={this.props.onClose}
                    fullScreen={true}
            >
                <AppBar>
                    <Toolbar>
                        <Typography style={{color: 'white', flex: 1}}
                                    variant={'h6'}>{PowerLocalize.get('ProjectDialog.Title')}</Typography>
                        <PwrIconButton style={{color: 'white'}} tooltip={PowerLocalize.get('Action.Save')}
                                       iconName="save"
                                       onClick={this.handleSaveButtonPress}/>
                        <PwrIconButton style={{color: 'white'}} tooltip={PowerLocalize.get('Action.Exit')}
                                       iconName="close"
                                       onClick={this.handleCloseButtonPress}/>
                    </Toolbar>
                </AppBar>
                <PwrSpacer double={true}/>
                <PwrSpacer double={true}/>
                <PwrSpacer double={true}/>
                <DialogContent>
                    <div className="row">
                        <div className="col-md-10">
                            <TextField
                                label={PowerLocalize.get('ProjectName.Singular')}
                                value={this.state.project.name()}
                                id={'Project.Name.' + this.state.project.id}
                                onChange={(e: any) => this.changeName(e)}
                                fullWidth={true}
                            />
                        </div>
                    </div>
                    <PwrSpacer double={true}/>
                    <div className="row">
                        <div className="col-md-5">
                            <PwrDatePicker
                            onChange={this.changeStartDate}
                            placeholderDate={this.state.project.startDate()}
                            label={'Start'}
                            type={DatePickerType.MONTH_YEAR}
                        />
                        </div>
                        <div className="col-md-5">
                            <PwrDatePicker
                                onChange={this.changeEndDate}
                                placeholderDate={this.state.project.endDate()}
                                label={'Ende'}
                                type={DatePickerType.MONTH_YEAR}
                            />
                        </div>
                    </div>
                    <PwrSpacer double={true}/>
                    <div className="row">
                        <div className="col-md-5">
                            <PwrAutoComplete
                                fullWidth={true}
                                label={PowerLocalize.get('Broker.Singular')}
                                id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                data={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.brokerACValue}
                                onSearchChange={this.handleBrokerChange}
                            />
                        </div>
                        <div className="col-md-5">
                            <PwrAutoComplete
                                fullWidth={true}
                                label={PowerLocalize.get('Customer.Singular')}
                                id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                data={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.clientACValue}
                                onSearchChange={this.handleEndCustomerInput}
                            />
                        </div>
                    </div>
                    <PwrSpacer double={true}/>
                    <div className="row">
                        <div className="col-md-10">
                            <PwrAutoComplete
                                fullWidth={true}
                                multi
                                label={PowerLocalize.get('Project.Dialog.Roles.Title')}
                                id={'ProjectDialog.ProjectRoles.' + this.props.project.id}
                                data={this.props.projectRoles.toArray().map(NameEntityUtil.mapToName)}
                                onAdd={(chip) => this.handleAddRole(chip)}
                                onRemove={(chip) => this.handleRemoveRole(chip)}
                                onSearchChange={this.handleRoleInput}
                                searchTerm={this.state.roleACValue}
                                chips={this.state.roles}
                            />
                        </div>
                    </div>
                    <PwrSpacer double={true}/>
                    <div className="row">
                        <div className="col-md-10">
                            <TextField
                                label={PowerLocalize.get('ProjectDialog.Description.LabelText')}
                                fullWidth={true}
                                multiline={true}
                                rows={4}
                                value={this.state.project.description()}
                                id={'Project.Description.' + this.state.project.id()}
                                onChange={(e: any) => this.changeDescription(e)}
                            />
                            <PwrTextLength value={this.state.project.description()} maxChars={TEXTLIMIT} OnError={this.handleTextLengthError}/>
                        </div>
                    </div>
                    <PwrSpacer double={true}/>
                    <div className="row">
                        <div className="col-md-10">
                            <Typography variant="subtitle1">Skills</Typography>
                            <AddSkillDialog
                                onOpen={() => this.props.onOpenAddSkill(this.props.project.id())}
                            />
                        </div>
                    </div>
                    <PwrSpacer double={true}/>
                    <div className="row">
                        <div className="col-md-10">
                            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                {
                                    this.renderSkills()
                                }
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <PwrIconButton tooltip={PowerLocalize.get('Action.Save')} iconName="save"
                                   onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton tooltip={PowerLocalize.get('Action.Exit')} iconName="close"
                                   onClick={this.handleCloseButtonPress}/>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ProjectDialog: React.ComponentClass<ProjectDialogLocalProps> = connect(ProjectDialogModule.mapStateToProps,
    ProjectDialogModule.mapDispatchToProps)(ProjectDialogModule);
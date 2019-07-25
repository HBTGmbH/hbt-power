import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {emptyProject, Project} from '../../../../../reducers/profile-new/profile/model/Project';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {NameEntity, newNameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
import {ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {isNullOrUndefined} from 'util';
import Dialog from '@material-ui/core/Dialog/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import Typography from '@material-ui/core/Typography/Typography';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Grid from '@material-ui/core/Grid/Grid';
import TextField from '@material-ui/core/TextField/TextField';
import {PwrDatePicker} from '../../../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../../../model/DatePickerType';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {NameEntityType} from '../../../../../reducers/profile-new/profile/model/NameEntityType';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../../../model/PwrConstants';
import {PwrTextLength} from '../../../../general/pwr-text-length_module';
import {AddSkill} from '../skills/add-skill_module';

interface ProjectDialogProps {
    allProjectRoles: Array<string>;
    allCompanies: Array<string>;
    initials: string;
}

interface ProjectDialogLocalProps {
    project: Project;
    open: boolean;

    onClose(): void;
}

interface ProjectDialogDispatch {
    saveProject(initials: string, project: Project): void;
}

interface ProjectDialogState {
    name: string;
    description: string;
    projectRoles: Array<string>;
    broker: string;
    client: string;
    startDate: Date;
    endDate: Date;
    skills: Array<ProfileSkill>;
    searchRole: string;
}

class ProjectEditDialog_module extends React.Component<ProjectDialogProps & ProjectDialogLocalProps & ProjectDialogDispatch, ProjectDialogState> {

    static mapStateToProps(state: ApplicationState, localProps: ProjectDialogLocalProps): ProjectDialogProps {
        const projectRoles: Array<NameEntity> = !isNullOrUndefined(state.suggestionStore.allProjectRoles) ? state.suggestionStore.allProjectRoles : [];
        const companies: Array<NameEntity> = !isNullOrUndefined(state.suggestionStore.allCompanies) ? state.suggestionStore.allCompanies : [];
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        const roleString = projectRoles.map(p => p.name);
        const compString = companies.map(c => c.name);
        return {
            allProjectRoles: roleString,
            allCompanies: compString,
            initials: initials
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProjectDialogDispatch {
        return {
            saveProject: (initials, project) => dispatch(ProfileDataAsyncActionCreator.saveProject(initials, project))
        };
    }

    private handleCloseButtonPress = () => {
        this.props.onClose();
    };

    private handleSaveButtonPress = () => {
        let project: Project = emptyProject();
        project.name = this.state.name;
        project.description = this.state.description;
        project.projectRoles = this.state.projectRoles.map((name) => newNameEntity(null, name, NameEntityType.PROJECT_ROLE));
        project.broker = newNameEntity(null, this.state.broker, NameEntityType.COMPANY);
        project.client = newNameEntity(null, this.state.client, NameEntityType.COMPANY);
        project.startDate = this.state.startDate;
        project.endDate = this.state.endDate;
        project.skills = this.state.skills;

        this.props.saveProject(this.props.initials, project);
    };

    private handleAddRole = (chip: string) => {
        if (this.state.projectRoles.length < 3) {
            this.setState({
                projectRoles: [...this.state.projectRoles, chip]
            });
        }
    };

    private handleRemoveRole = (value: string) => {
        this.setState({
            projectRoles: this.state.projectRoles.filter(val => val != value)
        });
    };

    private handleDescriptionChange = (event: any) => {
        const text: string = event.target.value;
        if (text.length <= PROFILE_DESCRIPTION_LENGTH) {
            this.setState({description: text});
        }
    };

    private handleTextLengthError = () => {
        this.setState({description: this.state.description.substring(0, PROFILE_DESCRIPTION_LENGTH)});
    };

    render() {
        return <Dialog
            open={this.props.open}
            onClose={this.props.onClose}
            fullScreen
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
            <DialogContent>
                <Grid container
                      spacing={8}
                      direction="column"
                      justify="center"
                      alignItems="center"
                >
                    <Grid item md={12}>
                        <TextField
                            label={'Projektname'}
                            value={this.state.name}
                            id={'name'}
                            fullWidth
                            onChange={(e) => this.setState({name: e.target.value})}
                        />
                    </Grid>

                    <Grid item container spacing={8} md={12}>
                        <Grid item md={5}>
                            <PwrDatePicker
                                onChange={(d) => this.setState({startDate: d})}
                                placeholderDate={this.state.startDate}
                                label={'Start'}
                                type={DatePickerType.MONTH_YEAR}
                            />
                        </Grid>
                        <Grid item md={5}>
                            <PwrDatePicker
                                onChange={(d) => this.setState({endDate: d})}
                                placeholderDate={this.state.endDate}
                                label={'Ende'}
                                type={DatePickerType.MONTH_YEAR}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container spacing={8} md={12}>
                        <Grid item md={6} xs={12}>
                            <PwrAutoComplete
                                fullWidth={true}
                                label={PowerLocalize.get('Broker.Singular')}
                                id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                data={this.props.allCompanies}
                                searchTerm={this.state.broker}
                                onSearchChange={(v) => this.setState({broker: v})}
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <PwrAutoComplete
                                fullWidth={true}
                                label={PowerLocalize.get('Customer.Singular')}
                                id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                data={this.props.allCompanies}
                                searchTerm={this.state.client}
                                onSearchChange={(v) => this.setState({client: v})}
                            />
                        </Grid>
                    </Grid>
                    <Grid item md={12}>
                        <PwrAutoComplete
                            fullWidth={true}
                            multi
                            label={PowerLocalize.get('Project.Dialog.Roles.Title')}
                            id={'ProjectDialog.ProjectRoles.' + this.props.project.id}
                            data={this.props.allProjectRoles}
                            onAdd={(chip) => this.handleAddRole(chip)}
                            onRemove={(chip) => this.handleRemoveRole(chip)}
                            onSearchChange={(v) => this.setState({searchRole: v})}
                            searchTerm={this.state.searchRole}
                            chips={this.state.projectRoles}
                        />
                    </Grid>
                    <Grid item md={12}>
                        <TextField
                            label={PowerLocalize.get('ProjectDialog.Description.LabelText')}
                            fullWidth={true}
                            multiline={true}
                            rows={4}
                            value={this.state.description}
                            id={'Project.Description.' + this.props.project.id}
                            onChange={(e: any) => this.handleDescriptionChange(e)}
                        />
                        <PwrTextLength value={this.state.description} maxChars={PROFILE_DESCRIPTION_LENGTH}
                                       OnError={this.handleTextLengthError}/>
                    </Grid>
                    <Grid item md={12}>
                        <AddSkill projectId={this.props.project.id}/>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>;
    }
}

export const ProjectDialog: React.ComponentClass<ProjectDialogLocalProps> = connect(ProjectEditDialog_module.mapStateToProps,
    ProjectEditDialog_module.mapDispatchToProps)(ProjectEditDialog_module);
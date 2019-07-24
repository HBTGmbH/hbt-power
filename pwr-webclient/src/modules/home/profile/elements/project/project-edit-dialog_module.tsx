import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {emptyProject, Project} from '../../../../../reducers/profile-new/profile/model/Project';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {NameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
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

interface ProjectDialogProps {
    allProjectRoles: Array<NameEntity>;
    allCompanies: Array<NameEntity>;
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
    projectRoles: Array<NameEntity>;
    broker: NameEntity;
    client: NameEntity;
    startDate: Date;
    endDate: Date;
    skills: Array<ProfileSkill>;
}

class ProjectEditDialog_module extends React.Component<ProjectDialogProps & ProjectDialogLocalProps & ProjectDialogDispatch, ProjectDialogState> {

    static mapStateToProps(state: ApplicationState, localProps: ProjectDialogLocalProps): ProjectDialogProps {
        const projectRoles = !isNullOrUndefined(state.suggestionStore.allProjectRoles) ? state.suggestionStore.allProjectRoles : [];
        const companies = !isNullOrUndefined(state.suggestionStore.allCompanies) ? state.suggestionStore.allCompanies : [];
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        return {
            allProjectRoles: projectRoles,
            allCompanies: companies,
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
        project.projectRoles = this.state.projectRoles;
        project.broker = this.state.broker;
        project.client = this.state.client;
        project.startDate = this.state.startDate;
        project.endDate = this.state.endDate;
        project.skills = this.state.skills;

        this.props.saveProject(this.props.initials, project);
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

                    <Grid item container spacing={8}>
                        <Grid item md={5}>
                            <PwrDatePicker
                                onChange={(d) => this.setState({startDate:d})}
                                placeholderDate={this.state.startDate}
                                label={'Start'}
                                type={DatePickerType.MONTH_YEAR}
                            />
                        </Grid>
                        <Grid item md={5}>
                            <PwrDatePicker
                                onChange={(d) => this.setState({endDate:d})}
                                placeholderDate={this.state.endDate}
                                label={'Ende'}
                                type={DatePickerType.MONTH_YEAR}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>

        </Dialog>;
    }
}

export const ProjectDialog: React.ComponentClass<ProjectDialogLocalProps> = connect(ProjectEditDialog_module.mapStateToProps,
    ProjectEditDialog_module.mapDispatchToProps)(ProjectEditDialog_module);
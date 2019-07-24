import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import * as redux from 'redux';
import {isNullOrUndefined} from 'util';
import {NameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
import {ProfileStore} from '../../../../../reducers/profile-new/ProfileStore';
import Grid from '@material-ui/core/Grid/Grid';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ProjectDialog} from './project-dialog_module';
import Paper from '@material-ui/core/Paper/Paper';
import Typography from '@material-ui/core/Typography/Typography';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {formatToYear} from '../../../../../utils/DateUtil';

interface ProjectProps {
    allProjectRoles: Array<NameEntity>;
    allCompanies: Array<NameEntity>;
    initials: string;
}


interface ProjectLocalProps {
    project: Project;
}

interface ProjectLocalState {
    dialogOpen: boolean;
}

interface ProjectDispatch {
    deleteProject(initials: string, id: number): void;

    saveProject(initials: string, project: Project): void;
}

class Project_module extends React.Component<ProjectProps & ProjectLocalProps & ProjectDispatch, ProjectLocalState> {

    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ProjectLocalProps): ProjectProps {
        const projects = !isNullOrUndefined(state.profileStore.profile) ? state.profileStore.profile.projects : [];
        const projectRoles = !isNullOrUndefined(state.suggestionStore) ? state.suggestionStore.allProjectRoles : [];
        const companies = !isNullOrUndefined(state.suggestionStore) ? state.suggestionStore.allCompanies : [];
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        return {
            allProjectRoles: projectRoles,
            allCompanies: companies,
            initials: initials
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ProfileStore>): ProjectDispatch {
        return {
            deleteProject: (initials, id) => {
                dispatch(ProfileDataAsyncActionCreator.deleteProject(initials, id));
            },
            saveProject: (initials, project) => {
                dispatch(ProfileDataAsyncActionCreator.saveProject(initials, project));
            }
        };
    }

    private deleteButtonPress = () => {
        this.props.deleteProject(this.props.initials, this.props.project.id);
    };

    private title = () => {
        const name = !isNullOrUndefined(this.props.project.name) ? this.props.project.name : '';
        const client = !isNullOrUndefined(this.props.project.client) ? this.props.project.client : '';

        return name + ' für ' + client;
    };

    private subtitle = () => {
        const roles: Array<NameEntity> = !isNullOrUndefined(this.props.project.projectRoles) && !isNullOrUndefined(this.props.project.projectRoles) ? this.props.project.projectRoles : [];
        let roleString = '';
        roles.map(r => roleString.concat(r.name + ', '));
        roleString = roleString.substring(0, roleString.length - 1);

        const start = !isNullOrUndefined(this.props.project.startDate) ? formatToYear(this.props.project.startDate) : '';
        const end = !isNullOrUndefined(this.props.project.endDate) ? formatToYear(this.props.project.endDate) : 'Heute';
        return 'Tätig als ' + roleString + ' von ' + start + ' bis ' + end;

    };

    render() {
        return (<Paper style={{height: '100%'}}>
            <Grid item container spacing={8} direction={'column'} style={{height: '100%'}}>
                <Grid item container spacing={8} direction={'column'} wrap={'nowrap'}
                      style={{height: 'calc(100% - 48px)'}}>
                    <Grid item>
                        <Typography variant={'h6'} style={{margin: '5px'}}>
                            {this.title()}
                        </Typography>
                        <Typography variant={'caption'} style={{margin: '5px'}}>
                            {this.subtitle()}
                        </Typography>
                        <hr/>
                    </Grid>
                    <Grid
                        item
                        xs
                        style={{overflowY: 'auto', marginLeft: '10px', marginRight: '10px'}}
                    >
                        <Typography
                            variant={'body2'}
                            style={{marginRight: '5px'}}
                        >
                            {
                                this.props.project.description
                            }
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item>
                    <PwrIconButton iconName={'edit'} tooltip={PowerLocalize.get('Action.Edit')}
                                   onClick={() => this.setState({dialogOpen: true})}/>
                    <PwrIconButton iconName={'delete'} tooltip={PowerLocalize.get('Action.Delete')} isDeleteButton
                                   onClick={this.deleteButtonPress}/>

                </Grid>
                <ProjectDialog key={'projectDialog.' + this.props.project.id}
                               open={this.state.dialogOpen}
                               project={this.props.project}
                               onClose={() => this.setState({dialogOpen: false})}
                               onSave={this.handleSaveRequest}
                               companies={this.props.allCompanies}
                               projectRoles={this.props.allProjectRoles}
                               profile={this.props.profile}
                />
            </Grid>
        </Paper>);
    }

}

export const SingleProject: React.ComponentClass<ProjectLocalProps> = connect(Project_module.mapStateToProps, Project_module.mapDispatchToProps)(Project_module);
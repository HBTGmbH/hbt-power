import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import * as redux from 'redux';
import {isNullOrUndefined} from 'util';
import {NameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import Grid from '@material-ui/core/Grid/Grid';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {SingleProject} from './single-project_module';

interface ProjectsProps {

    projects: Array<Project>
    projectRoles: Array<NameEntity>;
    companies: Array<NameEntity>;
    initials: string;
}


interface ProjectsLocalProps {

}

interface ProjectsLocalState {

}

interface ProjectsDispatch {
    deleteProject(initials: string, id: number): void;

    saveProject(initials: string, project: Project): void;
}

class Projects_module extends React.Component<ProjectsProps & ProjectsProps & ProjectsDispatch, ProjectsLocalState> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    static mapStateToProps(state: ApplicationState, localProps: ProjectsProps): ProjectsProps {
        const projects = !isNullOrUndefined(state.profileStore.profile) ? state.profileStore.profile.projects : [];
        const projectRoles = !isNullOrUndefined(state.suggestionStore) ? state.suggestionStore.allProjectRoles : [];
        const companies = !isNullOrUndefined(state.suggestionStore) ? state.suggestionStore.allCompanies : [];
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        return {
            projects: projects,
            projectRoles: projectRoles,
            companies: companies,
            initials: initials
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ProfileStore>): ProjectsDispatch {
        return {
            deleteProject: (initials, id) => {
                dispatch(ProfileDataAsyncActionCreator.deleteProject(initials, id));
            },
            saveProject: (initials, project) => {
                dispatch(ProfileDataAsyncActionCreator.saveProject(initials, project));
            }
        };
    }

    private renderSingleProject = (project:Project) => {
        return (<SingleProject project={project}/>)
    };

    render() {
        return (<div style={{alignContent: 'center'}}>
            <Grid
                container
                spacing={8}
                justify={'flex-start'}
                alignItems={'flex-start'}
            >
                {this.props.projects.map((p) => this.renderSingleProject(p))}
            </Grid>
        </div>);
    }

}

export const Projects: React.ComponentClass<ProjectsLocalProps> = connect(Projects_module.mapStateToProps, Projects_module.mapDispatchToProps)(Projects_module);
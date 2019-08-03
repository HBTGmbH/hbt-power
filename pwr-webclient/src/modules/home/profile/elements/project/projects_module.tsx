import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import * as redux from 'redux';
import {isNullOrUndefined} from 'util';
import {NameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
import {SelectedProject} from './single-project_module';
import {StringUtils} from '../../../../../utils/StringUtil';
import {List} from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import {Add} from '@material-ui/icons';
import {selectProject} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';

interface ProjectsProps {
    projects: Array<Project>
}


interface ProjectsLocalProps {

}

interface ProjectsLocalState {

}

interface ProjectsDispatch {
    selectProject(index: number): void;
}

class ProjectsModule extends React.Component<ProjectsProps & ProjectsProps & ProjectsDispatch, ProjectsLocalState> {

    constructor(props) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: ProjectsProps): ProjectsProps {
        const projects = !isNullOrUndefined(state.profileStore.profile) ? state.profileStore.profile.projects : [];
        return {
            projects: projects
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ProfileStore>): ProjectsDispatch {
        return {
            selectProject: index => dispatch(selectProject(index))
        };
    }

    private renderProjectListItem = (project: Project, index: number) => {
        const name = StringUtils.defaultString(project.name);
        const client =  StringUtils.defaultString(nameEntityName(project.client));
        return <ListItem button key={project.id} onClick={event => this.props.selectProject(index)}>
            <ListItemText primary={`${name} für ${client}`} />
        </ListItem>
    };


    private addNewProject = () => {
        throw new Error("NOT IMPLEMENTED!");
    };

    render() {
        if (!this.props.projects) {
            return <React.Fragment/>;
        }
        return <div className="row">
            <div className="col-md-3">
                <List>
                    {this.props.projects.map((project, index) => this.renderProjectListItem(project, index))}
                    <ListItem>
                        <ListItemIcon>
                            <Add/>
                        </ListItemIcon>
                        <ListItemText primary="Add Project" onClick={() => this.addNewProject()}/>
                    </ListItem>
                </List>
            </div>
            <div className="col-md-9">
                <SelectedProject/>
            </div>
        </div>
    }
}

export const Projects: React.ComponentClass<ProjectsLocalProps> = connect(ProjectsModule.mapStateToProps, ProjectsModule.mapDispatchToProps)(ProjectsModule);

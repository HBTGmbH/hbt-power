import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {SelectedProject} from './single-project_module';
import {StringUtils} from '../../../../../utils/StringUtil';
import {Divider, List} from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import {Add} from '@material-ui/icons';
import {selectProject, addNewProject} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';

interface ProjectsProps {
    projects: Array<Project>
    selectedIndex: number;
    canAddProject: boolean;
}


interface ProjectsLocalProps {

}

interface ProjectsLocalState {

}

interface ProjectsDispatch {
    selectProject(index: number): void;
    addNewProject(): void;
}

class ProjectsModule extends React.Component<ProjectsProps & ProjectsProps & ProjectsDispatch, ProjectsLocalState> {

    constructor(props) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: ProjectsProps): ProjectsProps {
        return {
            projects: state.profileStore.profile.projects,
            selectedIndex: state.profileStore.selectedProjectIndex,
            canAddProject: !state.profileStore.selectedProject || state.profileStore.selectedProject.id !== null
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProjectsDispatch {
        return {
            selectProject: index => dispatch(selectProject(index)),
            addNewProject: () => dispatch(addNewProject())
        };
    }




    private addNewProject = () => {
        this.props.addNewProject();
    };

    private chooseClassName(index): string {
        if (this.props.selectedIndex === index) {
            return 'pwr-selected-list-item'
        }
        return '';
    }

    private renderProjectListItem = (project: Project, index: number) => {
        const name = StringUtils.defaultString(project.name);
        const client =  StringUtils.defaultString(nameEntityName(project.client));
        return <ListItem className={this.chooseClassName(index)} button key={project.id} onClick={event => this.props.selectProject(index)}>
            <ListItemText primary={`${name} für ${client}`} />
        </ListItem>
    };

    render() {
        if (!this.props.projects) {
            return <React.Fragment/>;
        }
        return <div className="row">
            <div className="col-md-3">
                <List component="nav">
                    {this.props.projects.map((project, index) => this.renderProjectListItem(project, index))}
                    <Divider/>
                    <ListItem button onClick={() => this.addNewProject()} disabled={!this.props.canAddProject} >
                        <ListItemIcon>
                            <Add/>
                        </ListItemIcon>
                        <ListItemText primary="Add Project"/>
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

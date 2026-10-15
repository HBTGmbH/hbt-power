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
import Add from '@material-ui/icons/Add';
import {addNewProject, selectProject} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';

interface ProjectsProps {
    projects: Array<Project>
    selectedIndex: number;
    canAddProject: boolean;
}

interface ProjectsLocalState {
}

interface ProjectsDispatch {
    selectProject(index: number): void;

    addNewProject(): void;
}

class ProjectsModule extends React.Component<ProjectsProps & ProjectsDispatch, ProjectsLocalState> {
    private projectRef;

    constructor(props) {
        super(props);
        this.projectRef = React.createRef();
    }

    static mapStateToProps(state: ApplicationState): ProjectsProps {
        return {
            projects: state.profileStore.profile.projects,
            selectedIndex: state.profileStore.selectedProjectIndex,
            canAddProject: !state.profileStore.selectedProject || state.profileStore.selectedProject.id !== null
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch): ProjectsDispatch {
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
            return 'pwr-selected-list-item';
        }
        return '';
    }

    private handleClick = (projectIndex: number) => {
        this.props.selectProject(projectIndex);
    };

    private renderProjectListItem = (project: Project, index: number) => {
        const name = StringUtils.defaultString(project.name);
        const client = StringUtils.defaultString(nameEntityName(project.client));
        return <ListItem className={this.chooseClassName(index)} button key={project.id}
                         onClick={event => this.handleClick(index)}>
            <ListItemText primary={PowerLocalize.getFormatted('Profile.Project.List.Title', name, client)}/>
        </ListItem>;
    };

    render() {
        if (!this.props.projects) {
            return <React.Fragment/>;
        }
        return <div className="row" style={{scrollBehavior: 'smooth'}}>
            <div className="col-md-3" ref={this.projectRef}>
                <List component="nav">
                    {this.props.projects.sort((a, b) => {
                        if (a.startDate > b.startDate) return -1;
                        if (a.startDate < b.startDate) return 1;
                        return 0;
                    }).map((project, index) => this.renderProjectListItem(project, index))}
                    <Divider/>
                    <ListItem button onClick={() => this.addNewProject()} disabled={!this.props.canAddProject}>
                        <ListItemIcon>
                            <Add/>
                        </ListItemIcon>
                        <ListItemText primary={PowerLocalize.get('Profile.Project.AddProject')}/>
                    </ListItem>
                </List>
            </div>
            <div className="col-md-9" id="selected-project">
                <SelectedProject/>
            </div>
        </div>;
    }
}

export const Projects = connect(ProjectsModule.mapStateToProps, ProjectsModule.mapDispatchToProps)(ProjectsModule);

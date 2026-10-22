import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {SelectedProject} from './single-project_module';
import {StringUtils} from '../../../../../utils/StringUtil';
import {Divider, List, useMediaQuery, Paper} from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Add from '@material-ui/icons/Add';
import ChevronRight from '@material-ui/icons/ChevronRight';
import {useHistory, useParams} from 'react-router-dom';
import {Paths} from '../../../../../Paths';
import {PwrButton} from '../../../../general/pwr-button';
import {addNewProject, selectProject} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {ProjectUrlSync} from './project-url-sync';

interface ProjectsProps {
    projects: Array<Project>
    selectedIndex: number;
    canAddProject: boolean;
    hasSelectedProject: boolean;
}

interface ProjectsLocalProps {
    /** Below 992px (Bootstrap md): list or form, never both (master-detail) */
    narrow: boolean;

    showList(): void;
}

interface ProjectsLocalState {
}

interface ProjectsDispatch {
    selectProject(index: number): void;

    addNewProject(): void;
}

class ProjectsModule extends React.Component<ProjectsProps & ProjectsLocalProps & ProjectsDispatch, ProjectsLocalState> {
    private projectRef;

    constructor(props) {
        super(props);
        this.projectRef = React.createRef();
    }

    static mapStateToProps(state: ApplicationState): ProjectsProps {
        return {
            projects: state.profileStore.profile.projects,
            selectedIndex: state.profileStore.selectedProjectIndex,
            canAddProject: !state.profileStore.selectedProject || state.profileStore.selectedProject.id !== null,
            hasSelectedProject: !!state.profileStore.selectedProject
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
        const period = PowerLocalize.getFormatted('Profile.Project.List.Period',
            formatToShortDisplay(project.startDate), formatToShortDisplay(project.endDate));
        return <ListItem className={this.chooseClassName(index)} button key={project.id}
                         onClick={event => this.handleClick(index)}>
            <ListItemText primary={name}
                          secondary={<>
                              <span style={{display: 'block'}}>{period}</span>
                              {client && <span style={{display: 'block'}}>{client}</span>}
                          </>}/>
            {this.props.narrow && <ChevronRight color="action"/>}
        </ListItem>;
    };

    private renderAddProject = () => {
        return <List>
            <ListItem button onClick={() => this.addNewProject()} disabled={!this.props.canAddProject}>
                <ListItemIcon>
                    <Add/>
                </ListItemIcon>
                <ListItemText primary={PowerLocalize.get('Profile.Project.AddProject')}/>
            </ListItem>
        </List>;
    };

    /**
     * Narrow screens: the list or the selected project, each in full width. The URL decides (#42), so the browser's
     * back button returns to the list, and leaving unsaved changes asks first (#44).
     */
    private renderNarrow() {
        if (this.props.hasSelectedProject) {
            return <div className="row">
                <ProjectUrlSync/>
                <div className="col-12 pwr-projects-narrow-pane" id="selected-project">
                    <PwrButton color="primary" variant="text" text={PowerLocalize.get('Profile.Project.BackToList')}
                               onClick={this.props.showList}/>
                    <Paper className="pwr-projects-form-card">
                        <SelectedProject/>
                    </Paper>
                </div>
            </div>;
        }
        return <div className="row">
            <ProjectUrlSync/>
            <div className="col-12 pwr-projects-narrow-pane">
                <Paper>
                    {/* on top, so it is reachable without scrolling past the list */}
                    {this.renderAddProject()}
                    <Divider/>
                    <List component="nav">
                        {this.props.projects.map((project, index) => this.renderProjectListItem(project, index))}
                    </List>
                </Paper>
            </div>
        </div>;
    }

    render() {
        if (!this.props.projects) {
            return <React.Fragment/>;
        }
        if (this.props.narrow) {
            return this.renderNarrow();
        }
        return <div className="row" style={{scrollBehavior: 'smooth'}}>
            <ProjectUrlSync/>
            {/* List and form as two cards (#145), each scrolling on its own (index.css), so toolbar, tabs and
                "add project" stay visible */}
            <div className="col-md-3 pwr-projects-list-pane" ref={this.projectRef}>
                <Paper className="pwr-projects-card">
                    <List component="nav" style={{overflowY: 'auto', overscrollBehavior: 'contain'}}>
                        {/* The store keeps the projects newest first; sorting here would move them away from selectedProjectIndex */}
                        {this.props.projects.map((project, index) => this.renderProjectListItem(project, index))}
                    </List>
                    <Divider/>
                    {this.renderAddProject()}
                </Paper>
            </div>
            <div className="col-md-9 pwr-projects-form-pane" id="selected-project">
                <Paper className="pwr-projects-card pwr-projects-form-card">
                    <SelectedProject/>
                </Paper>
            </div>
        </div>;
    }
}

const ConnectedProjects = connect(ProjectsModule.mapStateToProps, ProjectsModule.mapDispatchToProps)(ProjectsModule);

/** Bootstrap md, as the columns of the desktop layout */
const NARROW = '(max-width: 991.98px)';

export const Projects = () => {
    const narrow = useMediaQuery(NARROW);
    const history = useHistory();
    const {initials} = useParams<{ initials: string }>();
    // a navigation, not an action: PWR_HISTORY.block asks before unsaved changes are left
    const showList = () => history.push(Paths.build(Paths.USER_PROFILE_PROJECTS, {initials}));
    return <ConnectedProjects narrow={narrow} showList={showList}/>;
};

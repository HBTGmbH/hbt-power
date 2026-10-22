import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ThunkDispatch} from 'redux-thunk';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {SelectedProject} from './single-project_module';
import {StringUtils} from '../../../../../utils/StringUtil';
import {Divider, Icon, List, Paper, Typography, useMediaQuery} from '@material-ui/core';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
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
    initials: string;
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

    /** Asks first (makeDeferrable), like deleting other entries */
    deleteProject(initials: string, id: number): void;
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
            hasSelectedProject: !!state.profileStore.selectedProject,
            initials: state.profileStore.consultant.initials,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProjectsDispatch {
        return {
            selectProject: index => dispatch(selectProject(index)),
            addNewProject: () => dispatch(addNewProject()),
            deleteProject: (initials, id) => dispatch(ProfileDataAsyncActionCreator.deleteProject(initials, id)),
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
            {/* Delete as an icon in the list, as with the other entries of the profile (#145); not for a new,
                unsaved project, which "cancel" removes. The click must not select the project. */}
            <ListItemIcon className="pwr-project-list-delete" onClick={event => event.stopPropagation()}>
                {project.id !== null && project.id !== undefined
                    ? <PwrIconButton iconName="delete" tooltip={PowerLocalize.get('Action.Delete')}
                                     onClick={() => this.props.deleteProject(this.props.initials, project.id)}/>
                    : <span/>}
            </ListItemIcon>
            <ListItemText primary={name}
                          secondary={<>
                              <span style={{display: 'block'}}>{period}</span>
                              {client && <span style={{display: 'block'}}>{client}</span>}
                          </>}/>
            {this.props.narrow && <ChevronRight color="action"/>}
        </ListItem>;
    };

    /**
     * Right card without a selection (#145): centred, what to do next, with the button to add a reference
     */
    private renderNothingSelected = () => {
        const hasProjects = this.props.projects.length > 0;
        return <div className="pwr-projects-empty">
            <Icon className="material-icons pwr-projects-empty-icon">work_outline</Icon>
            <Typography color="textSecondary">
                {PowerLocalize.get(hasProjects ? 'Profile.Project.Empty.Select' : 'Profile.Project.Empty.First')}
            </Typography>
            <PwrSpacer/>
            <PwrButton color="primary" variant="contained" text={PowerLocalize.get('Profile.Project.AddProject')}
                       icon={<Add/>} disabled={!this.props.canAddProject} onClick={this.addNewProject}/>
        </div>;
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
                    {this.props.hasSelectedProject ? <SelectedProject/> : this.renderNothingSelected()}
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

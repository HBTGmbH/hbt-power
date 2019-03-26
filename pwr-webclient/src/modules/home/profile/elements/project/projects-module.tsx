import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Project} from '../../../../../model/Project';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ProjectCard} from './project-module';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {ProjectDialogState} from './project-dialog_module';
import {Profile} from '../../../../../model/Profile';
import {Responsive, WidthProvider} from 'react-grid-layout';
import {Comparators} from '../../../../../utils/Comparators';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import Grid from '@material-ui/core/Grid/Grid';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const randomColor = require('randomcolor');

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link Projects.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ProjectsProps {
    /**
     * Reference to all projects.
     */
    projects: Immutable.Map<string, Project>;
    projectRoles: Immutable.Map<string, NameEntity>;
    companies: Immutable.Map<string, NameEntity>;
    profile: Profile;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ProjectsProps} and will then be
 * managed by redux.
 */
interface ProjectsLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ProjectsLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ProjectsDispatch {
    deleteProject(id: string): void;

    saveProject(state: ProjectDialogState): void;

    addProject(): void;
}

class ProjectsModule extends React.Component<ProjectsProps & ProjectsProps & ProjectsDispatch, ProjectsLocalState> {

    private styles = {
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
        },
        gridList: {
            width: 500,
            height: 450,
            overflowY: 'auto',
        },
    };

    static mapStateToProps(state: ApplicationState, localProps: ProjectsProps): ProjectsProps {
        return {
            projects: state.databaseReducer.profile().projects(),
            projectRoles: state.databaseReducer.projectRoles(),
            companies: state.databaseReducer.companies(),
            profile: state.databaseReducer.profile()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ProfileStore>): ProjectsDispatch {
        return {
            deleteProject: function (id: string) {
                dispatch(ProfileActionCreator.deleteProject(id));
            },
            saveProject: function (state: ProjectDialogState) {
                dispatch(ProfileActionCreator.saveProject(state));
            },
            addProject: function () {
                dispatch(ProfileActionCreator.createProject());
            }
        };
    }



    private renderSingleProject = (value: Project, key: string) => {

        return (
            <Grid key={key} item xs={12} sm={6} md={4} spacing={16} style={{height: '35vh',minHeight:'230px'}}>
                <ProjectCard
                    project={value}
                    onSave={this.props.saveProject}
                    onDelete={this.props.deleteProject}
                    companies={this.props.companies}
                    projectRoles={this.props.projectRoles}
                    profile={this.props.profile}
                    backgroundColor={'white'}
                />
            </Grid>);
    };

    private renderProjects = () => {
        let index = 0;
        return this.props.projects
            .sort(Comparators.compareProjects)
            .map((value, key) => this.renderSingleProject(value, key)).toArray();
    };

    render() {
        return (
            <div style={{alignContent: 'center'}}>
                <Grid
                    container
                    spacing={8}
                    justify={'flex-start'}
                    alignItems={'flex-start'}
                >
                    {this.renderProjects()}
                </Grid>
                <div style={{textAlign: 'center'}}>
                    <Tooltip title={PowerLocalize.get('Action.New')}>
                        <IconButton
                            style={{display: 'inline-block'}}
                            className="material-icons"
                            onClick={this.props.addProject}
                        >
                            add
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

/**
 * @see ProjectsModule
 * @author nt
 * @since 08.05.2017
 */
export const Projects: React.ComponentClass<ProjectsLocalProps> = connect(ProjectsModule.mapStateToProps, ProjectsModule.mapDispatchToProps)(ProjectsModule);
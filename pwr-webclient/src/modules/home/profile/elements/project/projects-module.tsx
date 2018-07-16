import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Project} from '../../../../../model/Project';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ProjectCard} from './project-module';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ProjectDialogState} from './project-dialog_module';
import {Profile} from '../../../../../model/Profile';
import {Responsive, WidthProvider} from 'react-grid-layout';
import {Comparators} from '../../../../../utils/Comparators';
import {ApplicationState} from '../../../../../reducers/reducerIndex';

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
            deleteProject: function(id: string) {
                dispatch(ProfileActionCreator.deleteProject(id));
            },
            saveProject: function(state: ProjectDialogState) {
                dispatch(ProfileActionCreator.saveProject(state));
            },
            addProject: function() {
                dispatch(ProfileActionCreator.createProject());
            }
        };
    }

    private renderSingleProject = (value: Project, key: string, index: number) => {
        let x = index * 3 % 12;
        let y = Math.floor(index/3) * 3;
        return (
            <div key={key} data-grid={{x: x, y:y, w: 2.95, h: 3, isDraggable: false}}>
                <ProjectCard
                    project={value}
                    onSave={this.props.saveProject}
                    onDelete={this.props.deleteProject}
                    companies={this.props.companies}
                    projectRoles={this.props.projectRoles}
                    profile={this.props.profile}
                    backgroundColor={"white"}
                />
            </div>);
    };

    private renderProjects = () => {
        let index = 0;
        return this.props.projects
            .sort(Comparators.compareProjects)
            .map((value, key) => this.renderSingleProject(value, key, index++)).toArray()
    };

    render() {
        return (
            <div>
                <ResponsiveReactGridLayout
                    className="layout" breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                                           cols={{lg: 12, md: 9, sm: 6, xs: 3, xxs: 3}}>
                    {this.renderProjects()}
                </ResponsiveReactGridLayout>
                <br/>
                <div style={{textAlign: 'center'}}>
                    <IconButton
                        style={{display:'inline-block'}}
                        className="material-icons"
                        onClick={this.props.addProject}
                        tooltip={PowerLocalize.get('Action.New')}>add</IconButton>
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
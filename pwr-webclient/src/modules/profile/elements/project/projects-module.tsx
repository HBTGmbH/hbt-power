import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {Project} from '../../../../model/Project';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/ProfileActionCreator';
import {ApplicationState, ProfileElementType} from '../../../../Store';
import {ProjectCard} from './project-module';

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
    saveProject(project: Project): void;
}

class ProjectsModule extends React.Component<ProjectsProps & ProjectsProps & ProjectsDispatch, ProjectsLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProjectsProps): ProjectsProps {
        return {
            projects: state.databaseReducer.profile.projects
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<InternalDatabase>): ProjectsDispatch {
        return {
            deleteProject: function(id: string) {
                dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.ProjectEntry));
            },
            saveProject: function(project: Project) {
                dispatch(ProfileActionCreator.saveEntry(project, null,  ProfileElementType.ProjectEntry));
            }
        }
    }

    private renderSingleProject = (value: Project, key: string) => {
        return (<ProjectCard project={value} key={key} onSave={this.props.saveProject} onDelete={this.props.deleteProject}/>)
    };

    render() {
        return (
            <div>
                {this.props.projects.map(this.renderSingleProject).toArray()}
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
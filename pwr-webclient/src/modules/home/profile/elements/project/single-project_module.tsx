import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import * as redux from 'redux';
import {isNullOrUndefined} from 'util';
import {NameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {formatToYear} from '../../../../../utils/DateUtil';
import {StringUtils} from '../../../../../utils/StringUtil';
import {PwrDatePicker} from '../../../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../../../model/DatePickerType';
import {PwrCompanyAutocomplete} from '../../../../general/autocompletes/pwr-company-autocomplete-module';
import {connect} from 'react-redux';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';
import {PwrInputField} from '../../../../general/pwr-input-field';
import {
    cancelEditSelectedProjectAction,
    editSelectedProjectAction,
    setEditingProjectAction
} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';
import {NameEntityType} from '../../../../../reducers/profile-new/profile/model/NameEntityType';
import {PwrProjectRoleAutocomplete} from '../../../../general/autocompletes/pwr-project-role-autocomplete-module';
import {immutablePush, immutableRemove} from '../../../../../utils/ImmutableUtils';
import {SkillSearcher} from '../../../../general/skill-search_module';
import {ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {PwrFormCaption, PwrFormSubCaption, PwrFormSubtitle} from '../../../../general/pwr-typography';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {SkillChip} from '../skills/skill-chip_module';

const chooseClientName = (project: Project) => {
    if (project.client) {
        return project.client.name;
    }
    return '';
};

const chooseBrokerName = (project: Project) => {
    if (project.broker) {
        return project.broker.name;
    }
    return '';
};


interface ProjectProps {
    initials: string;
    editedProject: Project;
    isEditing: boolean;
}


interface ProjectLocalProps {
}

interface ProjectLocalState {
    projectRoleSearchValue: string;
    skillSearchValue: string;
}

interface ProjectDispatch {
    // Non-Persistent Actions
    updateEditingProject(project: Project): void;

    beginEdit();

    cancelEdit();

    // Persistent Actions
    deleteProject(initials: string, id: number): void;

    saveSelectedProject(): void;
}

class Project_module extends React.Component<ProjectProps & ProjectLocalProps & ProjectDispatch, ProjectLocalState> {

    constructor(props) {
        super(props);
        this.state = {
            projectRoleSearchValue: '',
            skillSearchValue: ''
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ProjectLocalProps): ProjectProps {
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        return {
            initials: initials,
            editedProject: state.profileStore.selectedProject,
            isEditing: state.profileStore.isProjectEditing
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProjectDispatch {
        return {
            deleteProject: (initials, id) => dispatch(ProfileDataAsyncActionCreator.deleteProject(initials, id)),
            saveSelectedProject: () => dispatch(ProfileDataAsyncActionCreator.saveSelectedProject()),
            updateEditingProject: (project: Project) => dispatch(setEditingProjectAction(project)),
            beginEdit: () => dispatch(editSelectedProjectAction()),
            cancelEdit: () => dispatch(cancelEditSelectedProjectAction()),
        };
    };

    private deleteButtonPress = () => {
        this.props.deleteProject(this.props.initials, this.project().id);
    };

    private project = (): Project => {
        return this.props.editedProject;
    };

    private title = () => {
        const name = StringUtils.defaultString(this.project().name);
        return `${name} für ${this.client()}`;
    };

    private client = () => {
        return StringUtils.defaultString(nameEntityName(this.project().client));
    };

    private broker = () => {
        return StringUtils.defaultString(nameEntityName(this.project().broker));
    };

    private subtitle = () => {
        const roleNames = this.project().projectRoles
            .map(value => value.name)
            .join(', ');

        const start = !isNullOrUndefined(this.project().startDate) ? formatToYear(this.project().startDate) : '';
        const end = !isNullOrUndefined(this.project().endDate) ? formatToYear(this.project().endDate) : 'Heute';
        return `Tätig als ${roleNames} von ${start} bis ${end}`;
    };


    private isEditDisabled() {
        return !this.isEditEnabled();
    }

    private isEditEnabled() {
        return this.props.isEditing;
    }

    private isDeleteEnabled() {
        return !!this.project().id
    }

    private setName = (name: string) => {
        const project = {...this.project(), name};
        this.props.updateEditingProject(project);
    };

    private setDescription = (description) => {
        const project = {...this.project(), description};
        this.props.updateEditingProject(project);
    };

    private setEndDate = (endDate) => {
        const project = {...this.project(), endDate};
        this.props.updateEditingProject(project);
    };

    private setStartDate = (startDate) => {
        const project = {...this.project(), startDate};
        this.props.updateEditingProject(project);
    };

    private setClientName = (name) => {
        const client = this.setNameEntityName(this.project().client, name);
        const project = {...this.project(), client};
        this.props.updateEditingProject(project);
    };

    private setBrokerName = (name) => {
        const broker = this.setNameEntityName(this.project().broker, name);
        const project = {...this.project(), broker};
        this.props.updateEditingProject(project);
    };

    private setNameEntityName(nameEntity: NameEntity, name: string): NameEntity {
        if (!nameEntity) {
            nameEntity = {name: name, id: null, type: NameEntityType.COMPANY};
        }
        return {...nameEntity, name};
    }

    private addProjectRole = (role: NameEntity) => {
        const projectRoles = immutablePush(role, this.project().projectRoles);
        this.props.updateEditingProject({...this.project(), projectRoles});
    };

    private removeProjectRole = (role: NameEntity) => {
        const projectRoles = immutableRemove(role, this.project().projectRoles);
        this.props.updateEditingProject({...this.project(), projectRoles});
    };

    private beginEdit = () => {
        this.props.beginEdit();
    };

    private cancelEdit = () => {
        this.props.cancelEdit();
    };

    private save = () => {
        this.props.saveSelectedProject();
    };

    private addSkill = (skillName) => {
        const newSkill: ProfileSkill = {id: null, name: skillName, rating: 0};
        const skills = immutablePush(newSkill, this.project().skills);
        this.props.updateEditingProject({...this.project(), skills});
    };

    private removeSkill = (skillName) => {
        const skills = this.project().skills.filter(skill => skill.name === skillName);
        this.props.updateEditingProject({...this.project(), skills});
    };

    private toSkillChip(skill: ProfileSkill) {
        return <SkillChip key={skill.name} className="margin-2px" disabled={this.isEditDisabled()} skill={skill} onDelete={name => this.removeSkill(name)}
                          canChangeRating={false}/>;
    }

    render() {
        if (!this.project()) {
            return <span>No Project Selected</span>;
        }
        return (
            <div>
                <div>
                    <PwrFormCaption>{this.title()}</PwrFormCaption>
                    <PwrFormSubtitle>{this.subtitle()}</PwrFormSubtitle>
                </div>
                <div>
                    <PwrFormSubCaption>General Data</PwrFormSubCaption>
                    <PwrSpacer/>
                    <PwrInputField
                        disabled={this.isEditDisabled()}
                        id="project-title"
                        label="Project Name"
                        onValueChange={this.setName}
                        value={this.project().name}
                    />
                    <PwrSpacer/>
                    <PwrInputField
                        disabled={this.isEditDisabled()}
                        id="project-description"
                        label="Project Description"
                        value={this.project().description}
                        onValueChange={this.setDescription}
                        fullWidth
                        multiline
                        rows={4}
                    />
                    <PwrSpacer/>
                    <PwrDatePicker label="Project Start Date"
                                   disabled={this.isEditDisabled()}
                                   onChange={this.setStartDate}
                                   placeholderDate={this.project().startDate}
                                   type={DatePickerType.MONTH_YEAR}
                    />
                    <PwrDatePicker label="Project End Date"
                                   disabled={this.isEditDisabled()}
                                   onChange={this.setEndDate}
                                   placeholderDate={this.project().endDate}
                                   type={DatePickerType.MONTH_YEAR}
                    />
                    <PwrSpacer/>
                    <PwrProjectRoleAutocomplete fullWidth={true}
                                                multi={true}
                                                disabled={this.isEditDisabled()}
                                                searchTerm={this.state.projectRoleSearchValue}
                                                onChangeRole={role => this.setState({projectRoleSearchValue: role.name})}
                                                onAddRole={role => this.addProjectRole(role)}
                                                onRemoveRole={role => this.removeProjectRole(role)}
                                                label="Project Roles"
                                                items={this.project().projectRoles}>

                    </PwrProjectRoleAutocomplete>
                </div>
                <PwrSpacer/>
                <div>
                    <PwrFormSubCaption>Client</PwrFormSubCaption>
                    <PwrSpacer/>
                    <PwrCompanyAutocomplete fullWidth={true} label="Project Client"
                                            searchTerm={this.client()}
                                            disabled={this.isEditDisabled()}
                                            onSearchChange={this.setClientName}/>
                    <PwrSpacer/>
                    <PwrCompanyAutocomplete fullWidth={true} label="Project Broker"
                                            searchTerm={this.broker()}
                                            disabled={this.isEditDisabled()}
                                            onSearchChange={this.setBrokerName}/>
                </div>
                <PwrSpacer/>
                <div>
                    <PwrFormSubCaption>Skills</PwrFormSubCaption>
                    <SkillSearcher
                        disabled={this.isEditDisabled()}
                        id="SelectedProject.SkillSearcher"
                        label="Add Skill"
                        initialValue={this.state.skillSearchValue}
                        value={this.state.skillSearchValue}
                        onValueChange={skillSearchValue => this.setState({skillSearchValue})}
                        onNewRequest={name => this.addSkill(name)}
                    />
                    <PwrFormSubCaption>Skills in this Project</PwrFormSubCaption>
                    <div className="Pwr-Content-Container">
                        {this.project().skills.map(skill => this.toSkillChip(skill))}
                    </div>

                </div>
                <div>
                    {this.isEditDisabled() && <PwrIconButton iconName={'edit'} tooltip={PowerLocalize.get('Action.Edit')} onClick={this.beginEdit}/>}
                    {this.isEditEnabled() && <PwrIconButton iconName={'save'} tooltip={PowerLocalize.get('Action.Save')} onClick={this.save}/>}
                    {this.isEditEnabled() && <PwrIconButton iconName={'cancel'} tooltip={PowerLocalize.get('Action.Cancel')} onClick={this.cancelEdit}/>}
                    {this.isDeleteEnabled() && <PwrIconButton iconName={'delete'} tooltip={PowerLocalize.get('Action.Delete')} isDeleteButton  onClick={this.deleteButtonPress}/>}
                </div>
            </div>
        );
    }

}

export const SelectedProject: React.ComponentClass<ProjectLocalProps> = connect(Project_module.mapStateToProps, Project_module.mapDispatchToProps)(Project_module);

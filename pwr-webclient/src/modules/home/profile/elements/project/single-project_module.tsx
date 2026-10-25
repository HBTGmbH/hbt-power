import {Project} from '../../../../../reducers/profile-new/profile/model/Project';

import * as React from 'react';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {NameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {PwrFormActions} from '../../../../general/pwr-form-actions';
import {PwrFormSection, PwrRow} from '../../../../general/pwr-form-section';
import {LocalDate} from '../../../../../utils/DateUtil';
import {StringUtils} from '../../../../../utils/StringUtil';
import {PwrDatePicker} from '../../../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../../../model/DatePickerType';
import {connect} from 'react-redux';
import {nameEntityName} from '../../../../../utils/NullSafeUtils';
import {
    cancelEditSelectedProjectAction,
    editSelectedProjectAction,
    setEditingProjectAction
} from '../../../../../reducers/profile-new/profile/actions/ProjectActions';
import {NameEntityType} from '../../../../../reducers/profile-new/profile/model/NameEntityType';
import {PwrProjectRoleAutocomplete} from '../../../../general/autocompletes/pwr-project-role-autocomplete-module';
import {immutableRemove, immutableUnshift} from '../../../../../utils/ImmutableUtils';
import {SkillSearcher} from '../../../../general/skill-search_module';
import {ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {PwrFormSubCaption} from '../../../../general/pwr-typography';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {SkillChange, SkillChip} from '../skills/skill-chip_module';
import Grid from '@material-ui/core/Grid/Grid';
import {SuggestProjectSkills} from '../../../../general/skill/suggest-project-skills';
import {PwrCompanyAutocomplete} from '../../../../general/autocompletes/pwr-company-autocomplete-module';
import {Alerts} from '../../../../../utils/Alerts';
import {ThunkDispatch} from 'redux-thunk';
import {findSkillByName, PROFILE_SKILLS_BY_NAME} from '../../../../../utils/Comparators';
import {LimitedTextField} from '../../../../general/limited-text-field-module';
import {ProjectDescriptionHelp} from './project-description-help';
import {PROJECT_DESCRIPTION_LENGTH, PROJECT_NAME_LENGTH} from '../../../../../model/PwrConstants';

interface ProjectProps {
    initials: string;
    editedProject: Project;
    isEditing: boolean;
    /**
     * Skills of the project as saved, while it is being edited (empty for a new project), otherwise null
     */
    savedSkills: Array<ProfileSkill> | null;
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

    static mapStateToProps(state: ApplicationState): ProjectProps {
        const initials = !!(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        const edited = state.profileStore.selectedProject;
        let savedSkills: Array<ProfileSkill> | null = null;
        if (edited && state.profileStore.isProjectEditing) {
            const saved = state.profileStore.profile.projects.find(project => edited.id !== null && project.id === edited.id);
            savedSkills = saved ? saved.skills : [];
        }
        return {
            initials: initials,
            editedProject: edited,
            isEditing: state.profileStore.isProjectEditing,
            savedSkills
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProjectDispatch {
        return {
            saveSelectedProject: () => dispatch(ProfileDataAsyncActionCreator.saveSelectedProject()),
            updateEditingProject: (project: Project) => dispatch(setEditingProjectAction(project)),
            beginEdit: () => dispatch(editSelectedProjectAction()),
            cancelEdit: () => dispatch(cancelEditSelectedProjectAction()),
        };
    };


    private project = (): Project => {
        return this.props.editedProject;
    };

    private client = () => {
        return StringUtils.defaultString(nameEntityName(this.project().client));
    };

    private broker = () => {
        return StringUtils.defaultString(nameEntityName(this.project().broker));
    };


    private isEditDisabled() {
        return !this.isEditEnabled();
    }

    private isEditEnabled() {
        return this.props.isEditing;
    }


    private setName = (name: string) => {
        const project = {...this.project(), name};
        this.props.updateEditingProject(project);
    };

    private setDescription = (description) => {
        const project = {...this.project(), description};
        this.props.updateEditingProject(project);
    };

    private setEndDate = (endDate: LocalDate | null) => {
        const project = {...this.project(), endDate};
        this.props.updateEditingProject(project);
    };

    private setStartDate = (startDate: LocalDate | null) => {
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

    /**
     * An emptied client or broker is none (#215), not a company without a name
     */
    private setNameEntityName(nameEntity: NameEntity, name: string): NameEntity | null {
        if (!name || name.trim() === '') {
            return null;
        }
        if (!nameEntity) {
            nameEntity = {name: name, id: null, type: NameEntityType.COMPANY};
        }
        return {...nameEntity, name};
    }

    private addProjectRole = (role: NameEntity) => {
        const projectRoles = immutableUnshift(role, this.project().projectRoles);
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

    private addSkill = (skillName: string) => {
        const existing = findSkillByName(this.project().skills, skillName);
        if (existing) {
            this.setState({skillSearchValue: ''});
            Alerts.showInfo(PowerLocalize.getFormatted('Profile.Skills.AlreadyExists', existing.name));
            return;
        }
        const skills = immutableUnshift(this.toProjectSkill(skillName), this.project().skills);
        this.setState({skillSearchValue: ''});
        this.props.updateEditingProject({...this.project(), skills});
    };

    /**
     * A skill removed before saving comes back as it was saved, everything else is new
     */
    private toProjectSkill(skillName: string): ProfileSkill {
        const saved = findSkillByName(this.props.savedSkills || [], skillName);
        return saved || {id: null, name: skillName, rating: 0, versions: []};
    }

    private removeSkill = (skillName: string) => {
        const skills = this.project().skills.filter(skill => skill.name !== skillName);
        this.props.updateEditingProject({...this.project(), ...{skills: skills}});
    };

    private restoreSkill = (skill: ProfileSkill) => {
        this.props.updateEditingProject({...this.project(), skills: immutableUnshift(skill, this.project().skills)});
    };

    private skillChange(skill: ProfileSkill): SkillChange | undefined {
        const savedSkills = this.props.savedSkills;
        if (!savedSkills) {
            return undefined;
        }
        if (!findSkillByName(savedSkills, skill.name)) {
            return SkillChange.ADDED;
        }
        return findSkillByName(this.project().skills, skill.name) ? undefined : SkillChange.REMOVED;
    }

    /**
     * The skills of the project; while editing also the removed ones, so they can be seen and brought back until saving
     */
    private displayedSkills(): Array<ProfileSkill> {
        const removed = (this.props.savedSkills || [])
            .filter(saved => !findSkillByName(this.project().skills, saved.name));
        return [...this.project().skills, ...removed].sort(PROFILE_SKILLS_BY_NAME);
    }

    private toSkillChip(skill: ProfileSkill) {
        return <SkillChip key={skill.name} disabled={this.isEditDisabled()} skill={skill}
                          change={this.skillChange(skill)}
                          onDelete={skill => this.removeSkill(skill.name)}
                          onRestore={this.restoreSkill}
                          canChangeRating={false}/>;
    }

    private handleAddSkills = (skills: string[]) => {
        const projectSkills = [...this.project().skills, ...skills.map(name => this.toProjectSkill(name))];
        this.props.updateEditingProject({...this.project(), ...{skills: projectSkills}});
    };

    render() {
        if (!this.project()) {
            return <span>{PowerLocalize.get('Profile.Project.NoneSelected')}</span>;
        }
        return (
            <div className={this.isEditDisabled() ? 'pwr-read-only' : ''}>
                {/* Spacing scale (#40): fields of a group 16 px apart, sections 32 px. At the top the tight space, so the
                    first field is level with the first project of the list */}
                <PwrSpacer size="tight"/>
                <PwrFormSection first>
                    {/* Maximum length as in the other forms (#141); no counter in read mode */}
                    <LimitedTextField
                        disabled={this.isEditDisabled()}
                        hideProgress={this.isEditDisabled()}
                        id="project-title"
                        label={PowerLocalize.get('Profile.Project.Name')}
                        maxCharacters={PROJECT_NAME_LENGTH}
                        onChange={(_, name) => this.setName(name)}
                        value={this.project().name || ''}
                        fullWidth
                    />
                    <PwrSpacer/>
                    <LimitedTextField
                        disabled={this.isEditDisabled()}
                        hideProgress={this.isEditDisabled()}
                        id="project-description"
                        label={PowerLocalize.get('Profile.Project.Description')}
                        maxCharacters={PROJECT_DESCRIPTION_LENGTH}
                        help={<ProjectDescriptionHelp/>}
                        helpOpenLabel={PowerLocalize.get('ProjectDescriptionHelp.Open')}
                        helpCloseLabel={PowerLocalize.get('ProjectDescriptionHelp.Close')}
                        onChange={(_, description) => this.setDescription(description)}
                        value={this.project().description || ''}
                        fullWidth
                        multiLine
                        rows={4}
                    />
                    <PwrSpacer/>
                    <Grid container spacing={2} justify={'flex-start'}>
                        <Grid item>
                            <PwrDatePicker label={PowerLocalize.get('Profile.Project.StartDate')}
                                           disabled={this.isEditDisabled()}
                                           onChange={this.setStartDate}
                                           value={this.project().startDate}
                                           type={DatePickerType.MONTH_YEAR}
                                           disableOpenEnd
                            />
                        </Grid>
                        <Grid item>
                            <PwrDatePicker label={PowerLocalize.get('Profile.Project.EndDate')}
                                           disabled={this.isEditDisabled()}
                                           onChange={this.setEndDate}
                                           value={this.project().endDate}
                                           type={DatePickerType.MONTH_YEAR}
                            />
                        </Grid>
                    </Grid>
                    <PwrSpacer/>
                    <PwrProjectRoleAutocomplete fullWidth={true}
                                                multi={true}
                                                disabled={this.isEditDisabled()}
                                                searchTerm={this.state.projectRoleSearchValue}
                                                onChangeRole={role => this.setState({projectRoleSearchValue: role.name})}
                                                onAddRole={role => this.addProjectRole(role)}
                                                onRemoveRole={role => this.removeProjectRole(role)}
                                                label={PowerLocalize.get('Profile.Project.ProjectRoles')}
                                                items={this.project().projectRoles}>
                    </PwrProjectRoleAutocomplete>
                </PwrFormSection>
                <PwrFormSection title={PowerLocalize.get('Profile.Project.ClientCaption')}>
                    <PwrCompanyAutocomplete fullWidth={true}
                                            label={PowerLocalize.get('Profile.Project.Client')}
                                            searchTerm={this.client()}
                                            disabled={this.isEditDisabled()}
                                            onSearchChange={this.setClientName}/>
                    <PwrSpacer/>
                    <PwrCompanyAutocomplete fullWidth={true}
                                            label={PowerLocalize.get('Profile.Project.Broker')}
                                            searchTerm={this.broker()}
                                            disabled={this.isEditDisabled()}
                                            onSearchChange={this.setBrokerName}/>
                </PwrFormSection>
                <PwrFormSection title={PowerLocalize.get('Profile.Project.Skills')}>
                    {/* Adding skills only in edit mode (#145): in read mode the section shows just the skills */}
                    {this.isEditEnabled() && <>
                        <SkillSearcher
                            id="SelectedProject.SkillSearcher"
                            fullWidth
                            label={PowerLocalize.get('Profile.Project.AddSkill')}
                            initialValue={this.state.skillSearchValue}
                            value={this.state.skillSearchValue}
                            onValueChange={skillSearchValue => this.setState({skillSearchValue})}
                            onNewRequest={name => this.addSkill(name)}
                        />
                        {/* Suggestions belong to adding skills: right below the search */}
                        <PwrSpacer size="tight"/>
                        <SuggestProjectSkills project={this.project()} onAcceptSkills={this.handleAddSkills}/>
                        <PwrSpacer/>
                        <PwrFormSubCaption>{PowerLocalize.get('Profile.Project.SkillsInProject')}</PwrFormSubCaption>
                        <PwrSpacer size="tight"/>
                    </>}
                    <PwrRow>
                        {this.displayedSkills().map(skill => this.toSkillChip(skill))}
                    </PwrRow>
                </PwrFormSection>
                {/* Deleting lives in the project list, as an icon like the other entries (#145) */}
                <PwrFormActions editing={this.isEditEnabled()}
                                onEdit={this.beginEdit}
                                onSave={this.save}
                                onCancel={this.cancelEdit}/>
                {/* Room below the buttons at the end of the scroll area */}
                <PwrSpacer/>
            </div>
        );
    }

}

export const SelectedProject = connect(Project_module.mapStateToProps, Project_module.mapDispatchToProps)(Project_module);

import * as React from 'react';
import {useEffect, useState} from 'react';
import {Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@material-ui/core';
import {newProfileSkill, ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {APISkillServiceSkill} from '../../../../../model/skill/SkillServiceSkill';
import {APISkillCategory} from '../../../../../model/skill/SkillCategory';
import {SkillServiceClient} from '../../../../../clients/SkillServiceClient';
import {SkillSearcher} from '../../../../general/skill-search_module';
import {StarRating} from '../../../../star-rating_module.';
import {PwrFormSection, PwrRow} from '../../../../general/pwr-form-section';
import {PwrFormActions} from '../../../../general/pwr-form-actions';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {findSkillByName} from '../../../../../utils/Comparators';
import {Alerts} from '../../../../../utils/Alerts';
import {Project} from '../../../../../reducers/profile-new/profile/model/Project';
import {formatSkillUsage, skillUsage} from '../../../../../utils/SkillUsage';
import {SkillProjectsTable} from './skill-projects-table';

interface ProfileSkillDialogProps {
    /** The skill to edit; without one the dialog adds a new skill */
    skill?: ProfileSkill;
    /** The skills of the profile, so that adding one that exists is reported instead of overwriting it */
    profileSkills: Array<ProfileSkill>;
    /** The saved projects of the profile, for the time the skill was used in them (#312) */
    projects: Array<Project>;

    onSave(skill: ProfileSkill): void;

    onClose(): void;
}

const NAME_FIELD_ID = 'pwr-profile-skill-name';

/** How long typing pauses before the skill tree is asked for the skill */
const LOOKUP_DELAY_MS = 300;

/** The categories of a skill from the top of the tree down to the skill */
const categoryPath = (category: APISkillCategory): string => {
    const names: Array<string> = [];
    for (let current = category; current; current = current.category) {
        names.unshift(current.qualifier);
    }
    return names.join(' › ');
};

const isRated = (rating: number) => rating >= 1 && rating <= 5;

/**
 * Adds a skill to the profile or edits one of its skills (#184): name (only when adding), category, rating and
 * versions. Nothing is saved before the main action; a new version is created in the skill tree only then.
 */
export const ProfileSkillDialog = (props: ProfileSkillDialogProps) => {
    const adding = !props.skill;
    const [name, setName] = useState(adding ? '' : props.skill.name);
    const [rating, setRating] = useState(adding ? 0 : props.skill.rating);
    const [selectedVersions, setSelectedVersions] = useState<Array<string>>(adding ? [] : [...props.skill.versions]);
    // Versions entered here that the skill tree doesn't know yet
    const [newVersions, setNewVersions] = useState<Array<string>>([]);
    const [newVersionText, setNewVersionText] = useState('');
    // undefined while unknown, null if the skill tree doesn't know the skill
    const [serviceSkill, setServiceSkill] = useState<APISkillServiceSkill | null | undefined>(undefined);
    const [saving, setSaving] = useState(false);
    const [projectsShown, setProjectsShown] = useState(false);

    const trimmedName = name.trim();

    useEffect(() => {
        setServiceSkill(undefined);
        if (!trimmedName) {
            return undefined;
        }
        let current = true;
        const timeout = setTimeout(() => {
            SkillServiceClient.instance().findSkillByNameQuietly(trimmedName)
                .then(skill => current && setServiceSkill(skill))
                .catch(() => current && setServiceSkill(null));
        }, adding ? LOOKUP_DELAY_MS : 0);
        return () => {
            current = false;
            clearTimeout(timeout);
        };
    }, [trimmedName, adding]);

    const knownVersions = serviceSkill ? serviceSkill.versions : [];
    const versions = Array.from(new Set([...knownVersions, ...newVersions, ...selectedVersions]))
        .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

    const toggleVersion = (version: string) => {
        setSelectedVersions(selectedVersions.includes(version)
            ? selectedVersions.filter(selected => selected !== version)
            : [...selectedVersions, version]);
    };

    const addVersion = () => {
        const version = newVersionText.trim();
        if (!version) {
            return;
        }
        if (!versions.includes(version)) {
            setNewVersions([...newVersions, version]);
        }
        if (!selectedVersions.includes(version)) {
            setSelectedVersions([...selectedVersions, version]);
        }
        setNewVersionText('');
    };

    const canSave = !!trimmedName && isRated(rating) && !saving;

    /** The skill in the skill tree, put into "Other" first if the tree doesn't know it yet */
    const skillInTree = async (): Promise<APISkillServiceSkill> => {
        if (serviceSkill) {
            return serviceSkill;
        }
        await SkillServiceClient.instance().categorizeSkill(trimmedName);
        return SkillServiceClient.instance().findSkillByNameQuietly(trimmedName);
    };

    const save = async () => {
        if (!canSave) {
            return;
        }
        const existing = adding ? findSkillByName(props.profileSkills, trimmedName) : undefined;
        if (existing) {
            // Saving it would overwrite rating and versions of the existing skill
            Alerts.showInfo(PowerLocalize.getFormatted('Profile.Skills.AlreadyExists', existing.name));
            return;
        }
        // A version typed but not added yet counts too, it would be lost otherwise
        const pendingVersion = newVersionText.trim();
        const chosenVersions = pendingVersion && !selectedVersions.includes(pendingVersion)
            ? [...selectedVersions, pendingVersion] : selectedVersions;
        const versionsToCreate = chosenVersions
            .filter(version => newVersions.includes(version) || (version === pendingVersion && !versions.includes(version)));
        setSaving(true);
        try {
            if (versionsToCreate.length > 0) {
                const skill = await skillInTree();
                for (const version of versionsToCreate) {
                    await SkillServiceClient.instance().addVersion(skill.id, version);
                }
            }
            props.onSave(adding
                ? newProfileSkill(trimmedName, rating, chosenVersions)
                : {...props.skill, rating: rating, versions: chosenVersions});
            props.onClose();
        } catch (error) {
            // The client has shown the error; the dialog stays open with what was entered
            setSaving(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        // Not when the suggestion list took the Enter to pick a skill, nor on buttons and chips, which Enter clicks
        if (event.key === 'Enter' && !event.defaultPrevented && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            save();
        }
    };

    const handleNewVersionKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            addVersion();
        }
    };

    const category = () => {
        if (serviceSkill === undefined) {
            return null;
        }
        const text = serviceSkill
            ? PowerLocalize.getFormatted('Profile.Skills.CategoryTemplate', categoryPath(serviceSkill.category))
            : PowerLocalize.get('Profile.Skills.Dialog.NewSkill');
        return <Typography variant="body2" color="textSecondary">{text}</Typography>;
    };

    const usage = adding ? undefined : skillUsage(props.skill.name, props.projects);

    // On the paper: onKeyDown on the dialog itself replaces the one of the modal, which closes it on Escape
    return <Dialog open onClose={props.onClose} PaperProps={{onKeyDown: handleKeyDown}} fullWidth maxWidth="sm"
                   TransitionProps={{onEntered: () => adding && document.getElementById(NAME_FIELD_ID + '_inputField')?.focus()}}>
        <DialogTitle>{adding ? PowerLocalize.get('Profile.Skills.Dialog.AddTitle') : props.skill.name}</DialogTitle>
        <DialogContent>
            {adding && <>
                <SkillSearcher id={NAME_FIELD_ID} label={PowerLocalize.get('Skill.Singular')} fullWidth
                               resetOnRequest={false} onValueChange={setName}/>
                {trimmedName && <PwrSpacer size="tight"/>}
            </>}
            {trimmedName && category()}
            {usage && <PwrFormSection title={PowerLocalize.getFormatted('Profile.Skills.Dialog.Projects', usage.projects.length)}>
                <PwrRow>
                    <Typography variant="body2">{formatSkillUsage(usage)}</Typography>
                    <PwrIconButton iconName={projectsShown ? 'expand_less' : 'expand_more'}
                                   tooltip={PowerLocalize.get(projectsShown ? 'Profile.Skills.Projects.Hide' : 'Profile.Skills.Projects.Show')}
                                   disabled={usage.projects.length === 0} onClick={() => setProjectsShown(!projectsShown)}/>
                </PwrRow>
                <Collapse in={projectsShown}>
                    <PwrSpacer size="tight"/>
                    <SkillProjectsTable skillName={props.skill.name} usage={usage}/>
                </Collapse>
            </PwrFormSection>}
            <PwrFormSection title={PowerLocalize.get('Profile.Skills.Dialog.Rating')}>
                <StarRating rating={rating} onRatingChange={setRating}/>
            </PwrFormSection>
            <PwrFormSection title={PowerLocalize.get('Profile.Skills.Dialog.Versions')}>
                {versions.length > 0 && <>
                    <PwrRow>
                        {versions.map(version =>
                            <Chip key={version} label={version} clickable
                                  color={selectedVersions.includes(version) ? 'primary' : 'default'}
                                  onClick={() => toggleVersion(version)}/>)}
                    </PwrRow>
                    <PwrSpacer/>
                </>}
                <PwrRow>
                    <TextField label={PowerLocalize.get('Version.New')} value={newVersionText}
                               onChange={event => setNewVersionText(event.target.value)}
                               onKeyDown={handleNewVersionKeyDown}/>
                    <PwrIconButton iconName="add" tooltip={PowerLocalize.get('Profile.Skills.Dialog.AddVersion')}
                                   disabled={!newVersionText.trim()} onClick={addVersion}/>
                </PwrRow>
            </PwrFormSection>
        </DialogContent>
        <DialogActions>
            <PwrFormActions editing noSpace
                            saveText={adding ? PowerLocalize.get('Action.Add') : undefined}
                            saveIcon={adding ? 'add' : undefined}
                            saveDisabled={!canSave} onSave={save} onCancel={props.onClose}/>
        </DialogActions>
    </Dialog>;
};

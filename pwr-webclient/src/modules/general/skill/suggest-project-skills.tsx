import * as React from 'react';
import {Checkbox, Dialog, Icon, ListItemSecondaryAction, Tooltip} from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import {PwrButton} from '../pwr-button';
import {PwrFormActions} from '../pwr-form-actions';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import {Project} from '../../../reducers/profile-new/profile/model/Project';
import {SuggestionServiceClient} from '../../../reducers/suggestions/client/SuggestionServiceClient';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {compareNames} from '../../../utils/Comparators';

interface SuggestProjectSkillsProps {
    project: Project;

    onAcceptSkills?(acceptedSkills: string[]): void;
}

interface SuggestProjectSkillsState {
    dialogOpen: boolean;
    suggestedSkills: string[];
    selectedSkills: string[];
    /** False until the first answer */
    loaded: boolean;
}

/**
 * What the recommendation depends on (ProfileService: other recent projects with the same client and similar roles,
 * without the skills the project has already)
 */
function recommendationKey(project: Project): string {
    const client = project.client ? project.client.name : '';
    const roles = (project.projectRoles || []).map(role => role.name).sort().join('|');
    const skills = (project.skills || []).map(skill => skill.name).sort().join('|');
    return [client, roles, skills, project.startDate, project.endDate].join('#');
}

const RELOAD_DELAY_MS = 400;

export class SuggestProjectSkills extends React.Component<SuggestProjectSkillsProps, SuggestProjectSkillsState> {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            suggestedSkills: [],
            selectedSkills: [],
            loaded: false
        };
    }

    private reloadTimer: ReturnType<typeof setTimeout> | null = null;
    private unmounted = false;

    componentDidMount() {
        this.getRecommendedSkills();
    }

    componentDidUpdate(prevProps: SuggestProjectSkillsProps) {
        // Client, roles, period and skills change while typing: load once the input rests
        if (recommendationKey(prevProps.project) !== recommendationKey(this.props.project)) {
            if (this.reloadTimer) {
                clearTimeout(this.reloadTimer);
            }
            this.reloadTimer = setTimeout(this.getRecommendedSkills, RELOAD_DELAY_MS);
        }
    }

    componentWillUnmount() {
        this.unmounted = true;
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
        }
    }

    openDialog = () => {
        this.setState({
            dialogOpen: true,
            selectedSkills: []
        });
    };

    closeDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    getRecommendedSkills = () => {
        this.reloadTimer = null;
        const key = recommendationKey(this.props.project);
        SuggestionServiceClient.instance().getSkillsRecommendation(this.props.project)
            .then(skills => skills.map(s => s.name).sort(compareNames))
            .catch(error => {
                console.error('Skill suggestions not available', error);
                return [] as string[];
            })
            .then(skillNames => {
                // An answer to an older state of the project is dropped, a newer request is on its way
                if (!this.unmounted && key === recommendationKey(this.props.project)) {
                    this.setState({suggestedSkills: skillNames, loaded: true});
                }
            });
    };


    acceptSkills = () => {
        this.props.onAcceptSkills([...this.state.selectedSkills]);
        this.closeDialog();
    };

    isSelected(skill: string) {
        return this.state.selectedSkills.find(value => value === skill);
    }


    private handleSkillToggle = (event, skill: string) => {
        let selectedBeforeHandling = this.isSelected(skill)
        ;
        if (!selectedBeforeHandling) {
            const selectedSkills = [...this.state.selectedSkills, skill];
            this.setState({selectedSkills});
        } else {
            const selectedSkills = this.state.selectedSkills.filter(value => value !== skill);
            this.setState({selectedSkills});
        }

        event.target.checked = !selectedBeforeHandling;
    };

    render() {
        return (<div>
            {/* A help for adding skills: a text button, so Save stays the only highlighted action of the form (#41).
                Disabled until loaded and without suggestions; the span lets the tooltip work on a disabled button */}
            <Tooltip title={this.state.loaded && this.state.suggestedSkills.length === 0
                ? PowerLocalize.get('Profile.Project.NoSkillSuggestions') : ''}>
                <span>
                    <PwrButton color="primary"
                               text={this.state.loaded
                                   ? PowerLocalize.getFormatted('Profile.Project.SuggestSkillsCount', this.state.suggestedSkills.length)
                                   : PowerLocalize.get('Profile.Project.SuggestSkills')}
                               icon={<Icon className="material-icons">lightbulb</Icon>}
                               disabled={!this.state.loaded || this.state.suggestedSkills.length === 0}
                               onClick={this.openDialog}/>
                </span>
            </Tooltip>
            <Dialog open={this.state.dialogOpen} onClose={this.closeDialog}>
                <DialogTitle>{PowerLocalize.get('Profile.Project.SkillSugestions')}</DialogTitle>
                <DialogContent>
                    <List>{
                        this.state.suggestedSkills.map((skill, index) => <div key={index}>
                            <ListItem>
                                {skill}
                                <ListItemSecondaryAction>
                                    <Checkbox
                                        onChange={(event, ignored) => this.handleSkillToggle(event, skill)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider/>
                        </div>)
                    }</List>
                </DialogContent>
                <DialogActions>
                    {/* Takes the selected skills into the form, Save in the form stores them; the button bar of the forms (#41) */}
                    <PwrFormActions editing noSpace
                                    saveText={PowerLocalize.get('Action.Apply')} saveIcon={'playlist_add'}
                                    saveDisabled={this.state.selectedSkills.length === 0}
                                    onSave={this.acceptSkills}
                                    onCancel={this.closeDialog}/>
                </DialogActions>
            </Dialog>
        </div>);
    }
}

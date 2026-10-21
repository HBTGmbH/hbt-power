import * as React from 'react';
import {Checkbox, Dialog, Icon, ListItemSecondaryAction} from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import {PwrButton} from '../pwr-button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
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
}

export class SuggestProjectSkills extends React.Component<SuggestProjectSkillsProps, SuggestProjectSkillsState> {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            suggestedSkills: [],
            selectedSkills: []
        };
    }

    openDialog = () => {
        this.setState({
            dialogOpen: true
        });
        this.getRecommendedSkills();
    };

    closeDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    getRecommendedSkills = () => {
        SuggestionServiceClient.instance().getSkillsRecommendation(this.props.project).then((skill) => {
            const skillNames = skill.map(s => s.name).sort(compareNames);
            this.setState({suggestedSkills: skillNames, selectedSkills: []});
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
            {/* A help for adding skills: a text button, so Save stays the only highlighted action of the form (#41) */}
            <PwrButton color="primary" text={PowerLocalize.get('Profile.Project.SuggestSkills')}
                       icon={<Icon className="material-icons">lightbulb</Icon>} onClick={this.openDialog}/>
            <Dialog open={this.state.dialogOpen} onClose={this.closeDialog}>
                <DialogTitle>{PowerLocalize.get('Profile.Project.SkillSugestions')}</DialogTitle>
                <DialogContent>
                    {this.state.suggestedSkills.length === 0 &&
                    <Typography color="textSecondary">{PowerLocalize.get('Profile.Project.NoSkillSuggestions')}</Typography>}
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
                    <PwrButton color="primary" text={PowerLocalize.get('Action.Cancel')} onClick={this.closeDialog}/>
                    {/* Takes the selected skills into the form; Save in the form stores them */}
                    <PwrButton variant="contained" color="primary" text={PowerLocalize.get('Action.Apply')}
                               onClick={this.acceptSkills}/>
                </DialogActions>
            </Dialog>
        </div>);
    }
}

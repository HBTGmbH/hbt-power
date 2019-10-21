import * as React from 'react';
import {Checkbox, Dialog, ListItemSecondaryAction} from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import {Project} from '../../../reducers/profile-new/profile/model/Project';
import {SuggestionServiceClient} from '../../../reducers/suggestions/client/SuggestionServiceClient';

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
    constructor(props){
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
        })
        this.getRecommendedSkills();
    }

    closeDialog = () => {
        this.setState({
            dialogOpen: false
        })
    }

    getRecommendedSkills = () => {
        SuggestionServiceClient.instance().getSkillsRecommendation(this.props.project).then((skill)=> {
            const skillNames = skill.map(s => s.name);
            this.setState({suggestedSkills: skillNames, selectedSkills: []})
        });
    };


    acceptSkills = () => {
        this.props.onAcceptSkills([...this.state.selectedSkills]);
        this.closeDialog();
    }

    isSelected(skill: string) {
        return this.state.selectedSkills.find(value => value === skill);
    }


    private handleSkillToggle = (skill: string, isChecked: boolean) => {
        if (isChecked) {
            const selectedSkills = [...this.state.selectedSkills, skill];
            this.setState({selectedSkills});
        }
        else {
            const selectedSkills = this.state.selectedSkills.filter(value => value !== skill);
            this.setState({selectedSkills});
        }
    };

    render() {
        return (<div>
            <Button variant="contained" color="primary" onClick={this.openDialog}>
                anzeigen
            </Button>
            <Dialog open={this.state.dialogOpen} onClose={this.closeDialog}>
                <DialogTitle>Skill Suggestion</DialogTitle>
                <DialogContent>
                    <List>{
                        this.state.suggestedSkills.map(skill => <>
                            <ListItem>
                                <ListItemSecondaryAction>
                                    <Checkbox checked={this.isSelected(skill)}
                                              onChange={(ignored, isChecked) => this.handleSkillToggle(skill, isChecked)}
                                    />
                                </ListItemSecondaryAction>
                                {skill}
                            </ListItem>
                            <Divider/>
                            </>)
                    }</List>
                </DialogContent>
                <DialogActions>
                <Button variant="contained" onClick={this.closeDialog}>
                    Schließen
                </Button>
                <Button variant="contained" color="primary" onClick={this.acceptSkills}>
                    Übernehmen
                </Button>
                </DialogActions>
            </Dialog>
        </div>);
    }
}

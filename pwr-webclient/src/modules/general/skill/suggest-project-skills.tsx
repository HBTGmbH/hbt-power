import * as React from 'react';
import {Dialog} from '@material-ui/core';
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
    onAcceptSkill?(acceptedSkill: string): void;
}

interface SuggestProjectSkillsState {
    dialogOpen: boolean;
    suggestedSkills: string[];


}

export class SuggestProjectSkills extends React.Component<SuggestProjectSkillsProps, SuggestProjectSkillsState> {
    constructor(props){
        super(props);
        this.state = {
            dialogOpen: false,
            suggestedSkills: []
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
            this.setState({suggestedSkills: skillNames})
        });
    };


    handleSelectSkill = (skillName) => {
        if (this.props.onAcceptSkill) {
            this.props.onAcceptSkill(skillName);
            this.closeDialog();
        }
    };

    render() {
        return (<div>
            <Button variant="contained" color="primary" onClick={this.openDialog}>
                Show Suggestions
            </Button>
            <Dialog open={this.state.dialogOpen} onClose={this.closeDialog}>
                <DialogTitle>Skill Suggestion</DialogTitle>
                <DialogContent>
                    <List>{
                        this.state.suggestedSkills.map(skill => <>
                            <ListItem onClick={ignored => this.handleSelectSkill(skill)}>  {skill} </ListItem><Divider/>
                            </>)
                    }</List>
                </DialogContent>
                <DialogActions>
                <Button variant="contained" color="primary" onClick={this.closeDialog}>
                    Close
                </Button>
                </DialogActions>
            </Dialog>
        </div>);
    }
}

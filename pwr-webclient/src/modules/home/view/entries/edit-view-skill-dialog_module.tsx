import * as React from 'react';
import {Checkbox, Dialog, DialogContent, DialogTitle} from '@material-ui/core';
import {ViewSkill} from '../../../../model/view/ViewSkill';
import {isNullOrUndefined} from 'util';
import {ViewProfile} from '../../../../model/view/ViewProfile';
import {ViewCategory} from '../../../../model/view/ViewCategory';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import {PwrSpacer} from '../../../general/pwr-spacer_module';

interface EditViewSkillDialogProps {
    open: boolean;
    viewProfile: ViewProfile;
    skill: ViewSkill;

    onClose(): void;

    onSetDisplayCategory(skillName: string, newDisplayCategoryName: string): void;
}

interface EditViewSkillDialogState {
    parents: Array<ViewCategory>;
}

export class EditViewSkillDialog extends React.Component<EditViewSkillDialogProps, EditViewSkillDialogState> {

    constructor(props: EditViewSkillDialogProps) {
        super(props);
        this.state = {
            parents: EditViewSkillDialog.getParents(this.props.viewProfile, this.props.skill.name)
        };
    }

    private static getParents = (viewProfile: ViewProfile, skillName: string) => {
        let res: Array<ViewCategory> = [];
        let currentCategory = viewProfile.getCategoryForSkill(skillName);
        while (!isNullOrUndefined(currentCategory)) {
            res.push(currentCategory);
            currentCategory = viewProfile.getCategoryForCategory(currentCategory.name);
        }
        res.pop(); // Remove the root
        return res;
    };

    private isDisplayCategoryOf = (categoryName: string) => {
        return this.props.viewProfile.getDisplayForSkill(this.props.skill.name).name === categoryName;
    };

    private renderParents = () => {
        return this.state.parents.map(parent =>
            <div key={parent.name}>
                <span className="bold-mui" style={{marginLeft: '40px'}}>|</span><br/>
                <FormControlLabel label={parent.name} control={<Checkbox
                    color={'primary'}
                    checked={this.isDisplayCategoryOf(parent.name)}
                    onChange={() => this.props.onSetDisplayCategory(this.props.skill.name, parent.name)}
                />}/>
            </div>);
    };

    render() {
        if (!isNullOrUndefined(this.props.skill)) {
            return <Dialog open={this.props.open}
                           onClose={this.props.onClose}
                           fullWidth={true}
            >
                <DialogTitle>{"Display Category for " + this.props.skill.name}</DialogTitle>
                <DialogContent>
                    Current Category Tree (Selected is display)
                    <PwrSpacer double/>
                    <span className="bold-mui" style={{marginLeft: '40px'}}>{this.props.skill.name}</span>
                    {this.renderParents()}
                </DialogContent>
            </Dialog>;
        } else {
            return null;
        }

    }
}

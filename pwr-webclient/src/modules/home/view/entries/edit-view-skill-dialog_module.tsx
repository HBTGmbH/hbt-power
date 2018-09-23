import * as React from 'react';
import {Checkbox, Dialog} from '@material-ui/core';
import {ViewSkill} from '../../../../model/view/ViewSkill';
import {isNullOrUndefined} from 'util';
import {ViewProfile} from '../../../../model/view/ViewProfile';
import {ViewCategory} from '../../../../model/view/ViewCategory';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';

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
        }
    }

    private static getParents = (viewProfile: ViewProfile, skillName: string) => {
        let res: Array<ViewCategory> = [];
        let currentCategory = viewProfile.getCategoryForSkill(skillName);
        while(!isNullOrUndefined(currentCategory)) {
            res.push(currentCategory);
            currentCategory = viewProfile.getCategoryForCategory(currentCategory.name);
        }
        res.pop(); // Remove the root
        return res;
    };

    private isDisplayCategoryOf = (categoryName: string) => {
        console.log(" this.props.viewProfile.getDisplayForSkill(this.props.skill.name).name === categoryName",  this.props.viewProfile.getDisplayForSkill(this.props.skill.name).name === categoryName);
        return this.props.viewProfile.getDisplayForSkill(this.props.skill.name).name === categoryName;
    };

    private renderParents = () => {
        return this.state.parents.map(parent =>
            <div key={parent.name}>
                <span className="bold-mui" style={{marginLeft: "40px"}}>|</span>
                <FormControlLabel label={parent.name} control={<Checkbox
                    checked={this.isDisplayCategoryOf(parent.name)}
                    onChange={()=>this.props.onSetDisplayCategory(this.props.skill.name, parent.name)}
                />} />

            </div>)
    };

    render() {
        if(!isNullOrUndefined(this.props.skill)) {
            return (<Dialog
                title={"Display Category for " + this.props.skill.name}
                open={this.props.open}
                onClose={this.props.onClose}
            >
                Current Category Tree (Selected is display) <br/>
                <span className="bold-mui" style={{marginLeft: "40px"}}>{this.props.skill.name}</span>
                {this.renderParents()}
            </Dialog>);
        } else {
            return null;
        }

    }
}

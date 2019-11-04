import * as React from 'react';
import {Checkbox, Dialog, DialogContent, DialogTitle} from '@material-ui/core';
import {ViewSkill} from '../../../../model/view/ViewSkill';
import {isNullOrUndefined} from 'util';
import {ViewProfile} from '../../../../model/view/ViewProfile';
import {ViewCategory} from '../../../../model/view/ViewCategory';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import {PwrSpacer} from '../../../general/pwr-spacer_module';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {ViewProfileActionCreator} from '../../../../reducers/view/ViewProfileActionCreator';
import {connect} from 'react-redux';

interface EditViewSkillDialogProps {
    parents: Array<ViewCategory>;
}

interface EditViewSkillDialogLocalProps {
    open: boolean;
    viewProfile: ViewProfile;
    skill: ViewSkill;

    onClose(): void;
}

interface EditViewSkillDialogDispatch {
    setDisplayCategory(id: string, skillName: string, newDisplayCategoryName: string): void;

    getParentCategories(skill: ViewSkill): void;
}

interface EditViewSkillDialogState {

}

export class EditViewSkillDialogModule extends React.Component<EditViewSkillDialogProps & EditViewSkillDialogLocalProps & EditViewSkillDialogDispatch, EditViewSkillDialogState> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    static mapStateToProps(state: ApplicationState, localProps: EditViewSkillDialogLocalProps): EditViewSkillDialogProps {
        let parentMap = state.viewProfileSlice.parentsForSkill();
        let array: ViewCategory[] = [];
        if (parentMap != null) {
            parentMap.forEach((value, key) => array[key] = value);
        }
        return {
            parents: array,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): EditViewSkillDialogDispatch {
        return {
            setDisplayCategory: (id, skillName, newDisplayCategoryName) => dispatch(ViewProfileActionCreator.AsyncSetDisplayCategory(id, skillName, newDisplayCategoryName)),
            getParentCategories: (skill) => dispatch(ViewProfileActionCreator.AsyncGetParentCategories(skill)),
        };
    }

    private isDisplayCategoryOf = (categoryName: string) => {
        let cat: ViewCategory = this.props.viewProfile.getDisplayForSkill(this.props.skill.name);
        return !!cat && cat.name === categoryName;
    };

    componentDidMount(): void {
        // get Parents
        this.props.getParentCategories(this.props.skill);
    }

    private setDisplayCategory = (parent: ViewCategory) => {
        this.props.setDisplayCategory(this.props.viewProfile.id, this.props.skill.name, parent.name);
        this.props.onClose();
    };

    private renderParents = () => {
        return this.props.parents.map(parent =>
            <div key={parent.name}>
                <span className="bold-mui" style={{marginLeft: '40px'}}>|</span><br/>
                <FormControlLabel label={parent.name} control={<Checkbox
                    color={'primary'}
                    checked={this.isDisplayCategoryOf(parent.name)}
                    onChange={() => this.setDisplayCategory(parent)}
                />}/>
            </div>);
    };

    render() {
        if (!isNullOrUndefined(this.props.skill)) {
            return <Dialog open={this.props.open}
                           onClose={this.props.onClose}
                           fullWidth={true}
            >
                <DialogTitle>{'Display Category for ' + this.props.skill.name}</DialogTitle>
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

export const EditViewSkillDialog: React.ComponentClass<EditViewSkillDialogLocalProps> = connect(EditViewSkillDialogModule.mapStateToProps, EditViewSkillDialogModule.mapDispatchToProps)(EditViewSkillDialogModule);

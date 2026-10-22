import * as React from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Icon, Radio, RadioGroup, Typography} from '@material-ui/core';
import {ViewSkill} from '../../../../model/view/ViewSkill';
import {ViewProfile} from '../../../../model/view/ViewProfile';
import {ViewCategory} from '../../../../model/view/ViewCategory';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import {PwrFormActions} from '../../../general/pwr-form-actions';
import {PwrSpacer} from '../../../general/pwr-spacer_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {ViewProfileActionCreator} from '../../../../reducers/view/ViewProfileActionCreator';
import {connect} from 'react-redux';
import {ThunkDispatch} from 'redux-thunk';

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
    /** Name of the chosen category, the current display category at first */
    selected: string;
}

/**
 * Choice of the display category of a skill (#161): its categories in the order of the skill tree, from the top one
 * down to the skill, each level indented and joined to the one above; taken over with Übernehmen
 */
export class EditViewSkillDialogModule extends React.Component<EditViewSkillDialogProps & EditViewSkillDialogLocalProps & EditViewSkillDialogDispatch, EditViewSkillDialogState> {

    constructor(props) {
        super(props);
        this.state = {
            selected: this.currentDisplayCategory(),
        };
    }

    static mapStateToProps(state: ApplicationState): EditViewSkillDialogProps {
        let parentMap = state.viewProfileSlice.parentsForSkill;
        let array: ViewCategory[] = [];
        if (parentMap != null) {
            parentMap.forEach((value, key) => array[key] = value);
        }
        return {
            parents: array,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): EditViewSkillDialogDispatch {
        return {
            setDisplayCategory: (id, skillName, newDisplayCategoryName) => dispatch(ViewProfileActionCreator.AsyncSetDisplayCategory(id, skillName, newDisplayCategoryName)),
            getParentCategories: (skill) => dispatch(ViewProfileActionCreator.AsyncGetParentCategories(skill)),
        };
    }

    private currentDisplayCategory(): string {
        const category: ViewCategory = this.props.viewProfile.getDisplayForSkill(this.props.skill.name);
        return category ? category.name : null;
    }

    componentDidMount(): void {
        this.props.getParentCategories(this.props.skill);
    }

    private apply = () => {
        this.props.setDisplayCategory(this.props.viewProfile.id, this.props.skill.name, this.state.selected);
        this.props.onClose();
    };

    /** The level of the tree, its indentation (index.css) */
    private levelStyle(depth: number): React.CSSProperties {
        return {['--pwr-depth' as any]: depth};
    }

    render() {
        if (!this.props.skill) {
            return null;
        }
        // The service lists the categories from the skill upwards; the tree reads from the top down
        const levels = [...this.props.parents].reverse();
        const title = PowerLocalize.getFormatted('ViewProfile.SkillCategory.Title', this.props.skill.name);
        return <Dialog open={this.props.open} onClose={this.props.onClose} fullWidth={true} maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary">
                    {PowerLocalize.get('ViewProfile.SkillCategory.Description')}
                </Typography>
                <PwrSpacer/>
                <RadioGroup className="pwr-category-tree" aria-label={title} value={this.state.selected || ''}
                            onChange={(e, value) => this.setState({selected: value})}>
                    {levels.map((category, depth) =>
                        <div key={category.name} style={this.levelStyle(depth)}
                             className={'pwr-category-level' + (category.name === this.state.selected ? ' pwr-category-level-selected' : '')}>
                            <FormControlLabel className="pwr-category-level-label" value={category.name}
                                              control={<Radio color="primary" size="small"/>}
                                              label={category.name}/>
                        </div>)}
                    <div style={this.levelStyle(levels.length)} className="pwr-category-level pwr-category-level-skill">
                        <span className="pwr-category-skill-marker">
                            <Icon className="material-icons" fontSize="small">label</Icon>
                        </span>
                        <Typography variant="body2" component="span">{this.props.skill.name}</Typography>
                    </div>
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <PwrFormActions editing noSpace
                                saveText={PowerLocalize.get('Action.Apply')} saveIcon="check"
                                saveDisabled={!this.state.selected || this.state.selected === this.currentDisplayCategory()}
                                onSave={this.apply} onCancel={this.props.onClose}/>
            </DialogActions>
        </Dialog>;
    }
}

export const EditViewSkillDialog: React.ComponentClass<EditViewSkillDialogLocalProps> = connect(EditViewSkillDialogModule.mapStateToProps, EditViewSkillDialogModule.mapDispatchToProps)(EditViewSkillDialogModule) as any;

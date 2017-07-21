import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../../Store';
import {AddSkillStep} from '../../../../../model/skill/AddSkillStep';
import {
    Dialog,
    Divider,
    IconButton,
    RadioButton,
    RadioButtonGroup,
    RaisedButton,
    RefreshIndicator,
    Step,
    StepLabel
} from 'material-ui';
import {Stepper} from 'material-ui/Stepper';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {StarRating} from '../../../../star-rating_module.';
import {SkillSearcher} from '../../../../general/skill-search_module';
import {UnCategorizedSkillChoice} from '../../../../../model/skill/UncategorizedSkillChoice';
import {LimitedTextField} from '../../../../general/limited-text-field-module.';


interface AddSkillDialogProps {
    addSkillStep: AddSkillStep
    skillName: string;
    skillRating: number;
    categoryString: string;
    currentChoice: UnCategorizedSkillChoice;
    skillComment: string;
    addSkillError: string | undefined | null;

}

interface AddSkillDialogLocalProps {

}

interface AddSkillDialogLocalState {

}

interface AddSkillDialogDispatch {
    changeSkillName(name: string): void;
    changeSkillRating(rating: number): void;
    progress(): void;
    stepBackToSkillInfo(): void;
    changeSkillComment(comment: string): void;
    setCurrentChoice(choice: UnCategorizedSkillChoice): void;
    closeDialog(): void;
}

class AddSkillDialogModule extends React.Component<
    AddSkillDialogProps
    & AddSkillDialogLocalProps
    & AddSkillDialogDispatch, AddSkillDialogLocalState> {


    static mapStateToProps(state: ApplicationState, localProps: AddSkillDialogLocalProps): AddSkillDialogProps {
        return {
            addSkillStep: state.skillReducer.currentAddSkillStep(),
            skillName: state.skillReducer.currentSkillName(),
            skillRating: state.skillReducer.currentSkillRating(),
            categoryString: state.skillReducer.categorieHierarchiesBySkillName().get(state.skillReducer.currentSkillName()),
            currentChoice: state.skillReducer.currentChoice(),
            skillComment: state.skillReducer.skillComment(),
            addSkillError: state.skillReducer.addSkillError()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AddSkillDialogDispatch {
        return {
            changeSkillRating: rating => dispatch(SkillActionCreator.SetCurrentSkillRating(rating)),
            changeSkillName: name => dispatch(SkillActionCreator.SetCurrentSkillName(name)),
            progress: () => dispatch(SkillActionCreator.AsyncProgressAddSkill()),
            stepBackToSkillInfo: () => dispatch(SkillActionCreator.StepBackToSkillInfo()),
            changeSkillComment: (comment) => dispatch(SkillActionCreator.ChangeSkillComment(comment)),
            setCurrentChoice: choice => dispatch(SkillActionCreator.SetCurrentChoice(choice)),
            closeDialog: () => dispatch(SkillActionCreator.ResetAddSkillDialog())
        };
    }

    private mapStepIndex = () => {
        switch(this.props.addSkillStep) {
            case AddSkillStep.SKILL_INFO:
                return 0;
            case AddSkillStep.CATEGORY_REQUEST_PENDING:
            case AddSkillStep.SHOW_CATEGORY:
            case AddSkillStep.SHOW_EDITING_OPTIONS:
                return 1;
            case AddSkillStep.DONE:
                return 2;
            default:
                return -1;

        }
    };

    private renderSkillInfo = (): JSX.Element  => {
        return <div>
            <SkillSearcher
                onValueChange={this.props.changeSkillName}
                id="AddSkill.Searcher"
                floatingLabelText={'Search Skill'}
            />
            <StarRating
                rating={this.props.skillRating}
                onRatingChange={this.props.changeSkillRating}
            />
            <RaisedButton
                label="Continue"
                onClick={this.props.progress}
            />

        </div>;
    };

    private renderCategoryRequestPending = (): JSX.Element  => {
        return(
        <div>
            <div className="vertical-align">
                <RefreshIndicator
                    size={40}
                    left={0}
                    top={0}
                    style={{position: "relative", marginBottom: "8px"}}
                    loadingColor="#FF9800"
                    status="loading"
                />
            </div>
            <div className="vertical-align">
                Retreiving Skill category...
            </div>
        </div>);
    };

    private renderShowCategory = (): JSX.Element  => {
        return <div>
            <div style={{textAlign: "center", margin: "16px"}}>
                The following category hiearchy was determined for the provided skill<br/>
                <span style={{color: "#ffc01b", marginTop: "8px", marginBottom: "8px"}}> {this.props.categoryString}</span><br/>
                Please validate that this is a category that is appropriate for the skill.<br/>
                If the category is inappropriate, it is most likely the wrong or incomplete name for the skill. <br/>
                For products, consider adding the developing company.
            </div>
            <div className="vertical-align">
                <RaisedButton
                    label="Valid category"
                    style={{marginRight: "6px"}}
                    onClick={this.props.progress}
                />
                <RaisedButton
                    label="Invalid category"
                    secondary={true}
                    style={{marginLeft: "6px"}}
                    onClick={this.props.stepBackToSkillInfo}
                />
            </div>

        </div>;
    };

    private renderShowEditingOptions = (): JSX.Element  => {
        return <div>
            <span>The skill service has no category information for this skill. Please choose one of the options below</span>
            <div style={{width: "100%", height: "150px"}}>
                <RadioButtonGroup
                    name="choice"
                    style={{margin: "20px"}}
                    valueSelected={this.props.currentChoice}
                    onChange={(e, v: any) => this.props.setCurrentChoice(v)}
                >
                    <RadioButton
                        value={UnCategorizedSkillChoice.PROCEED_WITH_COMMENT}
                        label={UnCategorizedSkillChoice[UnCategorizedSkillChoice.PROCEED_WITH_COMMENT]}
                    />
                    <RadioButton
                        value={UnCategorizedSkillChoice.PROCEED_ANYWAY}
                        label={UnCategorizedSkillChoice[UnCategorizedSkillChoice.PROCEED_ANYWAY]}
                    />
                </RadioButtonGroup>
                {
                    this.props.currentChoice === UnCategorizedSkillChoice.PROCEED_WITH_COMMENT ?
                        <LimitedTextField
                            errorText="Too long"
                            overrideErrorText={this.props.addSkillError}
                            id="AddSkillDialog.Comment"
                            fullWidth={true}
                            maxCharacters={255}
                            value={this.props.skillComment}
                            multiLine={true}
                            onChange={(e, v) => {this.props.changeSkillComment(v)}}
                        />
                        :
                        false
                }

            </div>
            <RaisedButton
                label="Proceed"
                onClick={this.props.progress}
            />
        </div>;
    };

    private renderDone = (): JSX.Element  => {
        return <div style={{textAlign: "center"}}>
            Done<br/>
            <IconButton
                iconClassName="material-icons"
                iconStyle={{color: "green"}}
                onClick={this.props.progress}
                size={80}
            >
                check_circle
            </IconButton>
        </div>;
    };

    private renderStepContent = () : JSX.Element => {
        switch(this.props.addSkillStep) {
            case AddSkillStep.SKILL_INFO:
                return this.renderSkillInfo();
            case AddSkillStep.CATEGORY_REQUEST_PENDING:
                return this.renderCategoryRequestPending();
            case AddSkillStep.SHOW_CATEGORY:
                return this.renderShowCategory();
            case AddSkillStep.SHOW_EDITING_OPTIONS:
                return this.renderShowEditingOptions();
            case AddSkillStep.DONE:
                return this.renderDone();
            default:
                return <div/>;
        }
    };

    render() {
        return (
        <div>
            <RaisedButton
                label="Add a Skill"
                onClick={this.props.progress}
            />
            <Dialog
                open={this.props.addSkillStep !== AddSkillStep.NONE}
            >
                <span style={{textAlign: "right"}}>
                   <IconButton iconClassName="material-icons" onClick={this.props.closeDialog}>close</IconButton>
                </span>
                <Divider style={{float: "none"}}/>

                <Stepper activeStep={this.mapStepIndex()}>
                    <Step>
                        <StepLabel>Edit Skill Info</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Validate category</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Done</StepLabel>
                    </Step>
                </Stepper>
                <div style={{width: "100%"}}>
                    {this.renderStepContent()}
                </div>
            </Dialog>
        </div>);
    }
}

/**
 * Allows adding skills in a dialog.
 * @see AddSkillDialogModule
 * @author nt
 * @since 21.07.2017
 */
export const AddSkillDialog: React.ComponentClass<AddSkillDialogLocalProps> = connect(AddSkillDialogModule.mapStateToProps, AddSkillDialogModule.mapDispatchToProps)(AddSkillDialogModule);
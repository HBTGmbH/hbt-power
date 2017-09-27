import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AddSkillStep} from '../../../../../model/skill/AddSkillStep';
import {
    Dialog,
    IconButton,
    RadioButton,
    RadioButtonGroup,
    RaisedButton,
    RefreshIndicator,
    Step,
    StepContent,
    StepLabel
} from 'material-ui';
import {Stepper} from 'material-ui/Stepper';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {StarRating} from '../../../../star-rating_module.';
import {SkillSearcher} from '../../../../general/skill-search_module';
import {UnCategorizedSkillChoice} from '../../../../../model/skill/UncategorizedSkillChoice';
import {LimitedTextField} from '../../../../general/limited-text-field-module.';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {isNullOrUndefined} from 'util';


interface AddSkillDialogProps {
    addSkillStep: AddSkillStep
    skillName: string;
    skillRating: number;
    categoryString: string;
    currentChoice: UnCategorizedSkillChoice;
    skillComment: string;
    addSkillError: string | undefined | null;
    doneState: string;
    /**
     * Reason why no category could be found.
     */
    noCategoryReason: string;

}

interface AddSkillDialogLocalProps {
    onOpen?(): void;
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
            addSkillError: state.skillReducer.addSkillError(),
            noCategoryReason: state.skillReducer.noCategoryReason(),
            doneState: state.skillReducer.doneState()
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

    private handleOpen = () => {
        if(!isNullOrUndefined(this.props.onOpen)) {
            this.props.onOpen();
        }
        this.props.progress();
    };

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
        return <div className="row">
            <div className="col-md-6">
                <SkillSearcher
                    onValueChange={this.props.changeSkillName}
                    resetOnRequest={false}
                    maxHeight={"400px"}
                    id="AddSkill.Searcher"
                    floatingLabelText={PowerLocalize.get("Action.SearchSkill")}
                />
            </div>
            <div className="col-md-6">
                <StarRating
                    rating={this.props.skillRating}
                    onRatingChange={this.props.changeSkillRating}
                />
            </div>
            <div className="col-md-6">
                <RaisedButton
                    label={PowerLocalize.get("AddSkillDialog.ButtonProceed")}
                    onClick={this.props.progress}
                />
            </div>
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
                {PowerLocalize.get("AddSkillDialog.CategoryPending.Info")}
            </div>
        </div>);
    };

    private renderShowCategory = (): JSX.Element  => {
        return <div>
            <div style={{textAlign: "center", margin: "16px"}}>
                {PowerLocalize.get("AddSkillDialog.ShowCategory.Introduction.0")}<br/>
                <span className="highlighted-category">{this.props.categoryString}</span><br/>
                {PowerLocalize.get("AddSkillDialog.ShowCategory.Introduction.1")}<br/>
                {PowerLocalize.get("AddSkillDialog.ShowCategory.Introduction.2")}<br/>
                {PowerLocalize.get("AddSkillDialog.ShowCategory.Introduction.3")}
            </div>
            <div className="vertical-align">
                <RaisedButton
                    label={PowerLocalize.get("AddSkillDialog.ShowCategory.BtnValidCategory")}
                    style={{marginRight: "6px"}}
                    onClick={this.props.progress}
                />
                <RaisedButton
                    label={PowerLocalize.get("AddSkillDialog.ShowCategory.BtnInvalidCategory")}
                    secondary={true}
                    style={{marginLeft: "6px"}}
                    onClick={this.props.stepBackToSkillInfo}
                />
            </div>

        </div>;
    };

    private renderShowEditingOptions = (): JSX.Element  => {
        return <div>
            <span>{PowerLocalize.get("AddSkillDialog.EditOptions.Introduction")}</span><br/>
            {this.props.noCategoryReason}<br/>
            <span>{PowerLocalize.get("AddSkillDialog.EditOptions.ChoiceText")}</span>
            <div style={{width: "100%", height: "150px"}}>
                <RadioButtonGroup
                    name="choice"
                    style={{margin: "20px"}}
                    valueSelected={this.props.currentChoice}
                    onChange={(e, v: any) => this.props.setCurrentChoice(v)}
                >
                    <RadioButton
                        value={UnCategorizedSkillChoice.PROCEED_WITH_COMMENT}
                        label={PowerLocalize.get(UnCategorizedSkillChoice[UnCategorizedSkillChoice.PROCEED_WITH_COMMENT])}
                    />
                    <RadioButton
                        value={UnCategorizedSkillChoice.PROCEED_ANYWAY}
                        label={PowerLocalize.get(UnCategorizedSkillChoice[UnCategorizedSkillChoice.PROCEED_ANYWAY])}
                    />
                </RadioButtonGroup>
                {
                    this.props.currentChoice === UnCategorizedSkillChoice.PROCEED_WITH_COMMENT ?
                        <LimitedTextField
                            errorText={PowerLocalize.get("AddSkillDialog.Comment.ErrorTooLong")}
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
                label={PowerLocalize.get("AddSkillDialog.ButtonProceed")}
                onClick={this.props.progress}
            />
        </div>;
    };

    private renderDone = (): JSX.Element  => {
        let btn;
        if(this.props.doneState === "SKILL_EXISTS") {
            btn = <div>
                    <IconButton
                        iconClassName="material-icons"
                        iconStyle={{color: "green"}}
                        onClick={this.props.progress}
                        size={80}
                    >
                        info
                    </IconButton><br/>
                    Skill Already Exists
                </div>
        } else {
           btn = <IconButton
                iconClassName="material-icons"
                iconStyle={{color: "green"}}
                onClick={this.props.progress}
                size={80}
            >
                check_circle
            </IconButton>
        }

        return <div style={{textAlign: "center"}}>
            {PowerLocalize.get("AddSkillDialog.Done")}<br/>
            {btn}
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
                label={PowerLocalize.get("AddSkillDialog.Title")}
                onClick={this.handleOpen}
            />
            <Dialog
                open={this.props.addSkillStep !== AddSkillStep.NONE}
                autoScrollBodyContent={true}
                style={{width: "100%", position: "absolute"}}
                contentStyle={{width: "100%"}}
                title={PowerLocalize.get("AddSkillDialog.Title")}
                actions={[<IconButton iconClassName="material-icons" onClick={this.props.closeDialog}>
                    close
                </IconButton>]}
            >
                <Stepper activeStep={this.mapStepIndex()} orientation="vertical">
                    <Step>
                        <StepLabel>{PowerLocalize.get("AddSkillDialog.Step.0")}</StepLabel>
                        <StepContent>
                            {this.renderStepContent()}
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>{PowerLocalize.get("AddSkillDialog.Step.1")}</StepLabel>
                        <StepContent>
                            {this.renderStepContent()}
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>{PowerLocalize.get("AddSkillDialog.Step.2")}</StepLabel>
                        <StepContent>
                            {this.renderStepContent()}
                        </StepContent>
                    </Step>
                </Stepper>
            </Dialog>
        </div>);
    }
}

/**
 * Allows adding skills in a dialog form. Comes with a button to open the dialog.
 * @see AddSkillDialogModule
 * @author nt
 * @since 21.07.2017
 */
export const AddSkillDialog: React.ComponentClass<AddSkillDialogLocalProps> = connect(AddSkillDialogModule.mapStateToProps, AddSkillDialogModule.mapDispatchToProps)(AddSkillDialogModule);
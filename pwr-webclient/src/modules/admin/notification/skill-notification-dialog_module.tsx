import {connect} from 'react-redux';
import * as React from 'react';
import {
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    Radio,
    RadioGroup,
    Step,
    StepLabel,
    Stepper
} from '@material-ui/core';

import {SkillNotificationEditStatus} from '../../../model/admin/SkillNotificationEditStatus';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {SkillNotificationAction} from '../../../model/admin/SkillNotificationAction';
import {SkillSearcher} from '../../general/skill-search_module';
import {AdminNotificationReason} from '../../../model/admin/AdminNotificationReason';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ThunkDispatch} from 'redux-thunk';
import {PwrButton} from '../../general/pwr-button';
import {PwrFormActions} from '../../general/pwr-form-actions';

interface SkillNotificationModuleProps {
    status: SkillNotificationEditStatus;
    hierarchy: string;
    error: string;
    skillNotificationSelectedAction: SkillNotificationAction;
    newSkillName: string;
    skillEdited: boolean;
    comment: string;
    skillName: string;
    initials: string;
    newName: string;
    reason: AdminNotificationReason;
}

interface SkillNotificationModuleLocalProps {

}

interface SkillNotificationModuleLocalState {

}

interface SkillNotificationModuleDispatch {
    closeAndReset(): void;

    setSkillNotificationAction(action: SkillNotificationAction): void;

    categorizeSkill(name: string): void;

    progressFromActionSelection(): void;

    changeNewSkillName(name: string): void;

    invokeSkillNotificationEditAction(): void;
}

class SkillNotificationModuleModule extends React.Component<SkillNotificationModuleProps
    & SkillNotificationModuleLocalProps
    & SkillNotificationModuleDispatch, SkillNotificationModuleLocalState> {

    static mapStateToProps(state: ApplicationState): SkillNotificationModuleProps {
        let hierarchy = '';
        if (state.adminReducer.selectedSkillNotification) {
            hierarchy = state.skillReducer.categorieHierarchiesBySkillName.get(state.adminReducer.selectedSkillNotification.newName());
        }
        let newSkillName = '';
        if (state.adminReducer.selectedSkillNotification) {
            newSkillName = state.adminReducer.selectedSkillNotification.newName();
        }
        let comment = null;
        let skillName = '';
        let initials = '';
        let newName = '';
        let reason = undefined;
        if (state.adminReducer.selectedSkillNotification) {
            comment = state.adminReducer.selectedSkillNotification.skill().comment();
            skillName = state.adminReducer.selectedSkillNotification.skill().name();
            initials = state.adminReducer.selectedSkillNotification.adminNotification().initials();
            newName = state.adminReducer.selectedSkillNotification.newName();
            reason = state.adminReducer.selectedSkillNotification.adminNotification().reason();
        }

        return {
            status: state.adminReducer.skillNotificationEditStatus,
            hierarchy: hierarchy,
            error: state.adminReducer.skillNotificationError,
            skillNotificationSelectedAction: state.adminReducer.skillNotificationSelectedAction,
            newSkillName: newSkillName,
            skillEdited: state.adminReducer.isSkillNameEdited,
            comment: comment,
            skillName: skillName,
            initials: initials,
            newName: newName,
            reason: reason
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): SkillNotificationModuleDispatch {
        return {
            closeAndReset: () => dispatch(AdminActionCreator.CloseAndResetSkillNotificationDlg()),
            setSkillNotificationAction: action => dispatch(AdminActionCreator.SetSkillNotificationAction(action)),
            categorizeSkill: (skillName: string) => dispatch(AdminActionCreator.AsyncCategorizeSkill(skillName)),
            progressFromActionSelection: () => dispatch(AdminActionCreator.AsyncProgressFromActionSelection()),
            changeNewSkillName: (name) => dispatch(AdminActionCreator.SetNewSkillName(name)),
            invokeSkillNotificationEditAction: () => dispatch(AdminActionCreator.AsyncNotificationInvokeSkillEdit())
        };
    }

    private renderPending = () => {
        return <div>
            <div className="vertical-align">
                <CircularProgress
                    size={40}
                    //left={0}
                    //top={0}
                    style={{position: 'relative', marginBottom: '8px'}}
                    //loadingColor="#FF9800"
                    //status="loading"
                />
            </div>
            <div className="vertical-align">
                {PowerLocalize.getFormatted('SkillNotificationDialog.Fetching', this.props.skillName)}
            </div>
        </div>;
    };

    private SkillInfo = () => {
        return <div>
            <p>
                {PowerLocalize.get('SkillNotificationDialog.UnknownSkill.Before')}<strong>{this.props.skillName}</strong>
                {PowerLocalize.get('SkillNotificationDialog.Profile.Before')}<strong>{this.props.initials}</strong>
                {PowerLocalize.get('SkillNotificationDialog.UnknownSkill.After')}
            </p>
            {
                this.props.comment ? <p>{PowerLocalize.get('SkillNotificationDialog.Comment')} {this.props.comment}</p> : false
            }
            {
                this.props.skillEdited ?
                    <p>{PowerLocalize.get('SkillNotificationDialog.NewName')} <strong>{this.props.newSkillName}</strong></p> : false
            }
        </div>;
    };

    private NotificationActions = () => {
        return <div>
            <FormControl>
                <p>
                    {PowerLocalize.get('SkillNotificationDialog.ChooseAction')}
                </p>

                <RadioGroup
                    name="notificationAction"
                    //valueSelected={this.props.skillNotificationSelectedAction}
                    onChange={(event: any, value: string /* not really a string, it likes to think it is one */) => {
                        this.props.setSkillNotificationAction(value as any);
                    }}
                >
                    <FormControlLabel value="" control={<Radio value={SkillNotificationAction.ACTION_OK.toString()}/>}
                                      label={PowerLocalize.get('SkillNotificationDialog.Action.Accept')}/>
                    <FormControlLabel value="" control={<Radio value={SkillNotificationAction.ACTION_EDIT.toString()}/>}
                                      label={PowerLocalize.get('SkillNotificationDialog.Action.Edit')}/>
                    <FormControlLabel value=""
                                      control={<Radio value={SkillNotificationAction.ACTION_DELETE.toString()}/>}
                                      label={PowerLocalize.get('SkillNotificationDialog.Action.Delete')}/>

                </RadioGroup>
            </FormControl>
        </div>;
    };

    private renderInfo = () => {
        return <div>
            <this.SkillInfo/>
            <p>
                {PowerLocalize.get('SkillNotificationDialog.Category')}
                <span className="highlighted-category"> {this.props.hierarchy}</span>
            </p>
            <this.NotificationActions/>
        </div>;
    };

    private renderInfoCategoryPending = () => {
        return <div>
            <this.SkillInfo/>
            <CircularProgress
                size={40}
                //left={0}
                //top={0}
                style={{position: 'relative', marginBottom: '8px'}}
                //loadingColor="#FF9800"
                //status="loading"
            />
            <p>
                {PowerLocalize.get('SkillNotificationDialog.Categorizing')}
            </p>
        </div>;
    };

    private renderInfoNoCategory = () => {
        return <div>
            <this.SkillInfo/>
            <p>
                {PowerLocalize.get('SkillNotificationDialog.NotCategorized')}
                <PwrButton color={'primary'} text={PowerLocalize.get('SkillNotificationDialog.CategorizeNow')}
                           onClick={() => this.props.categorizeSkill(this.props.skillName)}/>
            </p>
            <this.NotificationActions/>
        </div>;
    };

    private renderInfoCategoryError = () => {
        console.debug('Reason:', this.props.error);
        return <div>
            <this.SkillInfo/>
            <p>
                {PowerLocalize.get('SkillNotificationDialog.CategorizeFailed')} <span className="error-text">{this.props.error}</span>
            </p>
            <this.NotificationActions/>
        </div>;
    };

    private renderError = () => {
        return <div className="error-text">
            {PowerLocalize.get('SkillNotificationDialog.Error')} {this.props.error}
        </div>;
    };

    private renderSuccess = () => {
        return <div style={{textAlign: 'center'}}>
            {PowerLocalize.get('SkillNotificationDialog.Success')}<br/>
            <IconButton
                className="icon-ok-button ,material-icons"
                //className="material-icons"
            >
                check_circle
            </IconButton>
        </div>;
    };

    private renderEdit = () => {
        return <div className="vcenter">
            <p>
                {PowerLocalize.get('SkillNotificationDialog.Edit.Hint')}
            </p>
            <SkillSearcher
                id="SkillNotificationDialog.SkillSearcher"
                initialValue={this.props.newSkillName}
                value={this.props.newSkillName}
                onValueChange={this.props.changeNewSkillName}
                onNewRequest={this.props.changeNewSkillName}
            />
            <p>
                {PowerLocalize.get('SkillNotificationDialog.Edit.ValidateHint')}
            </p>
        </div>;
    };

    private renderContent() {
        switch (this.props.status) {
            case SkillNotificationEditStatus.FETCHING_DATA:
                return this.renderPending();
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY:
                return this.renderInfo();
            case SkillNotificationEditStatus.DISPLAY_INFO_NO_CATEGORY:
                return this.renderInfoNoCategory();
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_PENDING:
                return this.renderInfoCategoryPending();
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_ERROR:
                return this.renderInfoCategoryError();
            case SkillNotificationEditStatus.DISPLAY_EDIT_DIALOG:
                return this.renderEdit();
            case SkillNotificationEditStatus.DISPLAY_ERROR:
                return this.renderError();
            case SkillNotificationEditStatus.DISPLAY_SUCCESS:
                return this.renderSuccess();
            default:
                return <div/>;
        }
    }

    private renderStepper = () => {
        let index = 0;
        let displayLastStepper = false;
        switch (this.props.status) {
            case SkillNotificationEditStatus.FETCHING_DATA:
                index = 0;
                break;
            case SkillNotificationEditStatus.DISPLAY_INFO_NO_CATEGORY:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_PENDING:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_ERROR:
                index = 1;
                break;
            case SkillNotificationEditStatus.DISPLAY_EDIT_DIALOG:
                index = 2;
                break;
            case SkillNotificationEditStatus.DISPLAY_ERROR:
            case SkillNotificationEditStatus.DISPLAY_SUCCESS:
            default:
                break;
        }
        if (this.props.skillNotificationSelectedAction === SkillNotificationAction.ACTION_EDIT) {
            displayLastStepper = true;
        }
        let steps = [
            <Step key="SkillNotDlg.Step0">
                <StepLabel>{PowerLocalize.get('SkillNotificationDialog.Step.Fetching')}</StepLabel>
            </Step>,
            <Step key="SkillNotDlg.Step1">
                <StepLabel>{PowerLocalize.get('SkillNotificationDialog.Step.Info')}</StepLabel>
            </Step>
        ];
        if (displayLastStepper) steps.push(<Step key="SkillNotDlg.Step2">
            <StepLabel>{PowerLocalize.get('SkillNotificationDialog.Step.Edit')}</StepLabel>
        </Step>);

        return (<Stepper activeStep={index}>
            {steps}
        </Stepper>);
    };

    /**
     * The button bar of the forms (#134): the step's main action highlighted, Cancel next to it
     */
    private renderController = () => {
        const actions = (saveText: string, onSave: () => void, saveDisabled = false, extra?: JSX.Element) =>
            <PwrFormActions editing noSpace saveText={saveText} saveIcon="arrow_forward" saveDisabled={saveDisabled}
                            onSave={onSave} onCancel={this.props.closeAndReset}>
                {extra}
            </PwrFormActions>;
        switch (this.props.status) {
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_PENDING:
                return actions(PowerLocalize.get('SkillNotificationDialog.Categorize'),
                    () => this.props.categorizeSkill(this.props.skillName), true);
            case SkillNotificationEditStatus.DISPLAY_INFO_NO_CATEGORY:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_ERROR:
                const label = this.props.skillNotificationSelectedAction === SkillNotificationAction.ACTION_EDIT
                    ? PowerLocalize.get('Action.Next')
                    : PowerLocalize.get('Action.Finish');
                return actions(label, this.props.progressFromActionSelection);
            case SkillNotificationEditStatus.DISPLAY_EDIT_DIALOG:
                return actions(PowerLocalize.get('Action.Finish'), this.props.invokeSkillNotificationEditAction, false,
                    <PwrButton color={'primary'} text={PowerLocalize.get('SkillNotificationDialog.Validate')}
                               onClick={() => this.props.categorizeSkill(this.props.newName)}/>);
            case SkillNotificationEditStatus.DISPLAY_ERROR:
            case SkillNotificationEditStatus.DISPLAY_SUCCESS:
                return <PwrFormActions editing noSpace saveText={PowerLocalize.get('Action.Close')} saveIcon="close"
                                       onSave={this.props.closeAndReset}/>;
            case SkillNotificationEditStatus.FETCHING_DATA:
            default:
                return null;
        }
    };

    render() {
        return <Dialog id="SkillNotificationDialog"
                       open={this.props.status !== SkillNotificationEditStatus.CLOSED}
                       onClose={this.props.closeAndReset}
                       scroll={'paper'}
                       fullWidth
        >
            <DialogTitle id="SkillNotificationDialog.Title">
                {PowerLocalize.get('SkillNotificationDialog.Title')}
            </DialogTitle>
            <DialogContent id="SkillNotificationDialog.Content">
                {this.renderContent()}
                {this.renderStepper()}
            </DialogContent>
            <DialogActions>
                {this.renderController()}
            </DialogActions>
        </Dialog>;
    }
}

/**
 * @see SkillNotificationModuleModule
 * @author nt
 * @since 27.07.2017
 */
export const SkillNotificationDialog = connect(SkillNotificationModuleModule.mapStateToProps, SkillNotificationModuleModule.mapDispatchToProps)(SkillNotificationModuleModule);

import {connect} from 'react-redux';
import * as React from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
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
                Fetching information for skill '{this.props.skillName}'
            </div>
        </div>;
    };

    private SkillInfo = () => {
        return <div>
            {

                this.props.reason === AdminNotificationReason.DANGEROUS_SKILL_ADDED_UNKNOWN ?
                    <p>
                        The previously unknown skill <strong>{this.props.skillName}</strong> was added to the profile
                        of <strong>{this.props.initials}</strong>.
                    </p>
                    :
                    <p>
                        The skill <strong>{this.props.skillName}</strong> was added to the profile
                        of <strong>{this.props.initials}</strong> but the category is blacklisted.
                    </p>
            }
            {
                this.props.comment ? <p>A comment was provided: {this.props.comment}</p> : false
            }
            {
                this.props.skillEdited ?
                    <p>The new skill name will be <strong>{this.props.newSkillName}</strong></p> : false
            }
        </div>;
    };

    private NotificationActions = () => {
        return <div>
            <FormControl>
                <p>
                    Please choose one of the action below to resolve the notification.
                </p>

                <RadioGroup
                    name="notificationAction"
                    //valueSelected={this.props.skillNotificationSelectedAction}
                    onChange={(event: any, value: string /* not really a string, it likes to think it is one */) => {
                        this.props.setSkillNotificationAction(value as any);
                    }}
                >
                    <FormControlLabel value="" control={<Radio value={SkillNotificationAction.ACTION_OK.toString()}/>}
                                      label="Accept Skill"/>
                    <FormControlLabel value="" control={<Radio value={SkillNotificationAction.ACTION_EDIT.toString()}/>}
                                      label="Edit Skill"/>
                    <FormControlLabel value=""
                                      control={<Radio value={SkillNotificationAction.ACTION_DELETE.toString()}/>}
                                      label="Delete Skill"/>

                </RadioGroup>
            </FormControl>
        </div>;
    };

    private renderInfo = () => {
        return <div>
            <this.SkillInfo/>
            <p>
                The skill has the following category:
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
                Categorization pending...
            </p>
        </div>;
    };

    private renderInfoNoCategory = () => {
        return <div>
            <this.SkillInfo/>
            <p>
                This skill was not yet categorized.
                <Button
                    variant={'text'}
                    color={'secondary'}
                    onClick={() => this.props.categorizeSkill(this.props.skillName)}
                >Categorize now.</Button>
            </p>
            <this.NotificationActions/>
        </div>;
    };

    private renderInfoCategoryError = () => {
        console.debug('Reason:', this.props.error);
        return <div>
            <this.SkillInfo/>
            <p>
                Categorization failed. Reason: <span className="error-text">{this.props.error}</span>
            </p>
            <this.NotificationActions/>
        </div>;
    };

    private renderError = () => {
        return <div className="error-text">
            An error occurred: {this.props.error}
        </div>;
    };

    private renderSuccess = () => {
        return <div style={{textAlign: 'center'}}>
            Success<br/>
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
                The skill name may now be changed. This change affects all non-view profiles.
            </p>
            <SkillSearcher
                id="SkillNotificationDialog.SkillSearcher"
                initialValue={this.props.newSkillName}
                value={this.props.newSkillName}
                onValueChange={this.props.changeNewSkillName}
                onNewRequest={this.props.changeNewSkillName}
            />
            <p>
                Consider validating the skill category after change; If you are sure the changed skill is correct, this
                is not necessary.
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
                <StepLabel>Information Resolving</StepLabel>
            </Step>,
            <Step key="SkillNotDlg.Step1">
                <StepLabel>Information</StepLabel>
            </Step>
        ];
        if (displayLastStepper) steps.push(<Step key="SkillNotDlg.Step2">
            <StepLabel>Edit Skill</StepLabel>
        </Step>);

        return (<Stepper activeStep={index}>
            {steps}
        </Stepper>);
    };

    private renderController = () => {
        switch (this.props.status) {
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_PENDING:
                return (<Button
                    variant={'contained'}
                    color={'secondary'}
                    onClick={() => this.props.categorizeSkill(this.props.skillName)}
                    disabled={true}
                >Categorize</Button>);
            case SkillNotificationEditStatus.DISPLAY_INFO_NO_CATEGORY:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_ERROR:
                let label = this.props.skillNotificationSelectedAction === SkillNotificationAction.ACTION_EDIT ? 'Continue' : 'Finish';
                return (<Button
                    variant={'contained'}
                    color={'secondary'}
                    onClick={this.props.progressFromActionSelection}
                >{label}</Button>);
            case SkillNotificationEditStatus.DISPLAY_EDIT_DIALOG:
                return (
                    <div>
                        <Button
                            variant={'contained'}
                            color={'primary'}

                            onClick={() => this.props.categorizeSkill(this.props.newName)}
                        >Validate</Button>
                        <Button
                            variant={'contained'}
                            color={'secondary'}
                            style={{marginLeft: '8px'}}
                            onClick={this.props.invokeSkillNotificationEditAction}
                        >Finish</Button>
                    </div>
                );
            case SkillNotificationEditStatus.DISPLAY_ERROR:
            case SkillNotificationEditStatus.DISPLAY_SUCCESS:
            case SkillNotificationEditStatus.FETCHING_DATA:
            default:
                return <div/>;
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
                {this.renderController()}
            </DialogContent>
        </Dialog>;
    }
}

/**
 * @see SkillNotificationModuleModule
 * @author nt
 * @since 27.07.2017
 */
export const SkillNotificationDialog = connect(SkillNotificationModuleModule.mapStateToProps, SkillNotificationModuleModule.mapDispatchToProps)(SkillNotificationModuleModule);

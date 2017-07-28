import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {
    Dialog,
    FlatButton,
    IconButton,
    RadioButton,
    RadioButtonGroup,
    RaisedButton,
    RefreshIndicator
} from 'material-ui';

import {SkillNotificationEditStatus} from '../../../model/admin/SkillNotificationEditStatus';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {SkillNotification} from '../../../model/admin/SkillNotification';
import {isNullOrUndefined} from 'util';
import {SkillNotificationAction} from '../../../model/admin/SkillNotificationAction';
import {Step, StepLabel, Stepper} from 'material-ui/Stepper';

interface SkillNotificationModuleProps {
    status: SkillNotificationEditStatus;
    notification: SkillNotification;
    hierarchy: string;
    error: string;
    skillNotificationSelectedAction: SkillNotificationAction;
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
}

class SkillNotificationModuleModule extends React.Component<
    SkillNotificationModuleProps
    & SkillNotificationModuleLocalProps
    & SkillNotificationModuleDispatch, SkillNotificationModuleLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: SkillNotificationModuleLocalProps): SkillNotificationModuleProps {
        let hierarchy = '';
        if(!isNullOrUndefined(state.adminReducer.selectedSkillNotification())) {
            let skill = state.adminReducer.selectedSkillNotification().skill();
            if(!isNullOrUndefined(skill)) {
                hierarchy = state.skillReducer.categorieHierarchiesBySkillName().get(skill.name());
            }
        }
        return {
            status: state.adminReducer.skillNotificationEditStatus(),
            notification: state.adminReducer.selectedSkillNotification(),
            hierarchy: hierarchy,
            error: state.adminReducer.skillNotificationError(),
            skillNotificationSelectedAction: state.adminReducer.skillNotificationSelectedAction()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SkillNotificationModuleDispatch {
        return {
            closeAndReset: () => dispatch(AdminActionCreator.CloseAndResetSkillNotificationDlg()),
            setSkillNotificationAction: action => dispatch(AdminActionCreator.SetSkillNotificationAction(action)),
            categorizeSkill: skillName => dispatch(AdminActionCreator.AsyncCategorizeSkill(skillName)),
            progressFromActionSelection: () => dispatch(AdminActionCreator.AsyncProgressFromActionSelection())
        };
    }

    private renderPending = () => {
        return <div>
            <div className="vertical-align">
                <RefreshIndicator
                    size={40}
                    left={0}
                    top={0}
                    style={{position: 'relative', marginBottom: '8px'}}
                    loadingColor="#FF9800"
                    status="loading"
                />
            </div>
            <div className="vertical-align">
                Fetching information for skill '{this.props.notification.skill().name()}'
            </div>
        </div>;
    };

    private SkillInfo = () => {
        return <div>
            <p>
                The previously unknown skill {this.props.notification.skill().name()} was added to the profile
                of {this.props.notification.adminNotification().initials()}.
            </p>
        </div>;
    };

    private NotificationActions = () => {
        return <div>
            <p>
                Please choose one of the action below to resolve the notification.
            </p>
            <RadioButtonGroup
                name="notificationAction"
                valueSelected={this.props.skillNotificationSelectedAction}
                onChange={(event: any, value: string /* not really a string, it likes to think it is one */) => {this.props.setSkillNotificationAction(value as any);}}
            >
            <RadioButton
                value={SkillNotificationAction.ACTION_OK}
                label="Accept Skill"
            />
            <RadioButton
                value={SkillNotificationAction.ACTION_EDIT}
                label="Edit Skill"
            />
            <RadioButton
                value={SkillNotificationAction.ACTION_DELETE}
                label="Delete Skill"
            />
            </RadioButtonGroup>
            <RaisedButton
                label="Continue"
                secondary={true}
                onClick={this.props.progressFromActionSelection}
            />
        </div>
    }

    private renderInfo = () => {
        return <div>
            <this.SkillInfo/>
            <p>
                The skill has the following category:
            </p>
            <p>
                {this.props.hierarchy}
            </p>
            <this.NotificationActions/>
        </div>;
    };

    private renderInfoCategoryPending = () => {
        return <div>
            <this.SkillInfo/>
            <RefreshIndicator
                size={40}
                left={0}
                top={0}
                style={{position: 'relative', marginBottom: '8px'}}
                loadingColor="#FF9800"
                status="loading"
            />
            <p>
                Categorization pending...
            </p>
            <FlatButton
                label="Categorize"
                onClick={() => this.props.categorizeSkill(this.props.notification.skill().name())}
                disabled={true}
            />
        </div>;
    };

    private renderInfoNoCategory = () => {
        return <div>
            <this.SkillInfo/>
            <p>
                This skill was not yet categorized. Categorize now?
            </p>
            <FlatButton
                label="Categorize"
                onClick={() => this.props.categorizeSkill(this.props.notification.skill().name())}
            />
        </div>;
    };

    private renderInfoCategoryError = () => {
        return <div>
            <this.SkillInfo/>
            <p>
                Categorization failed. Reason: {this.props.error}
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
                iconClassName="material-icons"
                iconStyle={{color: 'green'}}
                size={80}
            >
                check_circle
            </IconButton>
        </div>;
    };

    private renderContent() {
        switch(this.props.status) {
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
        switch(this.props.status) {
            case SkillNotificationEditStatus.FETCHING_DATA:
            case SkillNotificationEditStatus.DISPLAY_INFO_NO_CATEGORY:
            case SkillNotificationEditStatus.DISPLAY_INFO_CATEGORY_PENDING:
                index = 0;
                break;
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
        if(this.props.skillNotificationSelectedAction === SkillNotificationAction.ACTION_EDIT) {
            displayLastStepper = true;
        }
        let steps = [
            <Step>
                <StepLabel>Information Resolving</StepLabel>
            </Step>,
            <Step>
                <StepLabel>Information</StepLabel>
            </Step>
        ];
        if(displayLastStepper) steps.push(<Step>
            <StepLabel>Edit Skill</StepLabel>
        </Step>);

        return (<Stepper activeStep={index}>
            {steps}
        </Stepper>);
    }

    render() {
        return (<Dialog
            open={this.props.status !== SkillNotificationEditStatus.CLOSED && !isNullOrUndefined(this.props.notification)}
            actions={[<FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.props.closeAndReset}
            />]}
        >
            {this.renderContent()}
            {this.renderStepper()}
        </Dialog>);
    }
}

/**
 * @see SkillNotificationModuleModule
 * @author nt
 * @since 27.07.2017
 */
export const SkillNotificationDialog: React.ComponentClass<SkillNotificationModuleLocalProps> = connect(SkillNotificationModuleModule.mapStateToProps, SkillNotificationModuleModule.mapDispatchToProps)(SkillNotificationModuleModule);
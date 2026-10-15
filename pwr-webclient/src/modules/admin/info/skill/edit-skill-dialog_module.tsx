import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {Button, Dialog, DialogContent, DialogTitle, Step, StepLabel, Stepper} from '@material-ui/core';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {SkillSearcher} from '../../../general/skill-search_module';
import {AdminActionCreator} from '../../../../reducers/admin/AdminActionCreator';
import {buildHierarchy} from '../../../../reducers/skill/SkillReducer';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import * as Immutable from 'immutable';
import {SkillServiceClient} from '../../../../clients/SkillServiceClient';
import {ThunkDispatch} from 'redux-thunk';

interface EditSkillDialogProps {
}

interface EditSkillDialogLocalProps {
    open: boolean;
    skillToEdit: string;
    skillInfo: Immutable.List<ConsultantInfo>;

    onClose(): void;

}

interface EditSkillDialogLocalState {
    stepIndex: number;
    newSkillName: string;
    skillHierarchy: string;

}

interface EditSkillDialogDispatch {
    changeSkillName(oldName: string, newName: string): void;
}

class EditSkillDialogModule extends React.Component<EditSkillDialogProps & EditSkillDialogLocalProps & EditSkillDialogDispatch, EditSkillDialogLocalState> {

    public constructor(props: EditSkillDialogProps & EditSkillDialogLocalProps & EditSkillDialogDispatch) {
        super(props);
        this.state = EditSkillDialogModule.emptyState();
    }

    static emptyState(): EditSkillDialogLocalState {
        return {
            stepIndex: 0,
            newSkillName: '',
            skillHierarchy: ''
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: EditSkillDialogLocalProps): EditSkillDialogProps {
        return {};
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): EditSkillDialogDispatch {
        return {
            changeSkillName: ((oldName, newName) => dispatch(AdminActionCreator.AsyncChangeSkillName(oldName, newName)))
        };
    }

    public componentWillReceiveProps(newProps: EditSkillDialogProps & EditSkillDialogLocalProps & EditSkillDialogDispatch) {
        if (newProps.open !== this.props.open) {
            this.setState(EditSkillDialogModule.emptyState());
        }
    }

    private stepForth = () => {
        let newIndex = this.state.stepIndex + 1;
        if (newIndex === 2 && !this.state.skillHierarchy) {
            this.loadSkillHierarchy();
        }
        if (newIndex === 3) {
            this.props.changeSkillName(this.props.skillToEdit, this.state.newSkillName);
            this.props.onClose();
        }
        this.setState({
            stepIndex: newIndex
        });
    };

    private changeNewSkillName = (value: string) => {
        this.setState({
            newSkillName: value
        });
    };

    private stepBack = () => {
        let stepIndex = this.state.stepIndex - 1;
        if (stepIndex < 0) {
            stepIndex = 0;
        }
        this.setState({
            stepIndex: stepIndex
        });
    };
    private loadSkillHierarchy = () => {

        SkillServiceClient.instance().postCategorizeSkill(this.state.newSkillName)
            .then(category => this.setState({skillHierarchy: this.state.newSkillName + ' => ' + buildHierarchy(category)}))
            .catch(error => console.error(error))
            .catch(() => this.setState({skillHierarchy: 'Not available.'}));
    };

    private getStepContent = (index: number) => {
        if (index === 0) {
            return <div>
                <p>
                    {PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Edit.Content1', this.props.skillToEdit)}
                </p>
                <p>
                    {this.props.skillInfo.map(value => value.getFullName()).join(', ')}
                </p>
            </div>;
        } else if (index === 1) {
            return <div>
                <p>
                    {PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Edit.Content2', this.props.skillToEdit)}
                </p>
                <SkillSearcher
                    id="EditSkillDialog.SkillSearcher"
                    label={PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Edit.NewSkillLabel')}
                    initialValue={this.state.newSkillName}
                    value={this.state.newSkillName}
                    onValueChange={this.changeNewSkillName}
                    onNewRequest={this.changeNewSkillName}
                    resetOnRequest={false}
                />
            </div>;
        } else if (index === 2) {
            let hierarchy = this.state.skillHierarchy;
            if (hierarchy && hierarchy !== '') {
                return <div>
                    <p>
                        {PowerLocalize.get('AdminClient.Infos.UsedSkills.Edit.Content3_1')}
                    </p>
                    <p>
                        <span className="highlighted-category">{hierarchy}</span>
                    </p>
                    <p>
                        {PowerLocalize.get('AdminClient.Infos.UsedSkills.Edit.Content3_2')}<br/>
                        <span
                            className="warning-note">{PowerLocalize.get('AdminClient.Infos.UsedSkills.Edit.Content3_note')}</span>
                    </p>
                </div>;
            } else {
                return <div>
                    Currently retrieving category information...
                </div>;
            }
        }
        return <div>This should not be visible. Call a developer.</div>;
    };


    render() {
        if (!this.props.skillInfo || !this.props.skillToEdit) {
            return <div/>;
        }
        return (<Dialog scroll={'body'}
                        open={this.props.open}
                        onClose={this.props.onClose}>
            <DialogTitle>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Edit.Title', this.props.skillToEdit)}</DialogTitle>
            <DialogContent>
                <Stepper activeStep={this.state.stepIndex}>
                    <Step>
                        <StepLabel>{PowerLocalize.get('AdminClient.Infos.UsedSkills.Edit.Step1')}</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>{PowerLocalize.get('AdminClient.Infos.UsedSkills.Edit.Step2')}</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>{PowerLocalize.get('AdminClient.Infos.UsedSkills.Edit.Step3')}</StepLabel>
                    </Step>
                </Stepper>
                <div>
                    <div>
                        {this.getStepContent(this.state.stepIndex)}
                        <div style={{marginTop: 12}}>
                            <Button
                                variant={'text'}
                                className="mui-margin"
                                disabled={this.state.stepIndex === 0}
                                onClick={this.stepBack}
                            >
                                {PowerLocalize.get('Action.Back')}
                            </Button>
                            <Button
                                variant={'contained'}
                                className="mui-margin"
                                color={'primary'}
                                onClick={this.stepForth}
                            >
                                {this.state.stepIndex === 2 ? PowerLocalize.get('Action.Finish') : PowerLocalize.get('Action.Next')}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>);
    }
}

/**
 * @see EditSkillDialogModule
 * @author nt
 * @since 03.02.2018
 */
export const EditSkillDialog = connect(EditSkillDialogModule.mapStateToProps, EditSkillDialogModule.mapDispatchToProps)(EditSkillDialogModule);

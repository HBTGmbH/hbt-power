import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogTitle, Step, StepLabel, Stepper, TextField} from '@material-ui/core';
import * as Immutable from 'immutable';
import {ConsultantInfo} from '../../../../model/ConsultantInfo';
import {SkillSearcher} from '../../../general/skill-search_module';
import {AdminActionCreator} from '../../../../reducers/admin/AdminActionCreator';
import {buildHierarchy} from '../../../../reducers/skill/SkillReducer';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {SkillServiceClient} from '../../../../clients/SkillServiceClient';
import {APISkillServiceSkill} from '../../../../model/skill/SkillServiceSkill';
import {PwrButton} from '../../../general/pwr-button';
import ArrowBack from '@material-ui/icons/ArrowBack';
import {PwrFormActions} from '../../../general/pwr-form-actions';

interface MergeSkillDialogProps {
    open: boolean;
    /** Name of the skill that is merged into another one and disappears */
    skillToMerge: string;
    skillInfo: Immutable.List<ConsultantInfo>;

    onClose(): void;
}

const STEP_OVERVIEW = 0;
const STEP_TARGET = 1;
const STEP_CONFIRM = 2;

/** Target as the skill tree knows it: undefined while loading, null if the skill tree doesn't know it */
type TargetInfo = APISkillServiceSkill | null | undefined;

/**
 * Merges a used skill into another skill: in all profiles and projects (higher rating wins, versions are united,
 * optionally with an additional version) and in the skill tree, where the merged skill becomes an alias of the target.
 */
export const MergeSkillDialog = (props: MergeSkillDialogProps) => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(STEP_OVERVIEW);
    const [target, setTarget] = useState('');
    const [version, setVersion] = useState('');
    const [targetInfo, setTargetInfo] = useState<TargetInfo>(undefined);

    useEffect(() => {
        setStep(STEP_OVERVIEW);
        setTarget('');
        setVersion('');
        setTargetInfo(undefined);
    }, [props.open, props.skillToMerge]);

    if (!props.skillInfo || !props.skillToMerge) {
        return <></>;
    }

    const trimmedTarget = target.trim();
    const targetValid = trimmedTarget.length > 0 && trimmedTarget !== props.skillToMerge;

    const loadTargetInfo = () => {
        setTargetInfo(undefined);
        SkillServiceClient.instance().getSkillByName(trimmedTarget)
            .then(skill => setTargetInfo(skill && skill.id ? skill : null))
            .catch(() => setTargetInfo(null));
    };

    const stepForth = () => {
        if (step === STEP_TARGET) {
            loadTargetInfo();
        }
        if (step === STEP_CONFIRM) {
            dispatch(AdminActionCreator.AsyncMergeSkill(props.skillToMerge, trimmedTarget, version) as any);
            props.onClose();
            return;
        }
        setStep(step + 1);
    };

    const stepBack = () => setStep(Math.max(STEP_OVERVIEW, step - 1));

    const renderOverview = () => {
        const consultants = props.skillInfo.map(value => value.getFullName()).join(', ');
        return <div>
            <p>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.Overview', props.skillToMerge)}</p>
            <p>{consultants || PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.NoConsultants')}</p>
        </div>;
    };

    const renderTarget = () => <div>
        <p>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.TargetText', props.skillToMerge)}</p>
        <SkillSearcher
            id="MergeSkillDialog.SkillSearcher"
            label={PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.TargetLabel')}
            initialValue={target}
            value={target}
            onValueChange={setTarget}
            onNewRequest={setTarget}
            resetOnRequest={false}
            fullWidth
        />
        <TextField
            label={PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.VersionLabel')}
            helperText={PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.VersionHelp')}
            value={version}
            onChange={e => setVersion(e.target.value)}
            margin={'normal'}
            fullWidth
        />
        {trimmedTarget === props.skillToMerge
            ? <p className="warning-note">{PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.SameSkill')}</p>
            : null}
    </div>;

    const renderTargetInfo = () => {
        if (targetInfo === undefined) {
            return <p>{PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.TargetLoading')}</p>;
        }
        if (targetInfo === null) {
            return <p className="warning-note">
                {PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.TargetUnknown', trimmedTarget)}
            </p>;
        }
        return <>
            {targetInfo.qualifier !== trimmedTarget
                ? <p>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.TargetIsAlias', trimmedTarget, targetInfo.qualifier)}</p>
                : null}
            <p>
                {PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.TargetHierarchy')}<br/>
                <span className="highlighted-category">{buildHierarchy(targetInfo.category)}</span>
            </p>
        </>;
    };

    const renderConfirm = () => {
        const targetName = targetInfo ? targetInfo.qualifier : trimmedTarget;
        return <div>
            {renderTargetInfo()}
            <p>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.Summary', props.skillToMerge, targetName)}</p>
            {version.trim().length > 0
                ? <p>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.SummaryVersion', version.trim(), targetName)}</p>
                : null}
            <p>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.SummaryTree', props.skillToMerge, targetName)}</p>
            <p className="warning-note">{PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.Irreversible')}</p>
        </div>;
    };

    const renderStep = () => {
        switch (step) {
            case STEP_OVERVIEW:
                return renderOverview();
            case STEP_TARGET:
                return renderTarget();
            default:
                return renderConfirm();
        }
    };

    const nextDisabled = (step === STEP_TARGET && !targetValid) || (step === STEP_CONFIRM && !targetInfo);

    return <Dialog scroll={'body'} open={props.open} onClose={props.onClose} fullWidth maxWidth={'sm'}>
        <DialogTitle>{PowerLocalize.getFormatted('AdminClient.Infos.UsedSkills.Merge.Title', props.skillToMerge)}</DialogTitle>
        <DialogContent>
            <Stepper activeStep={step}>
                <Step><StepLabel>{PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.Step1')}</StepLabel></Step>
                <Step><StepLabel>{PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.Step2')}</StepLabel></Step>
                <Step><StepLabel>{PowerLocalize.get('AdminClient.Infos.UsedSkills.Merge.Step3')}</StepLabel></Step>
            </Stepper>
            {renderStep()}
        </DialogContent>
        <DialogActions>
            {/* The button bar of the forms (#134): Next (Merge in the last step) highlighted, Back and Cancel next to it */}
            <PwrFormActions editing noSpace saveDisabled={nextDisabled}
                            saveText={step === STEP_CONFIRM ? PowerLocalize.get('Action.Merge') : PowerLocalize.get('Action.Next')}
                            saveIcon={step === STEP_CONFIRM ? 'call_merge' : 'arrow_forward'}
                            onSave={stepForth} onCancel={props.onClose}>
                {step !== STEP_OVERVIEW &&
                <PwrButton color={'primary'} text={PowerLocalize.get('Action.Back')} icon={<ArrowBack/>} onClick={stepBack}/>}
            </PwrFormActions>
        </DialogActions>
    </Dialog>;
};

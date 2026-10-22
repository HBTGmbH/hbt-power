import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogTitle, Icon, Radio, RadioGroup, Typography} from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {ViewProfileActionCreator} from '../../../../reducers/view/ViewProfileActionCreator';
import {ViewProfileServiceClient} from '../../../../clients/ViewProfileServiceClient';
import {DisplayCategoryTarget} from '../../../../model/view/DisplayCategoryTarget';
import {ViewCategory} from '../../../../model/view/ViewCategory';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {PwrFormActions} from '../../../general/pwr-form-actions';
import {PwrSpacer} from '../../../general/pwr-spacer_module';

interface MoveAllSkillsDialogProps {
    viewProfileId: string;
    category: ViewCategory;
    categoryIndex: number;

    onClose(): void;
}

/**
 * Moves all skills of a skill category into another one (#171): the categories of the skill tree the skills hang at
 * or below, as a tree like the choice of the display category of a skill (#161), each with the number of skills that
 * fit. A higher category fits all of them, a lower one only those below it.
 */
export const MoveAllSkillsDialog = (props: MoveAllSkillsDialogProps) => {
    const dispatch = useDispatch();
    const initials = useSelector((state: ApplicationState) => state.profileStore.consultant.initials);
    const [targets, setTargets] = useState<Array<DisplayCategoryTarget>>(null);
    const [selected, setSelected] = useState<number>(null);

    useEffect(() => {
        ViewProfileServiceClient.instance().getMoveTargets(initials, props.viewProfileId, props.categoryIndex)
            .then(setTargets)
            // The client shows the error
            .catch(() => props.onClose());
    }, [initials, props.viewProfileId, props.categoryIndex]);

    const move = () => {
        dispatch(ViewProfileActionCreator.AsyncMoveAllSkills(props.viewProfileId, props.categoryIndex, selected));
        props.onClose();
    };

    const title = PowerLocalize.getFormatted('ViewProfileOverview.MoveAll.Title', props.category.name);
    const levelStyle = (depth: number): React.CSSProperties => ({['--pwr-depth' as any]: depth});
    const count = (target: DisplayCategoryTarget) =>
        <Typography variant="body2" color="textSecondary" component="span" className="pwr-category-level-count">
            {PowerLocalize.getFormatted('ViewProfileOverview.MoveAll.Count', target.skills, target.of)}
        </Typography>;

    return <Dialog open onClose={props.onClose} fullWidth maxWidth="sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="textSecondary">
                {PowerLocalize.get('ViewProfileOverview.MoveAll.Description')}
            </Typography>
            <PwrSpacer/>
            {targets &&
            <RadioGroup className="pwr-category-tree" aria-label={title} value={selected == null ? '' : String(selected)}
                        onChange={(e, value) => setSelected(Number(value))}>
                {targets.map(target => target.current
                    ? <div key={target.id} style={levelStyle(target.depth)} className="pwr-category-level pwr-category-level-skill">
                        <span className="pwr-category-skill-marker">
                            <Icon className="material-icons" fontSize="small">folder_open</Icon>
                        </span>
                        <Typography variant="body2" component="span">
                            {PowerLocalize.getFormatted('ViewProfileOverview.MoveAll.Current', target.name)}
                        </Typography>
                    </div>
                    : <div key={target.id} style={levelStyle(target.depth)}
                           className={'pwr-category-level' + (target.id === selected ? ' pwr-category-level-selected' : '')}>
                        <FormControlLabel className="pwr-category-level-label" value={String(target.id)}
                                          control={<Radio color="primary" size="small"/>}
                                          label={target.name}/>
                        {count(target)}
                    </div>)}
            </RadioGroup>}
        </DialogContent>
        <DialogActions>
            <PwrFormActions editing noSpace
                            saveText={PowerLocalize.get('ViewProfileOverview.MoveAll.Move')} saveIcon="drive_file_move"
                            saveDisabled={selected == null}
                            onSave={move} onCancel={props.onClose}/>
        </DialogActions>
    </Dialog>;
};

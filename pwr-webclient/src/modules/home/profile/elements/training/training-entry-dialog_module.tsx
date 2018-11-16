///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {TrainingEntry} from '../../../../../model/TrainingEntry';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {DatePicker} from 'material-ui-pickers';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';

interface TrainingEntryDialogProps {
    /**
     * The element that is rendered in this module.
     */
    trainingEntry: TrainingEntry;

    /**
     * All possible educations by their ids.
     */
    trainings: Immutable.Map<string, NameEntity>;

    open: boolean;

    /**
     * Invoked when the save button is pressed.
     * @param trainingEntry
     * @param nameEntity
     */
    onSave(trainingEntry: TrainingEntry, nameEntity: NameEntity): void;

    /**
     * Invoked when that thing is supposed to be closed.
     */
    onClose(): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface TrainingEntryDialogState {
    trainingEntryValue: string;
    trainingEntry: TrainingEntry;
}


export class TrainingEntryDialog extends React.Component<TrainingEntryDialogProps, TrainingEntryDialogState> {

    constructor(props: TrainingEntryDialogProps) {
        super(props);
        this.state = {
            trainingEntryValue: this.getEducationEntryName(),
            trainingEntry: props.trainingEntry
        };
    }

    private getEducationEntryName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.trainingEntry.trainingId(), this.props.trainings);
    };


    private closeDialog = () => {
        this.props.onClose();
    };

    private handleChangeEndDate = (date) => {
        this.setState({
            trainingEntry: this.state.trainingEntry.endDate(date)
        });
    };

    private handleChangeStartDate = (date) => {
        this.setState({
            trainingEntry: this.state.trainingEntry.startDate(date)
        });
    };

    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     */
    private handleEducationFieldInput = (searchText: string) => {
        this.setState({trainingEntryValue: searchText});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        let name: string = this.state.trainingEntryValue;
        let training: NameEntity = ProfileStore.findNameEntityByName(name, this.props.trainings);
        let sectorEntry: TrainingEntry = this.state.trainingEntry;
        // check if a sector with the name exists. If thats not the case, just create a new run. Server will handle the rest.
        if (isNullOrUndefined(training)) {
            training = NameEntity.createNew(name);
        }
        sectorEntry = sectorEntry.trainingId(training.id());
        this.props.onSave(sectorEntry, training);
        this.closeDialog();
    };


    render() {
        return (
            <Dialog
                open={this.props.open}
                fullWidth={true}
                onClose={this.closeDialog}
                title={PowerLocalize.get('TrainingEntry.Dialog.Title')}
                scroll={'paper'}
                id="TrainingEntry.Dialog"
            >
                <DialogTitle id="TrainingEntry.Dialog.Title">
                    {PowerLocalize.get('TrainingEntry.Dialog.Title')}
                </DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col-md-5">
                            <DatePicker
                                label={PowerLocalize.get('Begin')}
                                id={'TrainingEntry.Dialog.StartDate' + this.props.trainingEntry.id}
                                value={this.state.trainingEntry.startDate()}
                                onChange={this.handleChangeStartDate}
                                showTodayButton
                                todayLabel={PowerLocalize.get('Today')}
                            />
                        </div>
                        <div className="col-md-5">
                            <DatePicker
                                label={PowerLocalize.get('End')}
                                id={'TrainingEntry.Dialog.EndDate' + this.props.trainingEntry.id}
                                value={this.state.trainingEntry.endDate()}
                                onChange={this.handleChangeEndDate}
                                showTodayButton
                                todayLabel={PowerLocalize.get('Today')}
                            />
                        </div>
                    </div>
                    <PwrSpacer/>
                    <div className="row">
                        <div className="col-md-5">
                            <PwrAutoComplete
                                fullWidth={true}
                                label={PowerLocalize.get('Training.Singular')}
                                id={'TrainingEntry.Dialog.Value.' + this.props.trainingEntry.id}
                                data={this.props.trainings.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.trainingEntryValue}
                                onSearchChange={this.handleEducationFieldInput}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <PwrIconButton iconName={'save'} tooltip={PowerLocalize.get('Action.Save')}
                                   onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton iconName={'close'} tooltip={PowerLocalize.get('Action.Exit')}
                                   onClick={this.handleCloseButtonPress}/>
                </DialogActions>
            </Dialog>
        );
    }
}


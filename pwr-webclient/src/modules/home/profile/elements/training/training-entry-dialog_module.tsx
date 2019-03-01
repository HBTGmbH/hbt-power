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
import {PwrYearPicker} from '../../../../general/pwr-year-picker';
import {PwrError, PwrErrorType} from '../../../../general/pwr-error_module';

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
    dateError:PwrErrorType;
}


export class TrainingEntryDialog extends React.Component<TrainingEntryDialogProps, TrainingEntryDialogState> {

    constructor(props: TrainingEntryDialogProps) {
        super(props);
        this.state = {
            trainingEntryValue: this.getEducationEntryName(),
            trainingEntry: props.trainingEntry,
            dateError:null,
        };
    }

    public componentDidUpdate(){
        this.checkDates();
    }
    private getEducationEntryName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.trainingEntry.trainingId(), this.props.trainings);
    };


    private closeDialog = () => {
        this.props.onClose();
    };

    private setError = (error: PwrErrorType) => {
        if (this.state.dateError !== error) {
            this.setState({
                dateError: error,
            });
        }
    };

    private checkDates = () => {
        const endDate = this.state.trainingEntry.endDate();
        const startDate = this.state.trainingEntry.startDate();
        if (endDate < startDate) {
            this.setError(PwrErrorType.DATE_START_AFTER_END);
        } else {
            this.setError(null);
        }
    };

    private handleChangeEndDate = (date) => {
        this.setState({
            trainingEntry: this.state.trainingEntry.endDate(date)
        });
    };

    private handleChangeStartDate = (date:Date) => {
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
        console.log("Date in State  : "+this.state.trainingEntry.startDate());
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
                    <div className={"row"}>
                        <div className={"col-md-12"}>
                            <PwrError error={this.state.dateError}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-5">
                            <PwrYearPicker onChange={this.handleChangeStartDate} placeholderDate={this.state.trainingEntry.startDate()} label={"Start"}/>
                        </div>
                        <div className="col-md-5">
                            <PwrYearPicker onChange={this.handleChangeEndDate} placeholderDate={this.state.trainingEntry.endDate()} label={"Ende"}/>
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
                    <PwrIconButton iconName={'save'} tooltip={PowerLocalize.get('Action.Save')} disabled={!!this.state.dateError}
                                   onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton iconName={'close'} tooltip={PowerLocalize.get('Action.Exit')}
                                   onClick={this.handleCloseButtonPress}/>
                </DialogActions>
            </Dialog>
        );
    }
}


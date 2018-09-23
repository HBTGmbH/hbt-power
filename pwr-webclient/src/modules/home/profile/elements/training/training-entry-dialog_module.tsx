///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog, IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {TrainingEntry} from '../../../../../model/TrainingEntry';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import TextField from '@material-ui/core/TextField/TextField';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';

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

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleChangeEndDate = (event: any, date: Date) => {
        this.setState({
            trainingEntry: this.state.trainingEntry.endDate(date)
        });
    };

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleChangeStartDate = (event: any, date: Date) => {
        this.setState({
            trainingEntry: this.state.trainingEntry.startDate(date)
        });
    };

    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     * @param dataSource useless
     */
    private handleEducationFieldInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({trainingEntryValue: searchText});
    };

    private handleEducationFieldRequest = (chosenRequest: string, index: number) => {
        this.setState({trainingEntryValue: chosenRequest});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        let name: string = this.state.trainingEntryValue;
        let training: NameEntity = ProfileStore.findNameEntityByName(name, this.props.trainings);
        let sectorEntry: TrainingEntry = this.state.trainingEntry;
        // check if a sector with the name exists. If thats not the case, just create a new run. Server will handle the rest.
        if(isNullOrUndefined(training)) {
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
                //modal={false}
                onClose={this.closeDialog}
                title={PowerLocalize.get('TrainingEntry.Dialog.Title')}
                scroll={'paper'}
            >
                <DialogTitle>
                    <Typography >{PowerLocalize.get('TrainingEntry.Dialog.Title')}</Typography>
                </DialogTitle>
                <DialogContent>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                                {/* TODO DatePicker*/}
                                <TextField
                                    label={PowerLocalize.get('Begin')}
                                    id={'TrainingEntry.StartDate' + this.props.trainingEntry.id}
                                    //container="inline"
                                    value={this.state.trainingEntry.startDate().toISOString().split('T')[0]}
                                    onChange={() => this.handleChangeStartDate}
                                    //formatDate={formatToShortDisplay}
                                    type="date"
                                />
                            </div>
                            <div className="col-md-5 col-sm-6">
                                {/* TODO DatePicker*/}
                                <TextField
                                    label={PowerLocalize.get('End')}
                                    id={'TrainingEntry.EndDate' + this.props.trainingEntry.id}
                                    // container="inline"
                                    value={this.state.trainingEntry.endDate().toISOString().split('T')[0]}
                                    onChange={() => this.handleChangeEndDate}
                                    // formatDate={formatToShortDisplay}
                                    type="date"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                {/*} TODO <AutoComplete
                                    label={PowerLocalize.get('Training.Singular')}
                                    id={'TrainingEntry.Dialog.AC.' + this.props.trainingEntry.id}
                                    value={this.state.trainingEntryValue}
                                    searchText={this.state.trainingEntryValue}
                                    dataSource={this.props.trainings.map(NameEntityUtil.mapToName).toArray()}
                                    onUpdateInput={this.handleEducationFieldInput}
                                    onNewRequest={this.handleEducationFieldRequest}
                                    filter={AutoComplete.fuzzyFilter}
                                />*/}
                                <TextField
                                    label={PowerLocalize.get('Training.Singular')}
                                    id={'TrainingEntry.Dialog.AC.' + this.props.trainingEntry.id}
                                    value={this.state.trainingEntryValue}
                                />
                            </div>
                        </div>
                </DialogContent>
                <DialogActions>
                    <Tooltip title={PowerLocalize.get('Action.Save')}>
                        <IconButton className="material-icons icon-size-20" onClick={this.handleSaveButtonPress} >save</IconButton>
                    </Tooltip>
                    <Tooltip title={PowerLocalize.get('Action.Exit')}>
                        <IconButton className="material-icons icon-size-20" onClick={this.handleCloseButtonPress} >close</IconButton>
                    </Tooltip>

                </DialogActions>
            </Dialog>
        );
    }
}


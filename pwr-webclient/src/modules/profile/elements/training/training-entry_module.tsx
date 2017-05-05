import * as React from 'react';
import {AutoComplete, Checkbox, DatePicker, IconButton, Paper, TextField} from 'material-ui';
import * as Immutable from 'immutable';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {TrainingEntry} from '../../../../model/TrainingEntry';
import {NameEntity} from '../../../../model/NameEntity';

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface TrainingEntryLocalProps {
    /**
     * The element that is rendered in this module.
     */
    trainingEntry: TrainingEntry;

    /**
     * Array of possible {@link Training} by their ID.
     */
    trainings: Immutable.Map<string, NameEntity>;

    /**
     * Callback given to this career step module to be called whenever the start date
     * value of the provided {@link TrainingEntry} changes.
     * @param newDate the new Date for the startDate field
     * @param elementId the ID of the {@link TrainingEntry} that was provided.
     */
    onStartDateChange(newDate: Date, elementId: string): void;

    /**
     * Callback given to this career step module to be called whenever the end date
     * value of the provided {@link TrainingEntry} changes.
     * @param newDate the new Date for the endDate field
     * @param elementId the ID of the {@link TrainingEntry} that was provided.
     */
    onEndDateChange(newDate: Date, elementId: string): void;

    /**
     * Callback given to this career step module to be called whenever the {@link TrainingEntry.trainingId}
     * should change. This is the case when:
     * A) The {@link Training} has been selected in the AutoComplete dropdown
     * B) The {@link Training.name} has been correctly typed into the input field and enter was pressed
     * @param newCareerId the new career id that is supposed to be associated with the {@link TrainingEntry} represented
     * by this module.
     * @param elementId the {@link TrainingEntry.id} of this module.
     */
    onCareerChange(newCareerId: string, elementId: string): void;

    /**
     * Callback given to this module to be called whenever the delete button is being pressed.
     * @param elementId the {@link TrainingEntry.id} of the element associated with this module.
     */
    onDelete(elementId: string): void;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface TrainingEntryState {
    /**
     * The current value in the autocomplete-input field. This is not the value that is persisted.
     * FIXME find a way to couple this to redux without introducing it into the state so that the field correctly re-renders when the update is called.
     */
    autoCompleteValue: string,
    /**
     * Autocomplete input on/off.
     */
    editDisabled: boolean
    showEndDatePicker: boolean
}


/**
 * Represents a single {@link TrainingEntry> while providing ways to edit:
 * - the start date
 * - the end date
 * - the career name associated with the element by changing the ID.
 *
 * Dates may be changed at any time by usage of the date picker, which already provides a way to avoid unwanted modifications.
 *
 * The {@link Training} may be changing after pressing the edit symbol. Only one of the available {@link Training} may
 * be used as a replacement for an existing name.
 * If an invalid string is entered in the input field, and the input is finalized by pressing enter or disabling the edit mode,
 * the input fields value will hop back to the original value, and the input field will be disabled.
 * If a valid value is selected through all available means, the input field will be disabled and the value used as new
 * {@link Training}
 */
export class SingleTrainingEntry extends React.Component<TrainingEntryLocalProps, TrainingEntryState> {

    constructor(props: TrainingEntryLocalProps) {
        super(props);
        // only show the date picker when there is a date.
        let showDatePicker = props.trainingEntry.endDate != null;
        this.state = {
            autoCompleteValue: this.getCareerPositionName(),
            editDisabled: true,
            showEndDatePicker: showDatePicker
        };
    }


    /**
     * Null-tolerant accessor to the {@link Training.name} field of the career name
     * that is linked in {@link TrainingEntry.trainingId}
     * @returns the name or an empty string when no name exists.
     */
    private getCareerPositionName = () => {
        return this.props.trainingEntry.trainingId == null
            ? ""
            : this.props.trainings.get(this.props.trainingEntry.trainingId).name;
    };
    /**
     * Handles change of the start date DatePicker
     * @param event is always undefined as to material-ui docs
     * @param date new date
     */
    private handleStartDateChange = (event: any, date: Date) => {
        // Hello callback!
        this.props.onStartDateChange(date, this.props.trainingEntry.id);
    };

    /**
     * Handles change of the end date DatePicker
     * @param event is always undefined as to material-ui docs
     * @param date
     */
    private handleEndDateChange = (event: any, date: Date) => {
        // Hello Callback!
        this.props.onEndDateChange(date, this.props.trainingEntry.id);
    };

    /**
     * Handles all input received from the AutoComplete input field.
     * @param searchText the current text that is present in the input field
     * @param dataSource
     */
    private handleAutoCompleteUpdateInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({autoCompleteValue: searchText});
    };

    /**
     * Handles an auto complete request. An auto complete request is invoked when pressing enter in
     * the input field or clicking on one of the suggestions.
     * @param chosenRequest is the value that had been choosen
     * @param index of the element, respective to {@link this.autoCompleteValues} (the datasource given to the AutoComplete)
     */
    private handleAutoCompleteNewRequest = (chosenRequest: any, index: number) => {
        if(index >= 0) {
            this.props.onCareerChange(chosenRequest.id, this.props.trainingEntry.id);
            this.setState({
                editDisabled: true
            });
        } else {
            console.log(chosenRequest);
            this.setState({
                autoCompleteValue: this.getCareerPositionName()
            });
        }
    };

    private handleSaveButtonClick = () => {
        this.setState({
            editDisabled: true
        });
    };

    private handleClickTapField = () => {
        this.setState({
            editDisabled: false
        })
    };

    private handleDeleteModule = () => {
        this.props.onDelete(this.props.trainingEntry.id);
    };

    private handleToggleDatePicker = () => {
        let show: boolean = !this.state.showEndDatePicker;
        this.setState({
            showEndDatePicker: show
        });
        if(show) {
            this.props.onEndDateChange(new Date(), this.props.trainingEntry.id);
        } else {
            this.props.onEndDateChange(null, this.props.trainingEntry.id);
        }
    };


    render() {

        return(
            <tr>
                <td>
                <Paper className="row">
                    <div className="col-md-1">
                        <IconButton iconClassName="material-icons" onClick={this.handleSaveButtonClick} tooltip={PowerLocalize.get('Action.Lock')}>lock</IconButton>
                        <IconButton iconClassName="material-icons" onClick={this.handleDeleteModule} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                    </div>
                    <div className="col-md-3">
                        <div className="fittingContainer" onTouchStart={this.handleClickTapField} onClick={this.handleClickTapField}>
                            <DatePicker
                                id={'C.DatePick.Start' +  this.props.trainingEntry.id}
                                container="inline"
                                value={this.props.trainingEntry.startDate}
                                onChange={this.handleStartDateChange}
                                formatDate={formatToShortDisplay}
                                disabled={this.state.editDisabled}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="fittingContainer" onTouchStart={this.handleClickTapField} onClick={this.handleClickTapField}>
                            <div className="row">
                                <div className="col-md-11">
                            {
                                this.props.trainingEntry.endDate != null?
                                    (
                                        <div>
                                            <DatePicker
                                                id={'C.DatePick.End' + this.props.trainingEntry.id}
                                                container="inline"
                                                value={this.props.trainingEntry.endDate}
                                                onChange={this.handleEndDateChange}
                                                formatDate={formatToShortDisplay}
                                                disabled={this.state.editDisabled}
                                            />
                                        </div>
                                    )
                                :
                                    (
                                        <div>
                                            <TextField disabled={true} id={'TrainingEntries.CareerStep.TextField' + this.props.trainingEntry.id} value= {PowerLocalize.get('Today')}/>
                                        </div>
                                    )
                            }
                                </div>
                                <div className="col-md-1">
                                    <Checkbox
                                        disabled={this.state.editDisabled}
                                        checked={this.props.trainingEntry.endDate != null}
                                        onCheck={this.handleToggleDatePicker}
                                        onClick={this.handleClickTapField}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="fittingContainer" onTouchStart={this.handleClickTapField} onClick={this.handleClickTapField}>
                            <AutoComplete
                                id={'TrainingEntries.Autocomplete.' + this.props.trainingEntry.id}
                                value={this.state.autoCompleteValue}
                                dataSourceConfig={{text:'name', value:'id'}}
                                dataSource={new Array(this.props.trainings.values())}
                                onUpdateInput={this.handleAutoCompleteUpdateInput}
                                onNewRequest={this.handleAutoCompleteNewRequest}
                                disabled={this.state.editDisabled}
                                filter={AutoComplete.noFilter}
                            />
                        </div>
                    </div>
                </Paper>
                </td>
            </tr>
        );
    }
}

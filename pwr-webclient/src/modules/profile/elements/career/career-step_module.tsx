import * as React from 'react';
import {AutoComplete, DatePicker, IconButton, TextField} from 'material-ui';
import {CareerElement} from '../../../../model/CareerElement';
import {CareerPosition} from '../../../../model/CareerPosition';
import * as Immutable from 'immutable';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../utils/DateUtil';

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface CareerStepLocalProps {
    /**
     * The element that is rendered in this module.
     */
    careerElement: CareerElement;

    /**
     * Array of possible career positions by their ID.
     */
    careerPositions: Immutable.Map<number, CareerPosition>;

    /**
     * Callback given to this career step module to be called whenever the start date
     * value of the provided {@link CareerElement} changes.
     * @param newDate the new Date for the startDate field
     * @param elementId the ID of the {@link CareerElement} that was provided.
     */
    onStartDateChange(newDate: Date, elementId: number): void;

    /**
     * Callback given to this career step module to be called whenever the end date
     * value of the provided {@link CareerElement} changes.
     * @param newDate the new Date for the endDate field
     * @param elementId the ID of the {@link CareerElement} that was provided.
     */
    onEndDateChange(newDate: Date, elementId: number): void;

    /**
     * Callback given to this career step module to be called whenever the {@link CareerElement.careerPositionId}
     * should change. This is the case when:
     * A) The {@link CareerPosition} has been selected in the AutoComplete dropdown
     * B) The {@link CareerPosition.position} has been correctly typed into the input field and enter was pressed
     * @param newCareerId the new career id that is supposed to be associated with the {@link CareerElement} represented
     * by this module.
     * @param elementId the {@link CareerElement.id} of this module.
     */
    onCareerChange(newCareerId: number, elementId: number): void;

    /**
     * Callback given to this module to be called whenever the delete button is being pressed.
     * @param elementId the {@link CareerElement.id} of the element associated with this module.
     */
    onDelete(elementId: number): void;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface CareerStepState {
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
 * Represents a single {@link CareerElement> while providing ways to edit:
 * - the start date
 * - the end date
 * - the career position associated with the element by changing the ID.
 *
 * Dates may be changed at any time by usage of the date picker, which already provides a way to avoid unwanted modifications.
 *
 * The {@link CareerPosition} may be changing after pressing the edit symbol. Only one of the available {@link CareerPosition} may
 * be used as a replacement for an existing position.
 * If an invalid string is entered in the input field, and the input is finalized by pressing enter or disabling the edit mode,
 * the input fields value will hop back to the original value, and the input field will be disabled.
 * If a valid value is selected through all available means, the input field will be disabled and the value used as new
 * {@link CareerPosition}
 */
export class SingleCareerElement extends React.Component<CareerStepLocalProps, CareerStepState> {

    /**
     * TODO remove this once facebook decides to fully support map rendering of JSX Elements.
     * Values used for autocompletion. This is necessary because map-rendering is not entirely supported.
     */
    private autoCompleteValues: Array<CareerPosition>;

    constructor(props: CareerStepLocalProps) {
        super(props);
        this.autoCompleteValues = props.careerPositions.map((val, key) => val).toArray();
        // only show the date picker when there is a date.
        let showDatePicker = props.careerElement.endDate != null;
        this.state = {
            autoCompleteValue: props.careerPositions.get(props.careerElement.careerPositionId).position,
            editDisabled: true,
            showEndDatePicker: showDatePicker
        }
    }

    /**
     * Handles change of the start date DatePicker
     * @param event is always undefined as to material-ui docs
     * @param date new date
     */
    private handleStartDateChange = (event: any, date: Date) => {
        // Hello callback!
        this.props.onStartDateChange(date, this.props.careerElement.id);
    };

    /**
     * Handles change of the end date DatePicker
     * @param event is always undefined as to material-ui docs
     * @param date
     */
    private handleEndDateChange = (event: any, date: Date) => {
        // Hello Callback!
        this.props.onEndDateChange(date, this.props.careerElement.id);
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
    private handleAutoCompleteNewRequest = (chosenRequest: string, index: number) => {
        if(index >= 0) {
            this.props.onCareerChange(this.autoCompleteValues[index].id, this.props.careerElement.id);
            this.setState({
                editDisabled: true
            })
        } else {
            this.setState({
                autoCompleteValue: this.props.careerPositions.get(this.props.careerElement.careerPositionId).position
            })
        }
    };

    /**
     * Handles button presses on the Edit Button.
     */
    private handleToggleEdit = () => {
        this.setState({editDisabled: !this.state.editDisabled});
        if(!this.state.editDisabled) {
            // Assure that there is no invalid data within the edit field.
            // This is a view-only ensurance, as only validate data will be passed to redux.
            // By using this, confusion on the users end is avoided
            this.setState({
                autoCompleteValue: this.props.careerPositions.get(this.props.careerElement.careerPositionId).position
            })
        }
    };

    private handleDeleteModule = () => {
        this.props.onDelete(this.props.careerElement.id);
    };

    private handleDisableEndDatePicker = () => {
        this.props.onEndDateChange(null, this.props.careerElement.id);
        this.setState({
            showEndDatePicker: false
        })
    };

    private handleEnableEndDatePicker = () => {
        this.props.onEndDateChange(new Date(), this.props.careerElement.id);
        this.setState({
            showEndDatePicker: true
        })
    };

    render() {

        return(
            <tr>
                <td>
                    <DatePicker
                        id={'C.DatePick.Start' +  this.props.careerElement.id}
                        container="inline"
                        value={this.props.careerElement.startDate}
                        onChange={this.handleStartDateChange}
                        formatDate={formatToShortDisplay}
                        disabled={this.state.editDisabled}
                    />
                </td>
                <td>
                    {
                        this.state.showEndDatePicker?
                            (
                                <div className="row">
                                    <DatePicker
                                        id={'C.DatePick.End' + this.props.careerElement.id}
                                        container="inline"
                                        value={this.props.careerElement.endDate}
                                        onChange={this.handleEndDateChange}
                                        formatDate={formatToShortDisplay}
                                        disabled={this.state.editDisabled}
                                    />
                                    <IconButton iconClassName="material-icons"
                                                tooltip={PowerLocalize.get('Today')}
                                                onClick={this.handleDisableEndDatePicker}
                                    >today</IconButton>
                                </div>
                            )
                        :
                            (
                                <div>
                                    <TextField value= {PowerLocalize.get("Today")}/>

                                    <IconButton
                                        iconClassName="material-icons"
                                        tooltip={PowerLocalize.get('Date.Singular')}
                                        onClick={this.handleEnableEndDatePicker}
                                    >date_range</IconButton>
                                </div>
                            )
                    }
                </td>
                <td>
                    <AutoComplete
                        id={"Career.Autocomplete." + this.props.careerElement.id}
                        value={this.state.autoCompleteValue}
                        dataSourceConfig={{text:'position', value:'id'}}
                        dataSource={this.autoCompleteValues}
                        onUpdateInput={this.handleAutoCompleteUpdateInput}
                        onNewRequest={this.handleAutoCompleteNewRequest}
                        disabled={this.state.editDisabled}
                    />
                    <IconButton iconClassName="material-icons" onClick={this.handleToggleEdit} tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                    <IconButton iconClassName="material-icons" onClick={this.handleDeleteModule} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                </td>
            </tr>
        );
    }
}

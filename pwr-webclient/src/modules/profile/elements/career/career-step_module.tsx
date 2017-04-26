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
     * FIXME comment
     * @param newCareerId
     * @param elementId
     */
    onCareerChange(newCareerId: number, elementId: number): void;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface CareerStepState {
    autoCompleteValue: string,
    autoCompleteDisabled: boolean
}


export class SingleCareerElement extends React.Component<CareerStepLocalProps, CareerStepState> {

    private autoCompleteValues: Array<CareerPosition>;

    constructor(props: CareerStepLocalProps) {
        super(props);
        this.autoCompleteValues = props.careerPositions.map((val, key) => val).toArray();
        this.state = {
            autoCompleteValue: props.careerPositions.get(props.careerElement.careerPositionId).position,
            autoCompleteDisabled: true
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

    private handleEndDateChange = (event: any, date: Date) => {
        // Hello Callback!
        this.props.onEndDateChange(date, this.props.careerElement.id);
    };

    private handleAutoCompleteUpdateInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({autoCompleteValue: searchText});
    };

    private handleAutoCompleteNewRequest = (chosenRequest: string, index: number) => {
        if(index >= 0) {
            this.props.onCareerChange(this.autoCompleteValues[index].id, this.props.careerElement.id);
            this.setState({
                autoCompleteDisabled: true
            })
        } else {
            this.setState({
                autoCompleteValue: this.props.careerPositions.get(this.props.careerElement.careerPositionId).position
            })
        }
    };

    private handleToggleEdit = () => {
        this.setState({autoCompleteDisabled: !this.state.autoCompleteDisabled});
        if(!this.state.autoCompleteDisabled) {
            // Assure that there is no invalid data within the edit field.
            // This is a view-only ensurance, as only validate data will be passed to redux.
            // By using this, confusion on the users end is avoided
            this.setState({
                autoCompleteValue: this.props.careerPositions.get(this.props.careerElement.careerPositionId).position
            })
        }
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
                    />
                </td>
                <td>
                    <DatePicker
                        id={'C.DatePick.End' + this.props.careerElement.id}
                        container="inline"
                        value={this.props.careerElement.endDate}
                        onChange={this.handleEndDateChange}
                        formatDate={formatToShortDisplay}
                    />
                </td>
                <td>
                    <AutoComplete
                        id={"Career.Autocomplete." + this.props.careerElement.id}
                        value={this.state.autoCompleteValue}
                        dataSourceConfig={{text:'position', value:'id'}}
                        dataSource={this.autoCompleteValues}
                        onUpdateInput={this.handleAutoCompleteUpdateInput}
                        onNewRequest={this.handleAutoCompleteNewRequest}
                        disabled={this.state.autoCompleteDisabled}
                    />
                    <IconButton iconClassName="material-icons" onClick={this.handleToggleEdit} tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                </td>
            </tr>
        );
    }
}

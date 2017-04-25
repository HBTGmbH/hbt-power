import * as React from 'react';
import {DatePicker, TextField} from 'material-ui';
import {CareerElement} from '../../../../model/CareerElement';
import {CareerPosition} from '../../../../model/CareerPosition';


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
    careerPositionsById: Array<CareerPosition>;

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
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface CareerStepState {

}


export class SingleCareerElement extends React.Component<CareerStepLocalProps, CareerStepState> {

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

    render() {
        return(
            <tr key={'Career.' + this.props.careerElement.id} >
                <td>
                    <DatePicker
                        id={'C.DatePick.Start' +  this.props.careerElement.id}
                        container="inline"
                        value={this.props.careerElement.startDate}
                        onChange={this.handleStartDateChange}
                    />
                </td>
                <td>
                    <DatePicker
                        id={'C.DatePick.End' + this.props.careerElement.id}
                        container="inline"
                        value={this.props.careerElement.endDate}
                        onChange={this.handleEndDateChange}
                    />
                </td>
                <td>
                    <TextField id={'Career.TextField.' + this.props.careerElement.id}
                               value={this.props.careerPositionsById[this.props.careerElement.careerPositionId].position}
                               disabled={true}
                    />
                </td>
            </tr>
        );
    }
}

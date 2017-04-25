import * as React from 'react';
import {DatePicker, TextField} from 'material-ui';
import {EducationEntry} from '../../../../model/EducationEntry';
import {Education} from '../../../../model/Education';


/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface EducationEntryLocalProps {
    /**
     * The element that is rendered in this module.
     */
    educationEntry: EducationEntry;

    /**
     * Array of possible educations by their ID.
     */
    educationsById: Array<Education>;

    /**
     * Callback that is invoked when this modules DatePicker's value changes to a new date.
     * Also gives back the ID to of the {@link EducationEntry} given to this module.
     * @param newDate
     * @param id
     */
    onDateChange(newDate: Date, id: number): void;

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface EducationEntryState {
}


export class SingleEducationElement extends React.Component<EducationEntryLocalProps, EducationEntryState> {


    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleDateChange = (event: any, date: Date) => {
        // Hello Callback \o/!
        this.props.onDateChange(date, this.props.educationEntry.id);
    };


    render() {
        return(
            <tr key={"Education." + this.props.educationEntry.id} >
                <td>
                    <DatePicker
                        id={"Education.DatePicker." + this.props.educationEntry.id}
                        container="inline"
                        value={this.props.educationEntry.date}
                        onChange={this.handleDateChange}
                    />
                </td>
                <td>
                    <TextField
                        id={"Education.TextField." + this.props.educationEntry.id}
                        value={this.props.educationsById[this.props.educationEntry.educationId].name}
                        fullWidth={true}
                        disabled={true}
                    />
                </td>
            </tr>
        );
    }
}

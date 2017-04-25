import * as React from 'react';
import {DatePicker, TextField} from 'material-ui';
import {EducationEntry} from '../../../../model/EducationEntry';
import {Education} from '../../../../model/Education';
import {QualificationEntry} from '../../../../model/QualificationEntry';
import {Qualification} from '../../../../model/Qualification';
import * as Immutable from 'immutable';


/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface QualificationEntryLocalProps {
    /**
     * The element that is rendered in this module.
     */
    qualificationEntry: QualificationEntry;

    /**
     * Array of possible educations by their ID.
     */
    qualifications: Immutable.Map<number, Qualification>;

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
interface QualificationEntryState {

}


export class SingleQualificationEntry extends React.Component<QualificationEntryLocalProps, QualificationEntryState> {


    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleDateChange = (event: any, date: Date) => {
        // Hello Callback \o/!
        this.props.onDateChange(date, this.props.qualificationEntry.id);
    };


    render() {
        return(
            <tr>
                <td>
                    <DatePicker
                        id={"Education.DatePicker." + this.props.qualificationEntry.id}
                        container="inline"
                        value={this.props.qualificationEntry.date}
                        onChange={this.handleDateChange}
                    />
                </td>
                <td>
                    <TextField
                        id={"Education.TextField." + this.props.qualificationEntry.id}
                        value={this.props.qualifications.get(this.props.qualificationEntry.qualificationId).name}
                        fullWidth={true}
                        disabled={true}
                    />
                </td>
            </tr>
        );
    }
}

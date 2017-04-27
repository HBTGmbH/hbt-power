import * as React from 'react';
import {AutoComplete, DatePicker, IconButton, TextField, TouchTapEvent} from 'material-ui';
import {EducationEntry} from '../../../../model/EducationEntry';
import {Education} from '../../../../model/Education';
import * as Immutable from 'immutable';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../utils/DateUtil';


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
     * All possible educations by their ids.
     */
    educations: Immutable.Map<number, Education>;

    /**
     * Callback that is invoked when this modules DatePicker's value changes to a new date.
     * Also gives back the ID to of the {@link EducationEntry} given to this module.
     * @param newDate
     * @param id
     */
    onDateChange(newDate: Date, id: number): void;

    /**
     * Callback that is invoked when thos modules autocomplete value is changed to a valid
     * education.
     * @param newEducationId
     * @param id of the education entry initially given to this module.
     */
    onEducationChange(newEducationId: number, id: number): void;

    /**
     * Fixme document
     * @param id
     */
    onDelete(id: number): void;

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface EducationEntryState {
    autoCompleteValue: string;
    autoCompleteDisabled: boolean;
}


export class SingleEducationElement extends React.Component<EducationEntryLocalProps, EducationEntryState> {

    private autoCompleteValues: Array<Education>;

    constructor(props: EducationEntryLocalProps) {
        super(props);
        this.autoCompleteValues = props.educations.map((k, v) => {return k}).toArray();
        this.state = {
            autoCompleteValue: this.props.educations.get(this.props.educationEntry.educationId).name,
            autoCompleteDisabled: true
        };
    }

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleDateChange = (event: any, date: Date) => {
        // Hello Callback \o/!
        this.props.onDateChange(date, this.props.educationEntry.id);
    };

    private handleAutoCompleteUpdateInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({autoCompleteValue: searchText});
    };

    private handleAutoCompleteNewRequest = (chosenRequest: string, index: number) => {
        if(index >= 0) {
            this.props.onEducationChange(this.autoCompleteValues[index].id, this.props.educationEntry.id);
            this.setState({
                autoCompleteDisabled: true
            })
        } else {
            this.setState({
                autoCompleteValue: this.props.educations.get(this.props.educationEntry.educationId).name
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
                autoCompleteValue: this.props.educations.get(this.props.educationEntry.educationId).name
            })
        }
    };

    private handleDeleteButtonPress = (event: TouchTapEvent) => {
        this.props.onDelete(this.props.educationEntry.id);
    };

    render() {
        return(
            <tr>
                <td>
                    <DatePicker
                        id={"Education.DatePicker." + this.props.educationEntry.id}
                        container="inline"
                        value={this.props.educationEntry.date}
                        onChange={this.handleDateChange}
                        formatDate={formatToShortDisplay}
                    />
                </td>
                <td>
                    <AutoComplete
                        id={"Education.Autocomplete." + this.props.educationEntry.id}
                        value={this.state.autoCompleteValue}
                        dataSourceConfig={{text:'name', value:'id'}}
                        dataSource={this.autoCompleteValues}
                        onUpdateInput={this.handleAutoCompleteUpdateInput}
                        onNewRequest={this.handleAutoCompleteNewRequest}
                        disabled={this.state.autoCompleteDisabled}
                    />
                    <IconButton iconClassName="material-icons" onClick={this.handleToggleEdit} tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                    <IconButton iconClassName="material-icons" onClick={this.handleDeleteButtonPress} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                </td>
            </tr>
        );
    }
}

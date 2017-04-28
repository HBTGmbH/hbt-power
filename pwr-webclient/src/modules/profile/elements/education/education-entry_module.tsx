import * as React from 'react';
import {AutoComplete, DatePicker, IconButton, Paper, TextField, TouchTapEvent} from 'material-ui';
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
     * Invoked when the {@link EducationEntry} associated with this module is supposed to be deleted.
     * @param id {@link EducationEntry.id} of the entry that is supposed to be deleted.
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
    editDisabled: boolean;
}


export class SingleEducationElement extends React.Component<EducationEntryLocalProps, EducationEntryState> {

    private autoCompleteValues: Array<Education>;

    constructor(props: EducationEntryLocalProps) {
        super(props);
        this.autoCompleteValues = props.educations.map((k, v) => {return k}).toArray();
        this.state = {
            autoCompleteValue: this.props.educations.get(this.props.educationEntry.educationId).name,
            editDisabled: true
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

    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     * @param dataSource useless
     */
    private handleAutoCompleteUpdateInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({autoCompleteValue: searchText});
    };

    private handleAutoCompleteNewRequest = (chosenRequest: string, index: number) => {
        if(index >= 0) {
            this.props.onEducationChange(this.autoCompleteValues[index].id, this.props.educationEntry.id);
            this.setState({
                editDisabled: true
            })
        } else {
            this.setState({
                autoCompleteValue: this.props.educations.get(this.props.educationEntry.educationId).name
            })
        }
    };

    private handleFieldTouchClick = (event: TouchTapEvent) => {
        this.setState({
            editDisabled: false
        })
    };

    private handleSaveButtonPress = (event: TouchTapEvent) => {
        this.setState({
            editDisabled: false
        })
    };

    private handleDeleteButtonPress = (event: TouchTapEvent) => {
        this.props.onDelete(this.props.educationEntry.id);
    };

    render() {
        return(
            <tr>
                <td>
                    <Paper className="row">
                        <div className="col-md-1">
                            <IconButton iconClassName="material-icons" onClick={this.handleSaveButtonPress} tooltip={PowerLocalize.get('Action.Save')}>save</IconButton>
                            <IconButton iconClassName="material-icons" onClick={this.handleDeleteButtonPress} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                        </div>
                        <div className="col-md-5">
                            <div className="fittingContainer" onTouchStart={this.handleFieldTouchClick} onClick={this.handleFieldTouchClick}>
                                <DatePicker
                                    id={"Education.DatePicker." + this.props.educationEntry.id}
                                    container="inline"
                                    value={this.props.educationEntry.date}
                                    onChange={this.handleDateChange}
                                    formatDate={formatToShortDisplay}
                                    disabled={this.state.editDisabled}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="fittingContainer" onTouchStart={this.handleFieldTouchClick} onClick={this.handleFieldTouchClick}>
                                <AutoComplete
                                    id={"Education.Autocomplete." + this.props.educationEntry.id}
                                    value={this.state.autoCompleteValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.autoCompleteValues}
                                    onUpdateInput={this.handleAutoCompleteUpdateInput}
                                    onNewRequest={this.handleAutoCompleteNewRequest}
                                    disabled={this.state.editDisabled}
                                />
                            </div>
                        </div>
                    </Paper>
                </td>
            </tr>
        );
    }
}

import * as React from 'react';
import {AutoComplete, DatePicker, IconButton, MenuItem, Paper, SelectField, TouchTapEvent} from 'material-ui';
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
    educations: Immutable.Map<string, Education>;

    degrees: Immutable.List<string>;

    /**
     * Callback that is invoked when this modules DatePicker's value changes to a new date.
     * Also gives back the ID to of the {@link EducationEntry} given to this module.
     * @param newDate
     * @param id
     */
    onChangeStartDate(date: Date, id: string): void;

    /**
     * TODO doc
     * @param date
     * @param id
     */
    onChangeEndDate(date: Date, id: string): void;

    /**
     * Called when the {@link EducationEntry.degree} of this module has to change.
     * @param degree is the new degree
     * @param id of this {@link EducationEntry} of this module.
     */
    onChangeDegree(degree: string, id: string): void;

    /**
     * Callback that is invoked when thos modules autocomplete value is changed to a valid
     * education.
     * @param newEducationId
     * @param id of the education entry initially given to this module.
     */
    onEducationChange(newEducationId: string, id: string): void;

    /**
     * Invoked when the {@link EducationEntry} associated with this module is supposed to be deleted.
     * @param id {@link EducationEntry.id} of the entry that is supposed to be deleted.
     */
    onDelete(id: string): void;

    onNewEducation(name: string, id: string): void;

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface EducationEntryState {
    educationAutoComplete: string;
    editDisabled: boolean;
}


export class SingleEducationElement extends React.Component<EducationEntryLocalProps, EducationEntryState> {

    constructor(props: EducationEntryLocalProps) {
        super(props);
        this.state = {
            educationAutoComplete: this.getEducationEntryName(this.props.educationEntry.educationId),
            editDisabled: true
        };
    }

    private getEducationEntryName = (id: string) => {
        return id == null ? "" : this.props.educations.get(id).name;
    };

    private disabledEdit = () => {
        this.setState({
            editDisabled: true
        })
    };

    private enableEdit = () => {
        this.setState({
            editDisabled: false
        })
    };

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleChangeEndDate = (event: any, date: Date) => {
        // Hello Callback \o/!
        this.props.onChangeEndDate(date, this.props.educationEntry.id);
    };

    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     * @param dataSource useless
     */
    private handleEducationFieldInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({educationAutoComplete: searchText});
    };

    private handleEducationFieldRequest = (chosenRequest: any, index: number) => {
        if(index >= 0) {
            // education here
            let education: Education = chosenRequest as Education;
            this.props.onEducationChange(education.id, this.props.educationEntry.id);
        } else {
            // string here
            this.props.onNewEducation(chosenRequest, this.props.educationEntry.id);
        }
        this.disabledEdit();
    };

    private handleFieldTouchClick = (event: TouchTapEvent) => {
        this.enableEdit();
    };

    private handleSaveButtonPress = (event: TouchTapEvent) => {
        this.disabledEdit();
    };

    private handleDeleteButtonPress = (event: TouchTapEvent) => {
        this.props.onDelete(this.props.educationEntry.id);
    };

    private handleDegreeSelect = (event: TouchTapEvent, index: number, value: string) => {
        this.props.onChangeDegree(value, this.props.educationEntry.id);
        this.disabledEdit();
    };

    render() {
        return(
            <tr>
                <td>
                    <Paper className="row">
                        <div className="col-md-1">
                            <IconButton iconClassName="material-icons" onClick={this.handleSaveButtonPress} tooltip={PowerLocalize.get('Action.Lock')}>lock</IconButton>
                            <IconButton iconClassName="material-icons" onClick={this.handleDeleteButtonPress} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                        </div>
                        <div className="col-md-3">
                            <div className="fittingContainer" onTouchStart={this.handleFieldTouchClick} onClick={this.handleFieldTouchClick}>
                                <DatePicker
                                    id={"Education.DatePicker." + this.props.educationEntry.id}
                                    container="inline"
                                    value={this.props.educationEntry.endDate}
                                    onChange={this.handleChangeEndDate}
                                    formatDate={formatToShortDisplay}
                                    disabled={this.state.editDisabled}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="fittingContainer" onTouchStart={this.handleFieldTouchClick} onClick={this.handleFieldTouchClick}>
                                <SelectField value={this.props.educationEntry.degree} onChange={this.handleDegreeSelect}>
                                    {
                                        this.props.degrees.map((degree,key) => <MenuItem key={key} value={degree} primaryText={degree}/>)
                                    }
                                    <MenuItem value={null} primaryText={PowerLocalize.get("None")}/>
                                </SelectField>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="fittingContainer" onTouchStart={this.handleFieldTouchClick} onClick={this.handleFieldTouchClick}>
                                <AutoComplete
                                    id={"Education.Education." + this.props.educationEntry.id}
                                    value={this.state.educationAutoComplete}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.props.educations.toArray()}
                                    onUpdateInput={this.handleEducationFieldInput}
                                    onNewRequest={this.handleEducationFieldRequest}
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

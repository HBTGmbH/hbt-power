import * as React from 'react';
import {AutoComplete, DatePicker, IconButton, Paper, TouchTapEvent} from 'material-ui';
import {EducationEntry} from '../../../../model/EducationEntry';
import {Education} from '../../../../model/Education';
import {QualificationEntry} from '../../../../model/QualificationEntry';
import {Qualification} from '../../../../model/Qualification';
import * as Immutable from 'immutable';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../utils/DateUtil';


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
    qualifications: Immutable.Map<string, Qualification>;

    /**
     * Callback that is invoked when this modules DatePicker's value changes to a new date.
     * Also gives back the ID to of the {@link EducationEntry} given to this module.
     * @param newDate
     * @param id
     */
    onDateChange(newDate: Date, id: string): void;

    onQualificationChange(newQualificationId: string, entryId: string): void;

    onDelete(qualificationEntryId: string): void;

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface QualificationEntryState {
    autoCompleteValue: string;
    editDisabled: boolean;
}


export class SingleQualificationEntry extends React.Component<QualificationEntryLocalProps, QualificationEntryState> {

    private autoCompleteValues: Array<Qualification>;

    constructor(props: QualificationEntryLocalProps) {
        super(props);
        this.autoCompleteValues = props.qualifications.map((val, key) => val).toArray();
        this.state = {
            autoCompleteValue: this.getQualificationName(),
            editDisabled: true
        };
    }

    private getQualificationName = () => {
        let id: string = this.props.qualificationEntry.qualificationId;
        return id == null ? "" : this.props.qualifications.get(id).name;
    };

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleDateChange = (event: any, date: Date) => {
        // Hello Callback \o/!
        this.props.onDateChange(date, this.props.qualificationEntry.id);
    };

    private handleAutoCompleteUpdateInput = (searchText: string) => {
        this.setState({autoCompleteValue: searchText});
    };

    private handleAutoCompleteRequest = (chosenRequest: string, index: number) => {
        if(index >= 0) {
            this.props.onQualificationChange(this.autoCompleteValues[index].id, this.props.qualificationEntry.id);
            this.setState({
                editDisabled: true
            });
        } else {
            this.setState({
                autoCompleteValue: this.getQualificationName()
            });
        }
    };

    private handleSaveButtonClick = (event: TouchTapEvent) => {
        this.setState({
            editDisabled: true
        });
    };

    private handleFieldTouchClick = (event: TouchTapEvent) => {
        this.setState({
            editDisabled: false
        });
    };

    private handleDeleteButtonClick = (event: TouchTapEvent) => {
        this.props.onDelete(this.props.qualificationEntry.id);
    };

    render() {
        return(
            <tr>
                <td>
                    <Paper className="row">
                        <div className="col-md-1">
                            <IconButton iconClassName="material-icons" onClick={this.handleSaveButtonClick} tooltip={PowerLocalize.get('Action.Lock')}>lock</IconButton>
                            <IconButton iconClassName="material-icons" onClick={this.handleDeleteButtonClick} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                        </div>
                        <div className="col-md-5">
                            <div className="fittingContainer" onTouchStart={this.handleFieldTouchClick} onClick={this.handleFieldTouchClick}>
                                <DatePicker
                                    id={'Education.DatePicker.' + this.props.qualificationEntry.id}
                                    container="inline"
                                    value={this.props.qualificationEntry.date}
                                    onChange={this.handleDateChange}
                                    formatDate={formatToShortDisplay}
                                    disabled={this.state.editDisabled}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="fittingContainer" onTouchStart={this.handleFieldTouchClick} onClick={this.handleFieldTouchClick}>
                                <AutoComplete
                                    id={'Qualification.Autocomplete.' + this.props.qualificationEntry.id}
                                    value={this.state.autoCompleteValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.autoCompleteValues}
                                    onUpdateInput={this.handleAutoCompleteUpdateInput}
                                    onNewRequest={this.handleAutoCompleteRequest}
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

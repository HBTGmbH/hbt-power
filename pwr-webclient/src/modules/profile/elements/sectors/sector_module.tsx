
import {Sector} from '../../../../model/Sector';
import {SectorEntry} from '../../../../model/SectorEntry';
import * as Immutable from 'immutable';
import * as React from 'react';
import {AutoComplete, TextField, IconButton, TouchTapEvent, Paper} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';

interface SingleSectorLocalProps {
    sectors: Immutable.Map<number, Sector>;
    sectorEntry: SectorEntry;

    /**
     * Fixme document
     * @param newSectorId
     * @param sectorEntryId
     */
    onSectorChange(newSectorId: number, sectorEntryId: number): void;

    /**
     * Invoked when the user invokes a deletion of the sector entry.
     * @param sectorEntryId the id of the {@link SectorEntry} associated with this {@link SingleSectorModule}
     */
    onSectorDelete(sectorEntryId: number): void;

    /**
     * Invoked when the enter key is pressed inside the text field and the value of the text field
     * is not represented by any of the values provided in {@see SingleSectorLocalProps.sectors}.
     *
     * If the value matches a given sector, {@see SingleSectorLocalProps.onSectorChange} is invoked instead.
     * @param value
     * @param sectorEntryId the ID of the {@link SectorEntry} to which the new sector is assigned.
     */
    onNewSector(value: string, sectorEntryId: number): void;
}

interface SingleSectorState {
    autoCompleteValue: string;
    editDisabled: boolean;
}

export class SingleSectorModule extends React.Component<SingleSectorLocalProps, SingleSectorState> {



    constructor(props: SingleSectorLocalProps) {
        super(props);
        this.state = {
            autoCompleteValue: props.sectors.get(props.sectorEntry.sectorId).name,
            editDisabled: true
        };
    }



    private handleAutoCompleteUpdateInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({autoCompleteValue: searchText});
    };

    /**
     * One if the very few unfortunate cases where any has to be uses, as the chosenRequest value may either be a
     * String(when enter is pressed) or a {@see Sector} when a list element is selected.
     * A list element is selected when index >= 0
     * @param chosenRequest
     * @param index
     */
    private handleAutoCompleteNewRequest = (chosenRequest: any, index: number) => {
        if(index >= 0) {
            let chosen: Sector = chosenRequest as Sector;
            // One of the values from the dropdown list was chosen
            this.props.onSectorChange(chosen.id, this.props.sectorEntry.id);
        } else {
            // Request was submitted independent from the dropdown list.
            let chosen : String = chosenRequest as String;
            // Although the string MIGHT equal one of the existing sector entries, this is dispatches
            // as a 'new' sector entry, as in 'The user told me this is something new'.
            // The reducer function will handle possible conflicts.
            this.props.onNewSector(chosenRequest, this.props.sectorEntry.id);
        }
        // Always invokes disabling of the edit field.
        this.setState({
            editDisabled: true
        });
    };

    /**
     * Handler invokes when the delete button has been pressed.
     * @param event
     */
    private handleDeleteButtonPres = (event:TouchTapEvent) => {
        this.props.onSectorDelete(this.props.sectorEntry.id);
    };

    private handleFieldClickOrTap = (event: TouchTapEvent) => {
        this.setState({
            editDisabled: false,
            // After editing has been activated, there might be consistency problems due to async update operations
            // The value that is supposed to be in the autocomplete field.
            autoCompleteValue: this.getSectorName()
        });

    };

    private handleSaveButtonClick = (event: TouchTapEvent) => {
        this.setState({
            editDisabled: true
        });
    };

    private getSectorName = () => {
        // Try catch to avoid various undefined exceptions that happen during the
        // initialization of this component.
        // For some reason this gets called before props are properly initialized.
        try {
            return this.props.sectors.get(this.props.sectorEntry.sectorId).name;
        } catch(e){
            return "";
        }

    };

    render() {
        return(
            <tr>
                <td>
                    <Paper className="row">
                        <div className="col-md-1">
                            <IconButton iconClassName="material-icons" onClick={this.handleSaveButtonClick} tooltip={PowerLocalize.get('Action.Lock')}>lock</IconButton>
                            <IconButton iconClassName="material-icons" onClick={this.handleDeleteButtonPres} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                        </div>
                        <div className="col-md-11">
                            <div className="fittingContainer" onTouchStart={this.handleFieldClickOrTap} onClick={this.handleFieldClickOrTap}>
                                <AutoComplete
                                    id={'sectors.textfield.' + this.props.sectorEntry.id}
                                    value={this.state.editDisabled ? this.getSectorName(): this.state.autoCompleteValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.props.sectors.toArray()}
                                    onUpdateInput={this.handleAutoCompleteUpdateInput}
                                    onNewRequest={this.handleAutoCompleteNewRequest}
                                    disabled={this.state.editDisabled}
                                />
                            </div>
                        </div>
                    </Paper>
                </td>
            </tr>);
    }
}
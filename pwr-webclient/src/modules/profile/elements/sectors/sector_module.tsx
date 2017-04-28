
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
}

interface SingleSectorState {
    autoCompleteValue: string;
    autoCompleteValues: Array<Sector>;
    editDisabled: boolean;
}

export class SingleSectorModule extends React.Component<SingleSectorLocalProps, SingleSectorState> {



    constructor(props: SingleSectorLocalProps) {
        super(props);
        this.state = {
            autoCompleteValue: props.sectors.get(props.sectorEntry.sectorId).name,
            autoCompleteValues: props.sectors.map((value, key) => value).toArray(),
            editDisabled: true
        };
    }

    private handleAutoCompleteUpdateInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({autoCompleteValue: searchText});
    };

    private handleAutoCompleteNewRequest = (chosenRequest: string, index: number) => {
        if(index >= 0) {
            this.props.onSectorChange(this.state.autoCompleteValues[index].id, this.props.sectorEntry.id);
            this.setState({
                editDisabled: true
            });
        } else {
            this.setState({
                autoCompleteValue: this.props.sectors.get(this.props.sectorEntry.sectorId).name
            });
        }
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
            editDisabled: false
        });
    };

    private handleSaveButtonClick = (event: TouchTapEvent) => {
        this.setState({
            editDisabled: true
        });
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
                                    value={this.state.autoCompleteValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.state.autoCompleteValues}
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
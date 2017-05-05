///<reference path="../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {AutoComplete, Card, CardActions, CardHeader, CardMedia, Dialog, IconButton, TouchTapEvent} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {EducationEntry} from '../../../../model/EducationEntry';
import {NameEntity} from '../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {SectorEntry} from '../../../../model/SectorEntry';


interface SectorEntryDialogProps {
    /**
     * The element that is rendered in this module.
     */
    sectorEntry: SectorEntry;

    /**
     * All possible educations by their ids.
     */
    sectors: Immutable.Map<string, NameEntity>;

    open: boolean;

    /**
     *
     * @param sectorEntry
     * @param sector
     */
    onSave(sectorEntry: SectorEntry, sector: NameEntity): void;

    /**
     * Invoked when that thing is supposed to be closed.
     */
    onClose(): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface SectorEntryDialogState {
    sectorEntryValue: string;
    sectorEntry: SectorEntry;
    sector: NameEntity;
}



export class SectorEntryDialog extends React.Component<SectorEntryDialogProps, SectorEntryDialogState> {

    constructor(props: SectorEntryDialogProps) {
        super(props);
        this.state = {
            sectorEntryValue: this.getEducationEntryName(),
            sectorEntry: this.props.sectorEntry,
            sector: this.props.sectors.get(this.props.sectorEntry.sectorId)
        };
    }

    private getEducationEntryName = () => {
        let id: string = this.props.sectorEntry.sectorId;
        return id == null ? '' : this.props.sectors.get(id).name;
    };


    private closeDialog = () => {
        this.props.onClose();
    };


    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     * @param dataSource useless
     */
    private handleSectorFieldInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({sectorEntryValue: searchText});
    };

    private handleSectorFieldRequest = (chosenRequest: any, index: number) => {
        let sector: NameEntity;
        if(index < 0) {
            sector = InternalDatabase.getNameEntityByName(chosenRequest as string, this.props.sectors);
            if(sector == null) {
                sector = NameEntity.createNew(chosenRequest as string);
            }
        } else {
            sector = chosenRequest as NameEntity;
        }
        let entry: SectorEntry = this.state.sectorEntry;
        entry = entry.changeSectorId(sector.id);
        this.setState({
            sectorEntry: entry,
            sector: sector
        });
    };

    private handleCloseButtonPress = (event: TouchTapEvent) => {
        this.closeDialog();
    };


    private handleSaveButtonPress = (event: TouchTapEvent) => {
        this.props.onSave(this.state.sectorEntry, this.state.sector);
        this.closeDialog();
    };


    render() {
        return (
            <Dialog
                open={this.props.open}
                modal={false}
                onRequestClose={this.closeDialog}
            >
                <Card>
                    <CardHeader
                        title={PowerLocalize.get('EducationEntry.EditEntry.Title')}
                    />
                    <CardMedia>
                        <div className="row">
                            <div className="col-md-offset-3">
                                <AutoComplete
                                    floatingLabelText={PowerLocalize.get('EducationEntry.Dialog.EducationName')}
                                    id={'Education.Education.' + this.props.sectorEntry.id}
                                    value={this.state.sectorEntryValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.props.sectors.toArray()}
                                    onUpdateInput={this.handleSectorFieldInput}
                                    onNewRequest={this.handleSectorFieldRequest}
                                />
                            </div>
                        </div>
                    </CardMedia>
                    <CardActions>
                        <IconButton size={20} iconClassName="material-icons" onClick={this.handleSaveButtonPress} tooltip={PowerLocalize.get('Action.Save')}>save</IconButton>
                        <IconButton size={20} iconClassName="material-icons" onClick={this.handleCloseButtonPress} tooltip={PowerLocalize.get('Action.Exit')}>close</IconButton>
                    </CardActions>
                </Card>
            </Dialog>
        );
    }
}


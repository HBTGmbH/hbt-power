///<reference path="../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {AutoComplete, Card, CardActions, CardHeader, CardMedia, Dialog, IconButton, TouchTapEvent} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {EducationEntry} from '../../../../model/EducationEntry';
import {NameEntity} from '../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {SectorEntry} from '../../../../model/SectorEntry';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {isNull, isNullOrUndefined} from 'util';


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
}



export class SectorEntryDialog extends React.Component<SectorEntryDialogProps, SectorEntryDialogState> {

    constructor(props: SectorEntryDialogProps) {
        super(props);
        this.state = {
            sectorEntryValue: this.getEducationEntryName()
        };
    }

    private getEducationEntryName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.sectorEntry.sectorId, this.props.sectors);
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
        this.setState({sectorEntryValue: chosenRequest});
    };

    private handleCloseButtonPress = (event: TouchTapEvent) => {
        this.closeDialog();
    };


    private handleSaveButtonPress = (event: TouchTapEvent) => {
        let sector: NameEntity = InternalDatabase.findNameEntityByName(this.state.sectorEntryValue, this.props.sectors);
        let sectorEntry: SectorEntry = this.props.sectorEntry;
        // check if a sector with the name exists. If thats not the case, just create a new run. Server will handle the rest.
        if(isNullOrUndefined(sector)) {
            sector = NameEntity.createNew(this.state.sectorEntryValue);
        }
        sectorEntry = sectorEntry.changeSectorId(sector.id());
        this.props.onSave(sectorEntry, sector);
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
                                    dataSource={this.props.sectors.map(NameEntityUtil.mapToName).toArray()}
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


///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {AutoComplete, Dialog, IconButton} from 'material-ui';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {SectorEntry} from '../../../../../model/SectorEntry';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';


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
        return NameEntityUtil.getNullTolerantName(this.props.sectorEntry.sectorId(), this.props.sectors);
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

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        let sector: NameEntity = ProfileStore.findNameEntityByName(this.state.sectorEntryValue, this.props.sectors);
        let sectorEntry: SectorEntry = this.props.sectorEntry;
        // check if a sector with the name exists. If thats not the case, just create a new run. Server will handle the rest.
        if(isNullOrUndefined(sector)) {
            sector = NameEntity.createNew(this.state.sectorEntryValue);
        }
        sectorEntry = sectorEntry.sectorId(sector.id());
        this.props.onSave(sectorEntry, sector);
        this.closeDialog();
    };


    render() {
        return (
            <Dialog
                open={this.props.open}
                modal={false}
                onRequestClose={this.closeDialog}
                title={PowerLocalize.get('SectorEntry.Dialog.Title')}
                actions={[<IconButton iconClassName="material-icons icon-size-20" onClick={this.handleSaveButtonPress} tooltip={PowerLocalize.get('Action.Save')}>save</IconButton>,
                    <IconButton iconClassName="material-icons icon-size-20" onClick={this.handleCloseButtonPress} tooltip={PowerLocalize.get('Action.Exit')}>close</IconButton>]}
            >
                <div className="row">
                    <div className="col-md-offset-3">
                        <AutoComplete
                            floatingLabelText={PowerLocalize.get('Sector.Singular')}
                            id={'SectorEntry.Dialog.AC.' + this.props.sectorEntry.id}
                            value={this.state.sectorEntryValue}
                            searchText={this.state.sectorEntryValue}
                            dataSource={this.props.sectors.map(NameEntityUtil.mapToName).toArray()}
                            onUpdateInput={this.handleSectorFieldInput}
                            onNewRequest={this.handleSectorFieldRequest}
                            filter={AutoComplete.fuzzyFilter}
                        />
                    </div>
                </div>
            </Dialog>
        );
    }
}


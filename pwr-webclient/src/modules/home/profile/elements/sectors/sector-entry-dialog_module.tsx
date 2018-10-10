///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {SectorEntry} from '../../../../../model/SectorEntry';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';

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
     */
    private handleSectorFieldInput = (searchText: string) => {
        this.setState({sectorEntryValue: searchText});
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
                onClose={this.closeDialog}
                title={PowerLocalize.get('SectorEntry.Dialog.Title')}
                fullWidth
                id="SectorEntry.Dialog"
                aria-labelledby="SectoryEntry.Dialog.Title"
            >
                <DialogTitle id="SectoryEntry.Dialog.Title">
                    {PowerLocalize.get('SectorEntry.Dialog.Title')}
                </DialogTitle>
                <DialogContent>
                <div className="row">
                    <div className="col-md-11">
                        <PwrAutoComplete
                            fullWidth={true}
                            label={PowerLocalize.get('Sector.Singular')}
                            id={'SectorEntry.Dialog.AC.' + this.props.sectorEntry.id}
                            data={this.props.sectors.map(NameEntityUtil.mapToName).toArray()}
                            searchTerm={this.state.sectorEntryValue}
                            onSearchChange={this.handleSectorFieldInput}
                        />
                    </div>
                </div>
                </DialogContent>
                <DialogActions>
                    <PwrIconButton iconName={"save"} tooltip={PowerLocalize.get('Action.Save')} onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton iconName={"close"} tooltip={PowerLocalize.get('Action.Exit')} onClick={this.handleCloseButtonPress}/>
                </DialogActions>
            </Dialog>
        );
    }
}


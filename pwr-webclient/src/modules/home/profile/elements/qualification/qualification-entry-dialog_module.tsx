///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog, IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {QualificationEntry} from '../../../../../model/QualificationEntry';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import TextField from '@material-ui/core/TextField/TextField';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';


interface QualificationEntryDialogProps {

    qualificationEntry: QualificationEntry;

    qualifications: Immutable.Map<string, NameEntity>;

    open: boolean;

    /**
     * Invoked when the save button is pressed.
     * @param entry
     * @param nameEntity
     */
    onSave(entry: QualificationEntry, nameEntity: NameEntity): void;

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
interface QualificationEntryDialogState {
    qualificationAutoCompleteValue: string;
    qualificationEntry: QualificationEntry;
}



export class QualificationEntryDialog extends React.Component<QualificationEntryDialogProps, QualificationEntryDialogState> {

    constructor(props: QualificationEntryDialogProps) {
        super(props);
        this.state = {
            qualificationAutoCompleteValue: this.getQualificationName(),
            qualificationEntry: this.props.qualificationEntry,
        };
    }

    private getQualificationName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.qualificationEntry.qualificationId(), this.props.qualifications);
    };


    private closeDialog = () => {
        this.props.onClose();
    };


    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     * @param dataSource useless
     */
    private handleQualificationFieldInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({qualificationAutoCompleteValue: searchText});
    };

    private handleLanguageFieldRequest = (chosenRequest: string, index: number) => {
        this.setState({qualificationAutoCompleteValue: chosenRequest});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        let name: string = this.state.qualificationAutoCompleteValue;
        let qualification: NameEntity = ProfileStore.findNameEntityByName(name, this.props.qualifications);
        let qualificationEntry: QualificationEntry = this.state.qualificationEntry;
        if(isNullOrUndefined(qualification)) {
            qualification = NameEntity.createNew(name);
        }
        qualificationEntry = qualificationEntry.qualificationId(qualification.id());
        this.props.onSave(qualificationEntry, qualification);
        this.closeDialog();
    };

    /**
    * Callback invokes when the DatePicker's value changes.
    * @param event is always null according to material-ui docs
    * @param date is the new date.
    */
    private handleChangeDate = (event: any, date: Date) => {
        this.setState({
            qualificationEntry: this.state.qualificationEntry.date(date)
        });
    };


    render() {
        return (
            <Dialog
                open={this.props.open}
                title={PowerLocalize.get('Qualification.Dialog.Title')}
                onClose={this.closeDialog}
                scroll={'paper'}
                fullWidth
            >
                <DialogTitle>
                    <Typography >{PowerLocalize.get('Qualification.Dialog.Title')}</Typography>
                </DialogTitle>
                <DialogContent>
                <div className="entry-dlg-content">
                    <div>
                        {/* <DatePicker
                            label={PowerLocalize.get('Begin')}
                            id={'QualificationEntry.StartDate' + this.props.qualificationEntry.id}
                            container="inline"
                            value={this.state.qualificationEntry.date()}
                            onChange={this.handleChangeDate}
                            formatDate={formatToShortDisplay}
                        />*/}
                        <TextField
                            label={PowerLocalize.get('Begin')}
                            id={'QualificationEntry.StartDate' + this.props.qualificationEntry.id}
                            value={this.state.qualificationEntry.date().toISOString().split('T')[0]}
                            type={"date"}
                        />
                    </div>
                    <div style={{marginTop:'10px'}}>
                        {/*TODO <AutoComplete
                            fullWidth={true}
                            label={PowerLocalize.get('Qualification.Singular')}
                            id={'QualificationEntry.Qualification.' + this.props.qualificationEntry.id}
                            value={this.state.qualificationAutoCompleteValue}
                            searchText={this.state.qualificationAutoCompleteValue}
                            dataSource={this.props.qualifications.map(NameEntityUtil.mapToName).toArray()}
                            onUpdateInput={this.handleQualificationFieldInput}
                            onNewRequest={this.handleLanguageFieldRequest}
                            filter={AutoComplete.fuzzyFilter}
                        />*/}
                        <TextField
                            fullWidth={true}
                            label={PowerLocalize.get('Qualification.Singular')}
                            id={'QualificationEntry.Qualification.' + this.props.qualificationEntry.id}
                            value={this.state.qualificationAutoCompleteValue}
                        />
                    </div>
                </div>
                </DialogContent>
                <DialogActions>
                    <Tooltip title = {PowerLocalize.get('Action.Save')} >
                        <IconButton className="material-icons icon-size-20" onClick={this.handleSaveButtonPress} >save</IconButton>
                    </Tooltip>
                    <Tooltip title={PowerLocalize.get('Action.Exit')}>
                        <IconButton className="material-icons icon-size-20" onClick={this.handleCloseButtonPress} >close</IconButton>
                    </Tooltip>
                </DialogActions>

            </Dialog>
        );
    }
}


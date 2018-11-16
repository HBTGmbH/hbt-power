///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {QualificationEntry} from '../../../../../model/QualificationEntry';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {DatePicker} from 'material-ui-pickers';
import {MaterialUiPickersDate} from 'material-ui-pickers/typings/date';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';


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
     */
    private handleQualificationFieldInput = (searchText: string) => {
        this.setState({qualificationAutoCompleteValue: searchText});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        let name: string = this.state.qualificationAutoCompleteValue;
        let qualification: NameEntity = ProfileStore.findNameEntityByName(name, this.props.qualifications);
        let qualificationEntry: QualificationEntry = this.state.qualificationEntry;
        if (isNullOrUndefined(qualification)) {
            qualification = NameEntity.createNew(name);
        }
        qualificationEntry = qualificationEntry.qualificationId(qualification.id());
        this.props.onSave(qualificationEntry, qualification);
        this.closeDialog();
    };

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param date is the new date.
     */
    private handleChangeDate = (date: MaterialUiPickersDate) => {
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
                    {PowerLocalize.get('Qualification.Dialog.Title')}
                </DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col-md-5">
                            <DatePicker
                                id={'QualificationEntry.StartDate' + this.props.qualificationEntry.id}
                                label={PowerLocalize.get('Begin')}
                                value={this.state.qualificationEntry.date()}
                                onChange={this.handleChangeDate}
                            />
                        </div>
                        <div className={'col-md-5'}>
                            <PwrAutoComplete
                                fullWidth={true}
                                label={PowerLocalize.get('Qualification.Singular')}
                                id={'QualificationEntry.Qualification.' + this.props.qualificationEntry.id}
                                data={this.props.qualifications.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.qualificationAutoCompleteValue}
                                onSearchChange={this.handleQualificationFieldInput}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <PwrIconButton iconName={'save'} tooltip={PowerLocalize.get('Action.Save')}
                                   onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton iconName={'close'} tooltip={PowerLocalize.get('Action.Exit')}
                                   onClick={this.handleCloseButtonPress}/>
                </DialogActions>

            </Dialog>
        );
    }
}


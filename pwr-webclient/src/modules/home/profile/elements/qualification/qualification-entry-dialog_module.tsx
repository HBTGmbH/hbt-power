///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {AutoComplete, DatePicker, Dialog, IconButton, TouchTapEvent} from 'material-ui';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {QualificationEntry} from '../../../../../model/QualificationEntry';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';


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

    private handleCloseButtonPress = (event: TouchTapEvent) => {
        this.closeDialog();
    };


    private handleSaveButtonPress = (event: TouchTapEvent) => {
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
                modal={false}
                onRequestClose={this.closeDialog}
                autoScrollBodyContent={true}
                actions={[<IconButton size={20} iconClassName="material-icons" onClick={this.handleSaveButtonPress} tooltip={PowerLocalize.get('Action.Save')}>save</IconButton>,
                    <IconButton size={20} iconClassName="material-icons" onClick={this.handleCloseButtonPress} tooltip={PowerLocalize.get('Action.Exit')}>close</IconButton>]}
            >
                <div className="row">
                    <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                        <DatePicker
                            floatingLabelText={PowerLocalize.get('Begin')}
                            id={'QualificationEntry.StartDate' + this.props.qualificationEntry.id}
                            container="inline"
                            value={this.state.qualificationEntry.date()}
                            onChange={this.handleChangeDate}
                            formatDate={formatToShortDisplay}
                        />
                    </div>
                    <div className="col-md-5 col-sm-6">
                        <AutoComplete
                            floatingLabelText={PowerLocalize.get('Qualification.Singular')}
                            id={'QualificationEntry.Qualification.' + this.props.qualificationEntry.id}
                            value={this.state.qualificationAutoCompleteValue}
                            searchText={this.state.qualificationAutoCompleteValue}
                            dataSource={this.props.qualifications.map(NameEntityUtil.mapToName).toArray()}
                            onUpdateInput={this.handleQualificationFieldInput}
                            onNewRequest={this.handleLanguageFieldRequest}
                            filter={AutoComplete.fuzzyFilter}
                        />
                    </div>
                </div>
            </Dialog>
        );
    }
}


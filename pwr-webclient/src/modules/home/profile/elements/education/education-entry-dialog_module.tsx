///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {AutoComplete, DatePicker, Dialog, IconButton, MenuItem, SelectField} from 'material-ui';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {EducationEntry} from '../../../../../model/EducationEntry';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';


interface EducationEntryDialogLocalProps {
    /**
     * The element that is rendered in this module.
     */
    educationEntry: EducationEntry;

    /**
     * All possible educations by their ids.
     */
    educations: Immutable.Map<string, NameEntity>;

    degrees: Immutable.List<string>;

    open: boolean;

    /**
     * Invoked when the save button is pressed.
     * @param entry
     * @param nameEntity
     */
    onSave(entry: EducationEntry, nameEntity: NameEntity): void;

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
interface EducationEntryDialogLocalState {
    educationAutoComplete: string;
    entry: EducationEntry;
}



export class EducationEntryDialogModule extends React.Component<EducationEntryDialogLocalProps, EducationEntryDialogLocalState> {

    constructor(props: EducationEntryDialogLocalProps) {
        super(props);
        this.state = {
            educationAutoComplete: this.getEducationEntryName(this.props.educationEntry.nameEntityId()),
            entry: this.props.educationEntry,
        };
        if(isNullOrUndefined(this.state.entry.degree())) {
            this.setState({
                entry: this.state.entry.degree(PowerLocalize.get("None"))
            })
        }
    }

    private getEducationEntryName = (id: string) => {
        return NameEntityUtil.getNullTolerantName(id, this.props.educations);
    };


    private closeDialog = () => {
        this.props.onClose();
    };

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleChangeEndDate = (event: any, date: Date) => {
        let entry = this.state.entry;
        entry = entry.endDate(date);
        this.setState({
            entry: entry
        });
    };

    /**
     * Callback invokes when the DatePicker's value changes.
     * @param event is always null according to material-ui docs
     * @param date is the new date.
     */
    private handleChangeStartDate = (event: any, date: Date) => {
        let entry = this.state.entry;
        entry = entry.startDate(date);
        this.setState({
            entry: entry
        });
    };

    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     * @param dataSource useless
     */
    private handleEducationFieldInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({educationAutoComplete: searchText});
    };

    private handleEducationFieldRequest = (chosenRequest: any, index: number) => {
        this.setState({educationAutoComplete: chosenRequest});
    };

    private handleCloseButtonPress = (event: any) => {
        this.closeDialog();
    };

    private handleDegreeSelect = (event: any, index: number, value: string) => {
        let entry = this.state.entry;
        entry = entry.degree(value);
        this.setState({
            entry: entry
        });
    };

    private handleSaveButtonPress = (event: any) => {
        let name: string = this.state.educationAutoComplete;
        let education: NameEntity = ProfileStore.findNameEntityByName(name, this.props.educations);
        let educationEntry: EducationEntry = this.state.entry;
        if(educationEntry.degree() == PowerLocalize.get("None")) educationEntry.degree(null);
        if(isNullOrUndefined(education)) {
            education = NameEntity.createNew(name);
        }
        educationEntry = educationEntry.nameEntityId(education.id());
        this.props.onSave(educationEntry, education);
        this.closeDialog();
    };


    render() {
        return (
            <Dialog
                open={this.props.open}
                modal={false}
                onRequestClose={this.closeDialog}
                title={PowerLocalize.get('EducationEntry.EditEntry.Title')}
                autoScrollBodyContent={true}
                actions={[<IconButton iconClassName="material-icons icon-size-20" onClick={this.handleSaveButtonPress} tooltip={PowerLocalize.get('Action.Save')}>save</IconButton>,
                    <IconButton iconClassName="material-icons icon-size-20" onClick={this.handleCloseButtonPress} tooltip={PowerLocalize.get('Action.Exit')}>close</IconButton>]}
            >
                <div className="row">
                    <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                        <DatePicker
                            floatingLabelText={PowerLocalize.get('Begin')}
                            id={'EducationEntry.StartDate' + this.props.educationEntry.id}
                            container="inline"
                            value={this.state.entry.startDate()}
                            onChange={this.handleChangeStartDate}
                            formatDate={formatToShortDisplay}
                        />
                    </div>
                    <div className="col-md-5 col-sm-6">
                        <DatePicker
                            floatingLabelText={PowerLocalize.get('End')}
                            id={'EducationEntry.EndDate' + this.props.educationEntry.id}
                            container="inline"
                            value={this.state.entry.endDate()}
                            onChange={this.handleChangeEndDate}
                            formatDate={formatToShortDisplay}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                        <SelectField
                            value={this.state.entry.degree()}
                            onChange={this.handleDegreeSelect}
                            hintText={PowerLocalize.get('AcademicDegree.Singular')}
                            floatingLabelText={PowerLocalize.get('AcademicDegree.Singular')}
                        >
                            {
                                this.props.degrees.map((degree,key) => <MenuItem key={key} value={degree} primaryText={degree}/>)
                            }
                            <MenuItem value={" "} primaryText={PowerLocalize.get('None')}/>
                        </SelectField>
                    </div>
                    <div className="col-md-5 col-sm-6">
                        <AutoComplete
                            floatingLabelText={PowerLocalize.get('EducationEntry.Dialog.EducationName')}
                            id={'Education.Education.' + this.props.educationEntry.id()}
                            value={this.state.educationAutoComplete}
                            searchText={this.state.educationAutoComplete}
                            dataSource={this.props.educations.map(NameEntityUtil.mapToName).toArray()}
                            onUpdateInput={this.handleEducationFieldInput}
                            onNewRequest={this.handleEducationFieldRequest}
                            filter={AutoComplete.fuzzyFilter}
                        />
                    </div>
                </div>
            </Dialog>
        );
    }
}


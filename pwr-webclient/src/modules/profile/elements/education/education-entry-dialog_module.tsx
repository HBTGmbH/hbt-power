///<reference path="../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {
    AutoComplete,
    Card,
    CardActions,
    CardHeader,
    CardMedia,
    DatePicker,
    Dialog,
    IconButton,
    MenuItem,
    SelectField,
    TouchTapEvent
} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {EducationEntry} from '../../../../model/EducationEntry';
import {NameEntity} from '../../../../model/NameEntity';
import * as Immutable from 'immutable';


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
    nameEntity: NameEntity;
}



export class EducationEntryDialogModule extends React.Component<EducationEntryDialogLocalProps, EducationEntryDialogLocalState> {

    constructor(props: EducationEntryDialogLocalProps) {
        super(props);
        this.state = {
            educationAutoComplete: this.getEducationEntryName(this.props.educationEntry.nameEntityId),
            entry: this.props.educationEntry,
            nameEntity: this.props.educations.get(this.props.educationEntry.nameEntityId)
        };
    }

    private getEducationEntryName = (id: string) => {
        return id == null ? '' : this.props.educations.get(id).name;
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
        entry = entry.changeEndDate(date);
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
        entry = entry.changeStartDate(date);
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
        let education: NameEntity;
        if(index < 0) {
            education = InternalDatabase.getNameEntityByName(chosenRequest as string, this.props.educations);
            if(education == null) {
                education = NameEntity.createNew(chosenRequest as string);
            }
        } else {
            education = chosenRequest as NameEntity;
        }
        let entry: EducationEntry = this.state.entry;
        entry = entry.changeEducationId(education.id);
        this.setState({
            entry: entry,
            nameEntity: education
        });
    };

    private handleCloseButtonPress = (event: TouchTapEvent) => {
        this.closeDialog();
    };

    private handleDegreeSelect = (event: TouchTapEvent, index: number, value: string) => {
        let entry = this.state.entry;
        entry = entry.changeDegree(value);
        this.setState({
            entry: entry
        });
    };

    private handleSaveButtonPress = (event: TouchTapEvent) => {
        console.log(this.state.entry);
        this.props.onSave(this.state.entry, this.state.nameEntity);
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
                            <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                                <DatePicker
                                    floatingLabelText={PowerLocalize.get('Begin')}
                                    id={'EducationEntry.StartDate' + this.props.educationEntry.id}
                                    container="inline"
                                    value={this.state.entry.startDate}
                                    onChange={this.handleChangeStartDate}
                                    formatDate={formatToShortDisplay}
                                />
                            </div>
                            <div className="col-md-5 col-sm-6">
                                <DatePicker
                                    floatingLabelText={PowerLocalize.get('End')}
                                    id={'EducationEntry.EndDate' + this.props.educationEntry.id}
                                    container="inline"
                                    value={this.state.entry.endDate}
                                    onChange={this.handleChangeEndDate}
                                    formatDate={formatToShortDisplay}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                                <SelectField
                                    value={this.state.entry.degree}
                                    onChange={this.handleDegreeSelect}
                                    hintText={PowerLocalize.get('AcademicDegree.Singular')}
                                    floatingLabelText={PowerLocalize.get('AcademicDegree.Singular')}
                                >
                                    {
                                        this.props.degrees.map((degree,key) => <MenuItem key={key} value={degree} primaryText={degree}/>)
                                    }
                                    <MenuItem value={null} primaryText={PowerLocalize.get('None')}/>
                                </SelectField>
                            </div>
                            <div className="col-md-5 col-sm-6">
                                <AutoComplete
                                    floatingLabelText={PowerLocalize.get('EducationEntry.Dialog.EducationName')}
                                    id={'Education.Education.' + this.props.educationEntry.id}
                                    value={this.state.educationAutoComplete}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.props.educations.toArray()}
                                    onUpdateInput={this.handleEducationFieldInput}
                                    onNewRequest={this.handleEducationFieldRequest}
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


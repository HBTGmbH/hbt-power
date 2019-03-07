///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog, MenuItem, Select} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {EducationEntry} from '../../../../../model/EducationEntry';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import FormControl from '@material-ui/core/FormControl/FormControl';
import {DatePicker} from 'material-ui-pickers';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {PwrYearPicker} from '../../../../general/pwr-year-picker';
import {PwrError, PwrErrorType} from '../../../../general/pwr-error_module';
import {DatePickerType} from '../../../../../model/DatePickerType';
import {PwrDatePicker} from '../../../../general/pwr-date-picker_module';


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
    dateError: PwrErrorType;
}


export class EducationEntryDialogModule extends React.Component<EducationEntryDialogLocalProps, EducationEntryDialogLocalState> {

    constructor(props: EducationEntryDialogLocalProps) {
        super(props);
        this.state = {
            educationAutoComplete: this.getEducationEntryName(this.props.educationEntry.nameEntityId()),
            entry: this.props.educationEntry,
            dateError:null,
        };
        if (isNullOrUndefined(this.state.entry.degree())) {
            this.setState({
                entry: this.state.entry.degree(PowerLocalize.get('None'))
            });
        }
    }

    private getEducationEntryName = (id: string) => {
        return NameEntityUtil.getNullTolerantName(id, this.props.educations);
    };

    public componentDidUpdate(){
        this.checkDates();
    }

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
     */
    private handleEducationFieldInput = (searchText: string) => {
        this.setState({educationAutoComplete: searchText});
    };

    private handleEducationFieldRequest = (chosenRequest: any, index: number) => {
        this.setState({educationAutoComplete: chosenRequest});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };

    private handleDegreeSelect = (value: string) => {
        let entry = this.state.entry;
        entry = entry.degree(value);
        this.setState({
            entry: entry
        });
    };

    private handleSaveButtonPress = () => {
        let name: string = this.state.educationAutoComplete;
        let education: NameEntity = ProfileStore.findNameEntityByName(name, this.props.educations);
        let educationEntry: EducationEntry = this.state.entry;
        if (educationEntry.degree() == PowerLocalize.get('None')) educationEntry.degree(null);
        if (isNullOrUndefined(education)) {
            education = NameEntity.createNew(name);
        }
        educationEntry = educationEntry.nameEntityId(education.id());
        this.props.onSave(educationEntry, education);
        this.closeDialog();
    };

    private checkDates = () => {
        const endDate = this.state.entry.endDate();
        const startDate = this.state.entry.startDate();
        if (endDate < startDate) {
            this.setError(PwrErrorType.DATE_START_AFTER_END);
        } else {
            this.setError(null);
        }
    };

    private setError = (error: PwrErrorType) => {
        if (this.state.dateError !== error) {
            this.setState({
                dateError: error,
            });
        }
    };

    private handleStartDateChange = (date: Date) => {
        this.setState({
           entry : this.state.entry.startDate(date)
        });

    };
    private handleEndDateChange = (date: Date) => {
        this.setState({
            entry : this.state.entry.endDate(date)
        });
    };

    render() {
        return <Dialog
            open={this.props.open}
            onClose={this.closeDialog}
            title={PowerLocalize.get('EducationEntry.EditEntry.Title')}
            fullWidth
            id="EducationEntry.Dialog"
            aria-labelledby="EducationEntry.Dialog.Title"
        >
            <DialogTitle id="EducationEntry.Dialog.Title">
                {PowerLocalize.get('EducationEntry.EditEntry.Title')}
            </DialogTitle>
            <DialogContent>
                <div className={"row"}>
                    <div className={"col-md-12"}>
                        <PwrError error={this.state.dateError}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-5 col-sm-6 ">
                        <form>
                            <PwrDatePicker
                                onChange={this.handleStartDateChange}
                                placeholderDate={this.state.entry.startDate()}
                                label={'Start'}
                                type={DatePickerType.YEAR}
                            />
                        </form>
                    </div>
                    <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                        <form noValidate>
                            <PwrDatePicker
                                onChange={this.handleEndDateChange}
                                placeholderDate={this.state.entry.startDate()}
                                label={'Ende'}
                                type={DatePickerType.YEAR}
                            />
                        </form>
                    </div>
                </div>
                <PwrSpacer/>
                <div className="row">
                    <div className="col-md-6">
                        <FormControl fullWidth={true}>
                            <InputLabel>
                                <Typography>{PowerLocalize.get('AcademicDegree.Singular')}</Typography>
                            </InputLabel>
                            <Select
                                value={this.state.entry.degree()}
                                onChange={(event) => this.handleDegreeSelect(event.target.value)}
                                fullWidth={true}
                            >
                                {
                                    this.props.degrees.map((degree, key) => <MenuItem button key={key}
                                                                                      value={degree}>{degree}</MenuItem>)
                                }
                                <MenuItem value={' '}>{PowerLocalize.get('None')}</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="col-md-6">
                        <FormControl>
                            <PwrAutoComplete
                                label={PowerLocalize.get('EducationEntry.Dialog.EducationName')}
                                id={'Education.Education.' + this.props.educationEntry.id()}
                                data={this.props.educations.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.educationAutoComplete}
                                onSearchChange={this.handleEducationFieldInput}
                            />
                        </FormControl>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <PwrIconButton iconName={'save'} tooltip={PowerLocalize.get('Action.Save')} iconButtonProps={{disabled:!!this.state.dateError}}
                               onClick={this.handleSaveButtonPress}/>
                <PwrIconButton iconName={'close'} tooltip={PowerLocalize.get('Action.Exit')}
                               onClick={this.handleCloseButtonPress}/>
            </DialogActions>
        </Dialog>;
    }
}


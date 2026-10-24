import Dialog from '@material-ui/core/Dialog/Dialog';
import * as React from 'react';
import {ProfileTypeDataMapper} from '../../../reducers/profile-new/profile/ProfileTypeDataMapper';
import {PwrAutoComplete} from '../../general/pwr-auto-complete';
import {ProfileEntryType} from '../../../reducers/profile-new/profile/model/ProfileEntryType';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {NameEntity} from '../../../reducers/profile-new/profile/model/NameEntity';
import {ProfileEntry} from '../../../reducers/profile-new/profile/model/ProfileEntry';
import Grid from '@material-ui/core/Grid/Grid';
import Select from '@material-ui/core/Select/Select';
import FormControl from '@material-ui/core/FormControl/FormControl';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import {LanguageLevel, toLanguageLevel} from '../../../reducers/profile-new/profile/model/LanguageLevel';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {EducationDegree} from '../../../reducers/profile-new/profile/model/EducationDegree';
import {PwrDatePicker} from '../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../model/DatePickerType';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {validateNonEmptyProfileEntry} from '../../../utils/ValidationUtils';
import {LocalDate, today} from '../../../utils/DateUtil';
import {ThunkDispatch} from 'redux-thunk';
import {NameEntityAlias} from '../../../model/NameEntityAlias';

interface ProfileEntryDialogProps {
    suggestions: Array<string>;
    aliases: Array<NameEntityAlias>;
    degrees: Array<EducationDegree>;

    langLevel: Array<LanguageLevel>;
    initials: string;
}

interface ProfileEntryDialogLocalProps {
    open: boolean;
    type: ProfileEntryType;
    entry: ProfileEntry;

    onClose(): void;
}

interface ProfileEntryDialogDispatch {
    updateEntity(initials: string, entry: ProfileEntry): void;
}

export interface ProfileEntryDialogState {
    searchText: string;
    startDate: LocalDate | null;
    endDate: LocalDate | null;
    degree: string;
    langLevel: LanguageLevel;
}

class ProfileEntryDialogModule extends React.Component<ProfileEntryDialogProps & ProfileEntryDialogLocalProps & ProfileEntryDialogDispatch, ProfileEntryDialogState> {


    constructor(props) {
        super(props);
        this.state = this.formFor(props);
    }

    /**
     * The form of the entry; empty with the defaults for a new one. A qualification has a date instead of a start.
     */
    private formFor = (props: ProfileEntryDialogLocalProps): ProfileEntryDialogState => {
        const entry = props.entry;
        const start = entry && (props.type === 'QUALIFICATION' ? entry['date'] : entry['startDate']);
        return {
            searchText: entry ? entry.nameEntity.name : '',
            startDate: start || today(),
            endDate: (entry && entry['endDate']) || today(),
            degree: (entry && entry['degree']) || EducationDegree.BACHELOR,
            langLevel: (entry && entry['level']) || LanguageLevel.BASIC,
        };
    };

    static mapStateToProps(state: ApplicationState, localProps: ProfileEntryDialogLocalProps): ProfileEntryDialogProps {
        const suggestionField = ProfileTypeDataMapper.getSuggestionField(localProps.type);
        const suggestionData: Array<NameEntity> = !!(suggestionField) && !!(state.suggestionStore) ? state.suggestionStore[suggestionField] : [];
        const suggestionNames = !!(suggestionData) ? suggestionData.map(e => e.name) : [];
        const degrees = [EducationDegree.BACHELOR, EducationDegree.MASTER, EducationDegree.DOKTOR, EducationDegree.DIPLOM];
        const langLevel = [LanguageLevel.BASIC, LanguageLevel.ADVANCED, LanguageLevel.BUSINESS_FLUENT, LanguageLevel.NATIVE];
        const initials = !!(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';

        return {
            suggestions: suggestionNames,
            // The entry types are named like the types of the profile elements
            aliases: state.suggestionStore.allAliases.filter(alias => alias.type === localProps.type),
            langLevel: langLevel,
            degrees: degrees,
            initials: initials
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>, localProps: ProfileEntryDialogLocalProps): ProfileEntryDialogDispatch {
        return {
            updateEntity: ProfileTypeDataMapper.getUpdateFunction(localProps.type, dispatch),
        };
    }


    public componentDidUpdate(oldProps: ProfileEntryDialogLocalProps) {
        // Every opening shows the form of the entry, empty for a new one, not what the last one left (#285)
        if ((this.props.open && !oldProps.open) || this.props.entry !== oldProps.entry) {
            this.setState(this.formFor(this.props));
        }
    }

    private handleLangSelectChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
        this.setState({
            langLevel: toLanguageLevel(event.target.value)
        });
    };

    private renderLangSelectElement = (level: LanguageLevel, id: number) => {
        return <MenuItem key={id} value={level}>
            {PowerLocalize.langLevelToLocalizedString(level)}
        </MenuItem>;
    };

    private handleDegreeSelectChange = (degree: string) => {
        this.setState({
            degree: degree
        });
    };

    private onStartDateChange = (date: LocalDate | null) => {
        this.setState({
            startDate: date
        });
    };

    private onEndDateChange = (date: LocalDate | null) => {
        this.setState({
            endDate: date
        });
    };

    private handleSave = () => {
        const entry = ProfileTypeDataMapper.makeEntry(this.props.type, this.state, this.props.entry);
        if (entry) {
            this.props.updateEntity(this.props.initials, entry);
        } else {
            console.error('Can\'t create ProfileEntry');
        }
        this.props.onClose();
    };



    private handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!event.isPropagationStopped()) {
            if (event.key === 'Escape') {
                this.props.onClose();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };

    render() {
        let error = validateNonEmptyProfileEntry(this.state.searchText);
        return (
            <Dialog open={this.props.open} onClose={this.props.onClose}
                    fullWidth
                    maxWidth="sm"
                    scroll="paper"
                    onKeyDown={event => this.handleKeyDown(event)}>
                <DialogTitle>
                    {PowerLocalize.get(`ProfileEntryType.${this.props.type}.EditHeader`)}
                </DialogTitle>
                <DialogContent>
                    {/* Fields of one group: 16 px apart (#40) */}
                    <Grid container spacing={2}>
                        <Grid item md={12} xs={12}>
                            <PwrAutoComplete
                                validationError={error}
                                autoFocus
                                fullWidth
                                label={PowerLocalize.get(`ProfileEntryType.${this.props.type}.AutoCompleteLabel`)}
                                id={'id'}
                                data={this.props.suggestions}
                                aliases={this.props.aliases}
                                searchTerm={this.state.searchText}
                                onSearchChange={(value) => this.setState({searchText: value})}
                            />
                        </Grid>
                        {
                            //startDate
                            !(this.props.type === 'CAREER' || this.props.type === 'EDUCATION' || this.props.type === 'TRAINING' || this.props.type === 'QUALIFICATION') ? <></> :
                                <Grid item md={11} xs={11}>
                                    <PwrDatePicker
                                        onChange={this.onStartDateChange}
                                        value={this.state.startDate}
                                        label={PowerLocalize.get('ProfileEntry.StartDate')}
                                        type={DatePickerType.MONTH_YEAR}
                                        disableOpenEnd
                                    />
                                </Grid>
                        }
                        {
                            //endDate
                            !(this.props.type === 'CAREER' || this.props.type === 'EDUCATION' || this.props.type === 'TRAINING') ? <></> :
                                <Grid item md={11} xs={11}>
                                    <PwrDatePicker
                                        onChange={this.onEndDateChange}
                                        value={this.state.endDate}
                                        label={PowerLocalize.get('ProfileEntry.EndDate')}
                                        type={DatePickerType.MONTH_YEAR}/>
                                </Grid>
                        }
                        {
                            //degree
                            !(this.props.type === 'EDUCATION') ? <></> :
                                <Grid item md={12} xs={12}>
                                    <PwrAutoComplete
                                        fullWidth
                                        label={PowerLocalize.get('ProfileEntry.Degree')}
                                        id={'id'}
                                        data={this.props.degrees}
                                        searchTerm={this.state.degree}
                                        onSearchChange={(value) => this.handleDegreeSelectChange(value)}
                                    />
                                </Grid>
                        }
                        {
                            //lang level
                            !(this.props.type === 'LANGUAGE') ? <></> :
                                <Grid item md={12} xs={12}>
                                    <FormControl variant="filled">
                                        <InputLabel>{PowerLocalize.get('LanguageLevel.Singular')}</InputLabel>
                                        <Select
                                            value={this.state.langLevel}
                                            onChange={this.handleLangSelectChange}
                                        >
                                            {this.props.langLevel.map(this.renderLangSelectElement)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                        }
                    </Grid>
                </DialogContent>
                <DialogActions>
                    {/* The same button bar as the forms (#41) */}
                    <PwrFormActions editing noSpace saveDisabled={!!error}
                                    onSave={() => this.handleSave()}
                                    onCancel={this.props.onClose}/>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ProfileEntryDialog: React.ComponentClass<ProfileEntryDialogLocalProps> = connect(ProfileEntryDialogModule.mapStateToProps, ProfileEntryDialogModule.mapDispatchToProps)(ProfileEntryDialogModule) as any;

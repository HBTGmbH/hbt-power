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
import {LanguageLevel, toLanguageLevel} from '../../../reducers/profile-new/profile/model/LanguageLevel';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {EducationDegree} from '../../../reducers/profile-new/profile/model/EducationDegree';
import {PwrDatePicker} from '../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../model/DatePickerType';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import {PwrButton} from '../../general/pwr-button';
import {validateNonEmptyProfileEntry} from '../../../utils/ValidationUtils';
import {ThunkDispatch} from 'redux-thunk';

interface ProfileEntryDialogProps {
    suggestions: Array<string>;
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
    startDate: Date;
    endDate: Date;
    degree: string;
    langLevel: LanguageLevel;
}

class ProfileEntryDialogModule extends React.Component<ProfileEntryDialogProps & ProfileEntryDialogLocalProps & ProfileEntryDialogDispatch, ProfileEntryDialogState> {


    constructor(props) {
        super(props);
        this.resetState(props);
    }

    private resetState = (props) => {
        this.state = this.defaultState(props);
    };

    private defaultState = (props) => {
        return {
            searchText: !!(props.entry) ? props.entry.nameEntity.name : '',
            startDate: !!(props.entry) && !!(props.entry['startDate']) ? props.entry['startDate'] : new Date(),
            endDate: !!(props.entry) && !!(props.entry['endDate']) ? props.entry['endDate'] : new Date(),
            degree: !!(props.entry) && !!(props.entry['degree']) ? props.entry['degree'] : EducationDegree.BACHELOR,
            langLevel: !!(props.entry) && !!(props.entry['level']) ? props.entry['level'] : LanguageLevel.BASIC,
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
        if (!!oldProps.entry && !this.props.entry) {
            this.setState(this.defaultState({}));
        } else if (this.props.entry != oldProps.entry) {
            let date: Date;
            if (oldProps.type === 'QUALIFICATION') {
                date = this.props.entry && this.props.entry['date'] ? this.props.entry['date'] : new Date();
            } else {
                date = this.props.entry && this.props.entry['startDate'] ? this.props.entry['startDate'] : new Date();
            }

            this.setState({
                searchText: this.props.entry ? this.props.entry.nameEntity.name : '',
                startDate: date,
                endDate: this.props.entry && this.props.entry['endDate'] ? this.props.entry['endDate'] : new Date(),
                degree: this.props.entry && this.props.entry['degree'] ? this.props.entry['degree'] : EducationDegree.BACHELOR,
                langLevel: this.props.entry && this.props.entry['level'] ? this.props.entry['level'] : LanguageLevel.BASIC
            });
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

    private onStartDateChange = (date: Date) => {
        const startDate = new Date(date);
        startDate.setHours(12);
        this.setState({
            startDate
        });
    };

    private onEndDateChange = (date: Date) => {
        let endDate = new Date(date);
        endDate.setHours(12);
        this.setState({
            endDate
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
                    <Grid container spacing={1}>
                        <Grid item md={12} xs={12}>
                            <PwrAutoComplete
                                validationError={error}
                                fullWidth
                                label={PowerLocalize.get(`ProfileEntryType.${this.props.type}.AutoCompleteLabel`)}
                                id={'id'}
                                data={this.props.suggestions}
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
                                        placeholderDate={this.state.startDate}
                                        label={'Start'}
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
                                        placeholderDate={this.state.endDate}
                                        label={'Ende'}
                                        type={DatePickerType.MONTH_YEAR}/>
                                </Grid>
                        }
                        {
                            //degree
                            !(this.props.type === 'EDUCATION') ? <></> :
                                <Grid item md={12} xs={12}>
                                    <PwrAutoComplete
                                        fullWidth
                                        label={PowerLocalize.get(`ProfileEntryType.${this.props.type}.AutoCompleteLabel`)}
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
                                    <FormControl>
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
                    <PwrButton icon={null} color={'primary'} text={PowerLocalize.get('Action.Cancel')}
                               onClick={this.props.onClose}/>
                    <PwrButton icon={null} color={'primary'} disabled={!!error} text={PowerLocalize.get('Action.Save')}
                               onClick={()=>this.handleSave()}/>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ProfileEntryDialog: React.ComponentClass<ProfileEntryDialogLocalProps> = connect(ProfileEntryDialogModule.mapStateToProps, ProfileEntryDialogModule.mapDispatchToProps)(ProfileEntryDialogModule) as any;

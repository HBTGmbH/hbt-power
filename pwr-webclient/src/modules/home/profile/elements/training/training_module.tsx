import * as React from 'react';
import * as NameEntityNew from '../../../../../reducers/profile-new/profile/model/NameEntity';
import * as redux from 'redux';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {FurtherTraining, newTraining} from '../../../../../reducers/profile-new/profile/model/FurtherTraining';
import {isNullOrUndefined} from 'util';
import {LanguageLevel} from '../../../../../reducers/profile-new/profile/model/LanguageLevel';
import {Language} from '../../../../../reducers/profile-new/profile/model/Language';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import FormControl from '@material-ui/core/FormControl/FormControl';
import Select from '@material-ui/core/Select/Select';
import {PwrDatePicker} from '../../../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../../../model/DatePickerType';

interface TrainingProps {
    profileTraining: Array<FurtherTraining>,
    suggestions: Array<string>,
    initials: string,
}

interface TrainingLocalProps {

}

interface TrainingLocalState {
    selectId: number;
    addNew: boolean;
    searchText: string;
    selectLanguage: FurtherTraining;
    startDate: Date;
    endDate: Date;

}

interface TrainingDispatch {

    deleteTraining(initials: string, id: number): void;

    saveTraining(initials: string, id: number, name: NameEntityNew.NameEntity, start: Date, end: Date): void;
}

class TrainingSkills_module extends React.Component<TrainingProps & TrainingLocalProps & TrainingDispatch, TrainingLocalState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            selectId: -1,
            addNew: false,
            searchText: '',
            selectLanguage: null,
            startDate: new Date(),
            endDate: new Date()
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: TrainingLocalProps): TrainingProps {
        const trainings = (state.profileStore != null && state.profileStore.profile != null) ? state.profileStore.profile['training'] : [];
        const strings = state.suggestionStore.allTrainings.map(e => e.name);
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        return {
            profileTraining: trainings,
            suggestions: strings,
            initials: initials,

        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): TrainingDispatch {
        return {
            deleteTraining: (initials, id) => {
                dispatch(ProfileDataAsyncActionCreator.deleteTraining(initials, id));
            },
            saveTraining: (initials, id, name, start, end) => {
                dispatch(ProfileDataAsyncActionCreator.saveTraining(initials, newTraining(id, name, start, end)));
            }
        };
    }

    private singleTraining = (entry: FurtherTraining, id: number) => {
        return (<Grid key={id} item container alignItems={'flex-end'} spacing={8}
                      onClick={() => this.setState({selectId: id})}>

                <Grid item md={2}>
                    {
                        id != this.state.selectId ? <></> : <Grid>
                            <PwrIconButton iconName={'delete'} tooltip={'Löschen'}
                                           onClick={() => console.log('löschen' + entry.nameEntity.name)}/>
                            <PwrIconButton iconName={'add'} tooltip={'Bearbeiten'}
                                           onClick={() => console.log('bearbeiten' + entry.nameEntity.name)}/>
                        </Grid>
                    }
                </Grid>
                <Grid item>
                    <Typography variant={'h5'}> {entry.nameEntity.name} </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        variant={'body2'}>{entry.startDate} - {entry.endDate}</Typography>
                </Grid>
            </Grid>
        );
    };

    private handleUpdateButton = (isNew: boolean) => {

    };

    private renderAddEntry = () => {
        if (this.state.addNew) {
            return (
                <Grid key={'new'} item container spacing={8}>
                    <Grid item md={2}>
                        <PwrIconButton iconName={'save'} tooltip={'Löschen'}
                                       onClick={() => this.handleUpdateButton(true)}/>
                    </Grid>
                    <Grid item>
                        <PwrAutoComplete
                            label={PowerLocalize.get('Language.Singular')}
                            id={'Language.Dialog.AutoComplete.Language'}
                            data={this.props.suggestions}
                            searchTerm={this.state.searchText}
                            onSearchChange={(value) => this.setState({searchText: value})}
                        />
                    </Grid>
                    <Grid>
                        <PwrDatePicker onChange={() => {
                        }} placeholderDate={this.state.startDate} label={''} type={DatePickerType.MONTH_YEAR}/>
                    </Grid>
                </Grid>
            );
        }
        else return <></>;
    };

    render() {
        return (
            <div>
                <Grid container spacing={0} alignItems={'center'} style={{border: '1px'}}>
                    <Grid item md={9}>
                        <Typography variant={'h4'}>Weiterbildungen</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <Button variant={'outlined'}>NEU</Button>
                    </Grid>
                    <Grid item md={12}>
                        <hr style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            !isNullOrUndefined(this.props.profileTraining) && this.props.profileTraining.length > 0 ?
                                this.props.profileTraining.map(this.singleTraining) :
                                <Grid item>
                                    <Typography variant={'body1'}>
                                        Füge eine Weiterbildung hinzu
                                    </Typography>
                                </Grid>
                        }
                        {
                            this.renderAddEntry()
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const TrainingModule: React.ComponentClass<TrainingLocalProps> = connect(TrainingSkills_module.mapStateToProps, TrainingSkills_module.mapDispatchToProps)(TrainingSkills_module);

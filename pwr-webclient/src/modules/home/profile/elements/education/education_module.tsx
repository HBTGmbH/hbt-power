import * as React from 'react';
import * as NameEntityNew from '../../../../../reducers/profile-new/profile/model/NameEntity';
import * as redux from 'redux';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {Language, newLanguage} from '../../../../../reducers/profile-new/profile/model/Language';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {Education, newEducation} from '../../../../../reducers/profile-new/profile/model/Education';
import {isNullOrUndefined} from 'util';

interface EducationProps {
    profileEducations: Array<Education>
}

interface EducationLocalProps {

}

interface EducationLocalState {
    selectId: number;
}

interface EducationDispatch {

    deleteEducation(id: number): void;

    saveEducation(id: number, name: NameEntityNew.NameEntity, start: Date, end: Date, degree: string): void;
}

class Education_module extends React.Component<EducationProps & EducationLocalProps & EducationDispatch, EducationLocalState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            selectId: -1,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: EducationLocalProps): EducationProps {
        const entries = (state.profileStore != null && state.profileStore.profile != null) ? state.profileStore.profile.education : [];
        return {
            profileEducations: entries,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): EducationDispatch {
        return {
            deleteEducation: function (id: number) {
                dispatch(ProfileDataAsyncActionCreator.deleteEducation('ppp', id)); // TODO initials
            },
            saveEducation: (id, name, start, end, degree) => {
                dispatch(ProfileDataAsyncActionCreator.saveEducation('ppp', newEducation(id, name, start, end, degree)));
            }
        };
    }

    private singleEducation = (entry: Education, id: number) => {
        return (<Grid key={id} item container alignItems={'flex-end'} spacing={8}
                      onClick={() => this.setState({selectId: id})}>

                <Grid item container md={2}>
                    {
                        id != this.state.selectId ? <></> : <Grid item>
                            <PwrIconButton iconName={'delete'} tooltip={'Löschen'}
                                           onClick={() => console.log('löschen' + entry.nameEntity.name)}/>
                            <PwrIconButton iconName={'add'} tooltip={'Bearbeiten'}
                                           onClick={() => console.log('bearbeiten' + entry.nameEntity.name)}/>
                        </Grid>
                    }
                </Grid>
                <Grid item>
                    <Typography variant={'h5'}> {entry.nameEntity.name}</Typography>
                </Grid>
                <Grid item>
                    <Typography
                        variant={'body2'}> {entry.degree} | {entry.startDate} - {entry.endDate} </Typography>
                </Grid>
            </Grid>
        );
    };


    render() {
        return (
            <div>
                <Grid container spacing={0} alignItems={'center'} style={{border: '1px'}}>
                    <Grid item md={9}>
                        <Typography variant={'h4'}>Ausbildung</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <Button variant={'outlined'}>NEU</Button>
                    </Grid>
                    <Grid item md={12}>
                        <hr style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            !isNullOrUndefined(this.props.profileEducations) ?
                                this.props.profileEducations.map(this.singleEducation) :
                                <Grid item> <Typography variant={'body1'}>Füge einen Ausbildungschritt
                                    hinzu</Typography></Grid>
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const EducationModule: React.ComponentClass<EducationLocalProps> = connect(Education_module.mapStateToProps, Education_module.mapDispatchToProps)(Education_module);

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
import {Career, newCareer} from '../../../../../reducers/profile-new/profile/model/Career';
import {isNullOrUndefined} from 'util';

interface CareerProps {
    profileCareers: Array<Career>
}

interface CareerLocalProps {

}

interface CareerLocalState {
    selectId: number;
}

interface CareerDispatch {

    deleteCareer(id: number): void;

    saveCareer(id: number, name: NameEntityNew.NameEntity, startDate: Date, endDate: Date): void;
}

class Career_module extends React.Component<CareerProps & CareerLocalProps & CareerDispatch, CareerLocalState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            selectId: -1,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: CareerLocalProps): CareerProps {
        const entries = (state.profileStore != null && state.profileStore.profile != null) ? state.profileStore.profile['career'] : [];
        return {
            profileCareers: entries,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): CareerDispatch {
        return {
            deleteCareer: function (id: number) {
                dispatch(ProfileDataAsyncActionCreator.deleteCareer('ppp', id)); // TODO initials
            },
            saveCareer: (id, name, start, end) => {
                dispatch(ProfileDataAsyncActionCreator.saveCareer('ppp', newCareer(id, name, start, end)));
            }
        };
    }

    private singleCareer = (entry: Career, id: number) => {
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
                        variant={'body2'}> </Typography>
                </Grid>
            </Grid>
        );
    };


    render() {
        return (
            <div>
                <Grid container spacing={0} alignItems={'center'}>
                    <Grid item md={9}>
                        <Typography variant={'h4'}>Werdegang</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <Button variant={'outlined'}>NEU</Button>
                    </Grid>
                    <Grid item md={12}>
                        <hr style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            !isNullOrUndefined(this.props.profileCareers) ?
                                this.props.profileCareers.map(this.singleCareer) :
                                <Grid item> <Typography variant={'body1'}>Füge einen Werdegangschritt
                                    hinzu</Typography></Grid>
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const CareerModule: React.ComponentClass<CareerLocalProps> = connect(Career_module.mapStateToProps, Career_module.mapDispatchToProps)(Career_module);

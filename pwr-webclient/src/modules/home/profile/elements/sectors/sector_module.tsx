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
import {
    IndustrialSector,
    newIndustrialSector
} from '../../../../../reducers/profile-new/profile/model/IndustrialSector';
import {isNullOrUndefined} from 'util';

interface SectorProps {
    profileSectors: Array<IndustrialSector>
}

interface SectorLocalProps {

}

interface SectorLocalState {
    selectId: number;
}

interface SectorDispatch {

    deleteSector(id: number): void;

    saveSector(id: number, name: NameEntityNew.NameEntity): void;
}

class Sector_module extends React.Component<SectorProps & SectorLocalProps & SectorDispatch, SectorLocalState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            selectId: -1,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: SectorLocalProps): SectorProps {
        const entries = (state.profileStore != null && state.profileStore.profile != null) ? state.profileStore.profile.sectors : [];
        return {
            profileSectors: entries,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SectorDispatch {
        return {
            deleteSector: function (id: number) {
                dispatch(ProfileDataAsyncActionCreator.deleteSector('ppp', id)); // TODO initials
            },
            saveSector: (id, name) => {
                dispatch(ProfileDataAsyncActionCreator.saveSector('ppp', newIndustrialSector(id, name)));
            }
        };
    }

    private singleSector = (entry: IndustrialSector, id: number) => {
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
                <Grid container spacing={0} alignItems={'center'} style={{border: '1px'}}>
                    <Grid item md={9}>
                        <Typography variant={'h4'}>Industriesektor</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <Button variant={'outlined'}>NEU</Button>
                    </Grid>
                    <Grid item md={12}>
                        <hr style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            !isNullOrUndefined(this.props.profileSectors) ?
                                this.props.profileSectors.map(this.singleSector) :
                                <Grid item> <Typography variant={'body1'}>Füge einen Industriesektor
                                    hinzu</Typography></Grid>
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const SectorModule: React.ComponentClass<SectorLocalProps> = connect(Sector_module.mapStateToProps, Sector_module.mapDispatchToProps)(Sector_module);

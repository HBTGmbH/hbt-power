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
import {newQualification, Qualification} from '../../../../../reducers/profile-new/profile/model/Qualification';
import {isNullOrUndefined} from 'util';

interface QualificationProps {
    profileQualifications: Array<Qualification>
}

interface QualificationLocalProps {

}

interface QualificationLocalState {
    selectId: number;
}

interface QualificationDispatch {

    deleteQualification(id: number): void;

    saveQualification(id: number, name: NameEntityNew.NameEntity, date: Date): void;
}

class Qualification_module extends React.Component<QualificationProps & QualificationLocalProps & QualificationDispatch, QualificationLocalState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            selectId: -1,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: QualificationLocalProps): QualificationProps {
        const entries = (state.profileStore != null && state.profileStore.profile != null) ? state.profileStore.profile.qualification : [];
        return {
            profileQualifications: entries,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): QualificationDispatch {
        return {
            deleteQualification: function (id: number) {
                dispatch(ProfileDataAsyncActionCreator.deleteQualification('ppp', id)); // TODO initials
            },
            saveQualification: (id, name, date) => {
                dispatch(ProfileDataAsyncActionCreator.saveQualification('ppp', newQualification(id, name, date)));
            }
        };
    }

    private singleQualification = (entry: Qualification, id: number) => {
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
                        variant={'body2'}> {entry.date} </Typography>
                </Grid>
            </Grid>
        );
    };


    render() {
        return (
            <div>
                <Grid container spacing={0} alignItems={'center'} style={{border: '1px'}}>
                    <Grid item md={9}>
                        <Typography variant={'h4'}>Qualifikation</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <Button variant={'outlined'}>NEU</Button>
                    </Grid>
                    <Grid item md={12}>
                        <hr style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            !isNullOrUndefined(this.props.profileQualifications) ?
                                this.props.profileQualifications.map(this.singleQualification) :
                                <Grid item> <Typography variant={'body1'}>
                                    Füge eine Qualifikation hinzu
                                </Typography></Grid>
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const QualificationModule: React.ComponentClass<QualificationLocalProps> = connect(Qualification_module.mapStateToProps, Qualification_module.mapDispatchToProps)(Qualification_module);

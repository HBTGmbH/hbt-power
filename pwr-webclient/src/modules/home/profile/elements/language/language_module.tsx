import * as React from 'react';
import * as NameEntityNew from '../../../../../reducers/profile-new/model/NameEntity';
import * as redux from 'redux';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/ProfileDataAsyncActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {Language, newLanguage} from '../../../../../reducers/profile-new/model/Language';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import AddIcon from '@material-ui/icons/Add';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import {PwrIconButton} from '../../../../general/pwr-icon-button';

interface LanguageProps {
    profileLanguages: Array<Language>
}

interface LanguageLocalProps {

}

interface LanguageLocalState {
    selectId: number;
}

interface LanguageDispatch {

    deleteLanguageSkill(id: number): void;

    saveLanguageSkill(id: number, name: NameEntityNew.NameEntity, level: string): void;
}

class LanguageModuleCard extends React.Component<LanguageProps & LanguageLocalProps & LanguageDispatch, LanguageLocalState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            selectId: -1,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: LanguageLocalProps): LanguageProps {
        return {
            profileLanguages: state.profile.profile.languages,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): LanguageDispatch {
        return {
            deleteLanguageSkill: function (id: number) {
                dispatch(ProfileDataAsyncActionCreator.deleteLanguage('ppp', id)); // TODO initials
            },
            saveLanguageSkill: (id, name, level) => {
                dispatch(ProfileDataAsyncActionCreator.saveLanguage('ppp', newLanguage(id, name, level)));
            }
        };
    }

    private singleLanguage = (language: Language, id: number) => {
        return (<Grid item container alignItems={'flex-end'} spacing={8} onClick={() => this.setState({selectId:id})}>

                <Grid md={2}>
                    {
                        id != this.state.selectId ? <></> : <Grid>
                            <PwrIconButton iconName={'delete'} tooltip={'Löschen'} onClick={() => console.log("löschen")}/>
                            <PwrIconButton iconName={'add'} tooltip={'Bearbeiten'} onClick={() => console.log("bearbeiten")}/>
                        </Grid>
                    }
                </Grid>
                <Grid item>
                    <Typography variant={'h5'}> {language.nameEntity.name}</Typography>
                </Grid>
                <Grid item>
                    <Typography variant={'body2'}>{language.level}</Typography>
                </Grid>
            </Grid>
        );
    };


    render() {
        return (
            <div>
                <Grid container spacing={0} alignItems={'center'} style={{border: '1px'}}>
                    <Grid item md={9}>
                        <Typography variant={'h4'}>Sprachen</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <Button variant={'outlined'}>NEU</Button>
                    </Grid>
                    <Grid item md={12}>
                        <hr style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            this.props.profileLanguages.map(this.singleLanguage)
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const LanguageModule: React.ComponentClass<LanguageLocalProps> = connect(LanguageModuleCard.mapStateToProps, LanguageModuleCard.mapDispatchToProps)(LanguageModuleCard);
